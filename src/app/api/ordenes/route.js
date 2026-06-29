export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

  const { nombre_cliente, telefono, direccion, notas, fecha, metodo_pago } =
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

  // Invocar stored procedure — transacción atómica con validación de stock
  const { data: resultado, error: errorRpc } = await supabase.rpc(
    'crear_orden_completa',
    {
      p_nombre_cliente: nombre_cliente,
      p_telefono:       telefono,
      p_direccion:      direccion,
      p_total:          total,
      p_notas:          notas ?? null,
      p_fecha_estimada: fecha ?? null,
      p_metodo_pago:    metodo_pago ?? 'mercadopago',
      p_items:          itemsCarrito,
    }
  );

  if (errorRpc) {
    console.error('[ordenes] Error en crear_orden_completa:', errorRpc);

    // Stock insuficiente → 422 Unprocessable Entity para que el frontend lo muestre
    if (errorRpc.message?.includes('Stock insuficiente')) {
      return NextResponse.json({ error: errorRpc.message }, { status: 422 });
    }
    return NextResponse.json({ error: errorRpc.message }, { status: 500 });
  }

  // Vaciar carrito — el pedido quedó registrado y el stock descontado
  await supabase.from('carrito').delete().eq('user_id', user.id);

  return NextResponse.json({ pedidoId: resultado.pedido_id, total });
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
    .neq('estado_pago', 'cancelado')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ordenes] Error al leer historial:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ordenes: data }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
