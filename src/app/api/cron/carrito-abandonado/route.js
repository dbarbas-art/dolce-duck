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
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch {}
        },
      },
    }
  );
}

// GET /api/cron/carrito-abandonado
// Simula el envío de emails a usuarios con carritos abandonados hace +24hs.
// En producción reemplazar console.log por llamada a Resend / SendGrid / etc.
export async function GET() {
  const supabase = await createClient();

  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Items del carrito creados hace más de 24 horas
  const { data: itemsAbandonados, error } = await supabase
    .from('carrito')
    .select('user_id, name, created_at')
    .lt('created_at', hace24h);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!itemsAbandonados || itemsAbandonados.length === 0) {
    return NextResponse.json({
      mensaje: 'No hay carritos abandonados en las últimas 24 horas.',
      notificados: 0,
      timestamp: new Date().toISOString(),
    });
  }

  // Agrupar productos por usuario
  const porUsuario = itemsAbandonados.reduce((acc, item) => {
    if (!acc[item.user_id]) acc[item.user_id] = [];
    acc[item.user_id].push(item.name);
    return acc;
  }, {});

  const userIds = Object.keys(porUsuario);

  // Obtener emails desde la tabla "usuarios"
  const { data: usuariosData } = await supabase
    .from('usuarios')
    .select('id, email')
    .in('id', userIds);

  const emailsMap = {};
  (usuariosData || []).forEach(u => { emailsMap[u.id] = u.email; });

  // Simular envío de email por cada usuario
  const simulacion = userIds.map(userId => {
    const email = emailsMap[userId] ?? `usuario-${userId.slice(0, 8)}@desconocido`;
    const productos = porUsuario[userId];

    const cuerpoEmail = `¡Hola! Dejaste ${productos.join(', ')} en tu carrito de Dolce Duck, ¿querés finalizar tu pedido? 🛒`;

    // ── En producción: await resend.emails.send({ to: email, subject: '...', html: ... }) ──
    console.log(`[CRON carrito-abandonado] → ${email}: "${cuerpoEmail}"`);

    return {
      userId,
      email,
      productos,
      mensaje: cuerpoEmail,
    };
  });

  return NextResponse.json({
    mensaje: `Se simularían ${simulacion.length} email(s) de carrito abandonado.`,
    notificados: simulacion.length,
    detalle: simulacion,
    timestamp: new Date().toISOString(),
  });
}
