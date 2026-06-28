export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

// POST /api/ordenes
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { nombre_cliente, telefono, direccion, notas, fecha } =
    await request.json();

  // Fuente de verdad: carrito desde la BD
  const { data: itemsCarrito, error: errorCarrito } = await supabase
    .from('carrito')
    .select('*')
    .eq('user_id', user.id);

  if (errorCarrito) {
    console.error('[ordenes] Error al leer carrito:', errorCarrito);
    return NextResponse.json({ error: errorCarrito.message }, { status: 500 });
  }
  if (!itemsCarrito || itemsCarrito.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
  }

  // Total calculado en el servidor (Number() previene concatenación si precio viene como string)
  const total = itemsCarrito.reduce((acc, item) => acc + Number(item.precio), 0);

  const payload = {
    user_id: user.id,
    nombre_cliente,
    telefono,
    direccion,
    items: itemsCarrito,
    total,
    estado_pago: 'pendiente',
    notas: notas || null,
    fecha_estimada: fecha || null,
  };

  console.log('[ordenes] Insertando pedido con payload:', JSON.stringify(payload, null, 2));

  const { data: pedido, error: errorPedido } = await supabase
    .from('pedidos')
    .insert(payload)
    .select('id')
    .single();

  if (errorPedido) {
    console.error('[ordenes] Error al insertar pedido:', errorPedido);
    return NextResponse.json({ error: errorPedido.message }, { status: 500 });
  }

  console.log('[ordenes] Pedido creado con id:', pedido.id);

  // Generar preferencia de Mercado Pago
  let init_point = null;
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN no definido');

    const mpClient = new MercadoPagoConfig({ accessToken: token });
    const preferenceClient = new Preference(mpClient);

    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';

    const itemsMercadoPago = [
      {
        title: 'Pedido Dolce Duck',
        quantity: 1,
        unit_price: total,
        currency_id: 'ARS',
      },
    ];

    const preferenceData = {
      body: {
        items: itemsMercadoPago,
        external_reference: String(pedido.id),
        back_urls: {
          success: `${baseUrl}/pago-exitoso`,
          failure: `${baseUrl}/checkout`,
          pending: `${baseUrl}/checkout`,
        },
        auto_return: 'approved',
      },
    };

    console.log('[MP] preferenceData enviado:', JSON.stringify(preferenceData, null, 2));

    const mpResponse = await preferenceClient.create(preferenceData);

    init_point = mpResponse.init_point;
    console.log('[ordenes] init_point generado:', init_point);

    await supabase
      .from('pedidos')
      .update({ mp_preference_id: mpResponse.id })
      .eq('id', pedido.id);
  } catch (mpError) {
    console.error('[ordenes] Error al crear preferencia MP:', mpError);
    // El pedido ya está guardado; el frontend mostrará error de pago
  }

  // Vaciar carrito
  await supabase.from('carrito').delete().eq('user_id', user.id);

  return NextResponse.json({ pedidoId: pedido.id, total, init_point });
}

// GET /api/ordenes — historial del usuario autenticado
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ordenes] Error al leer historial:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ordenes: data });
}
