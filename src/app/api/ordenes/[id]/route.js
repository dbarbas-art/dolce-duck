import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Cliente admin con service role — bypassa RLS, solo para operaciones de servidor
function createAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch {}
        },
      },
    }
  );
}

// PATCH /api/ordenes/[id] — cancelar pedido o marcarlo como pagado
export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { action = 'cancelar' } = body;

  // Verificar sesión con cliente normal (necesita cookies del usuario)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // ── Marcar como pagado (redirect de Mercado Pago) ──────────────────────────
  // Usa admin client en TODO el flujo para evitar que RLS bloquee la operación.
  // La verificación de ownership se hace explícitamente en JS.
  if (action === 'marcar_pagado') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[marcar_pagado] SUPABASE_SERVICE_ROLE_KEY no está configurada');
      return NextResponse.json({ error: 'Configuración incompleta del servidor' }, { status: 500 });
    }

    const adminSupabase = createAdminClient();

    // SELECT con admin client — bypassa RLS, no puede ser bloqueado por políticas
    const { data: pedido, error: selectError } = await adminSupabase
      .from('pedidos')
      .select('id, user_id, estado_pago')
      .eq('id', id)
      .single();

    if (selectError || !pedido) {
      console.error('[marcar_pagado] Pedido no encontrado. id:', id, '| error:', selectError?.message);
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Verificación de propiedad explícita (reemplaza lo que haría RLS)
    if (pedido.user_id !== user.id) {
      console.error('[marcar_pagado] Intento no autorizado. pedido.user_id:', pedido.user_id, '| user.id:', user.id);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Idempotencia: si ya está pagado, OK sin hacer nada
    if (pedido.estado_pago === 'pagado' || pedido.estado_pago === 'approved') {
      return NextResponse.json({ ok: true, yaEstabaPagado: true });
    }

    const { referencia_pago } = body;

    // UPDATE con admin client — bypassa RLS
    const { error: updateError } = await adminSupabase
      .from('pedidos')
      .update({
        estado_pago:     'pagado',
        referencia_pago: referencia_pago ?? null,
        pagado_en:       new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[marcar_pagado] Error al actualizar:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    revalidatePath('/ordenes');
    return NextResponse.json({ ok: true });
  }

  // ── Cancelar (acción por defecto) ───────────────────────────────────────────
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('id, user_id, estado_pago')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

  if (pedido.estado_pago !== 'pendiente') {
    return NextResponse.json({ error: 'Solo podés cancelar pedidos pendientes' }, { status: 400 });
  }

  const { data: filasActualizadas, error } = await supabase
    .from('pedidos')
    .update({ estado_pago: 'cancelado' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) {
    console.error('[PATCH cancelar] Error Supabase:', error);
    return NextResponse.json({ error: `Error de base de datos: ${error.message}` }, { status: 500 });
  }
  if (!filasActualizadas || filasActualizadas.length === 0) {
    console.error('[PATCH cancelar] 0 filas actualizadas — id:', id, '| user:', user.id);
    return NextResponse.json({
      error: 'El pedido no pudo actualizarse (0 filas afectadas). Revisá las políticas RLS de la tabla "pedidos" en Supabase.',
    }, { status: 403 });
  }

  revalidatePath('/ordenes');
  return NextResponse.json({ ok: true });
}

// GET /api/ordenes/[id] — genera un nuevo init_point de MP para retomar el pago
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('id, user_id, estado_pago, total')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (pedidoError || !pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  if (pedido.estado_pago !== 'pendiente') {
    return NextResponse.json({ error: 'Solo podés retomar pedidos pendientes' }, { status: 400 });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'Mercado Pago no configurado' }, { status: 500 });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dolce-duck.vercel.app';

  try {
    const mpClient = new MercadoPagoConfig({ accessToken: token });
    const preferenceClient = new Preference(mpClient);

    const mpResponse = await preferenceClient.create({
      body: {
        items: [{
          title: 'Pedido Dolce Duck',
          quantity: 1,
          unit_price: Number(pedido.total),
          currency_id: 'ARS',
        }],
        external_reference: String(pedido.id),
        back_urls: {
          success: `${baseUrl}/pago-exitoso`,
          failure: `${baseUrl}/ordenes`,
          pending: `${baseUrl}/ordenes`,
        },
        auto_return: 'approved',
      },
    });

    await supabase
      .from('pedidos')
      .update({ mp_preference_id: mpResponse.id })
      .eq('id', id);

    return NextResponse.json({ init_point: mpResponse.init_point });
  } catch (err) {
    console.error('[ordenes/retomar] Error MP:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
