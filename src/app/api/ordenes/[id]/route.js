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

// PATCH /api/ordenes/[id] — cancelar pedido pendiente
export async function PATCH(request, { params }) {
  const { id } = await params;
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
  if (pedido.estado_pago !== 'pendiente') {
    return NextResponse.json({ error: 'Solo podés cancelar pedidos pendientes' }, { status: 400 });
  }

  const { error } = await supabase
    .from('pedidos')
    .update({ estado_pago: 'cancelado' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
