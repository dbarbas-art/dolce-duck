import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { MercadoPagoConfig, Preference } from 'mercadopago';

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('id, user_id, estado_pago')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

  // ── Marcar como pagado (simulación webhook MP) ──
  if (action === 'marcar_pagado') {
    if (pedido.estado_pago === 'pagado' || pedido.estado_pago === 'approved') {
      return NextResponse.json({ ok: true, yaEstabaPagado: true });
    }

    const { data: filasActualizadas, error } = await supabase
      .from('pedidos')
      .update({ estado_pago: 'pagado' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('[PATCH marcar_pagado] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!filasActualizadas || filasActualizadas.length === 0) {
      return NextResponse.json({ error: '0 filas actualizadas. Revisá las políticas RLS.' }, { status: 403 });
    }

    revalidatePath('/ordenes');
    return NextResponse.json({ ok: true });
  }

  // ── Cancelar (acción por defecto) ──
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

  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

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
          failure: `${baseUrl}/checkout`,
          pending: `${baseUrl}/checkout`,
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
