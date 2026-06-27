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

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// POST /api/ordenes
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { nombre_cliente, telefono, direccion, notas, metodo_pago, metodo_entrega, fecha, horario } =
    await request.json();

  // Fuente de verdad: carrito desde la BD
  const { data: itemsCarrito, error: errorCarrito } = await supabase
    .from('carrito')
    .select('*')
    .eq('user_id', user.id);

  if (errorCarrito) {
    return NextResponse.json({ error: errorCarrito.message }, { status: 500 });
  }
  if (!itemsCarrito || itemsCarrito.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
  }

  // Total calculado en el servidor
  const total = itemsCarrito.reduce((acc, item) => acc + item.precio, 0);

  // Extraer sabores y agregados de opciones para columnas indexadas
  const sabores = [...new Set(
    itemsCarrito.map(item => item.opciones?.sabor).filter(Boolean)
  )];

  const agregados = [...new Set(
    itemsCarrito.flatMap(item => {
      const agg = item.opciones?.agregados;
      if (!agg) return [];
      return Array.isArray(agg) ? agg : [agg];
    })
  )];

  // Insertar pedido con user_id
  const { data: pedido, error: errorPedido } = await supabase
    .from('pedidos')
    .insert({
      user_id: user.id,
      nombre_cliente,
      telefono,
      direccion,
      items: itemsCarrito,
      total,
      estado_pago: 'pendiente',
      notas: notas || null,
      comentarios: notas || null,
      sabores: sabores.length ? sabores : null,
      agregados: agregados.length ? agregados : null,
      metodo_pago: metodo_pago || null,
      metodo_entrega: metodo_entrega || null,
      fecha_estimada: fecha || null,
      horario_estimado: horario || null,
    })
    .select('id')
    .single();

  if (errorPedido) {
    return NextResponse.json({ error: errorPedido.message }, { status: 500 });
  }

  // Generar preferencia de Mercado Pago
  let init_point = null;
  try {
    const preferenceClient = new Preference(mpClient);
    const mpResponse = await preferenceClient.create({
      body: {
        items: [
          {
            title: 'Pedido Dolce Duck',
            quantity: 1,
            unit_price: total,
            currency_id: 'ARS',
          },
        ],
        external_reference: String(pedido.id),
        back_urls: {
          success: 'http://localhost:3000/ordenes',
          failure: 'http://localhost:3000/checkout',
          pending: 'http://localhost:3000/ordenes',
        },
        auto_return: 'approved',
      },
    });

    init_point = mpResponse.init_point;

    // Guardar el preference id en el pedido
    await supabase
      .from('pedidos')
      .update({ mp_preference_id: mpResponse.id })
      .eq('id', pedido.id);
  } catch (mpError) {
    console.error('Error al crear preferencia MP:', mpError);
    // No se interrumpe el flujo: el pedido ya está guardado
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ordenes: data });
}
