export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
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

async function checkAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
  return data?.rol === 'admin' ? user : null;
}

function adminSB() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// GET /api/admin/productos — todos los productos
export async function GET() {
  const supabase = await createClient();
  const admin = await checkAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ productos: data });
}

// POST /api/admin/productos — crear producto
export async function POST(request) {
  const supabase = await createClient();
  const admin = await checkAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const body = await request.json();
  const { name, slogan, precio, tipo, stock, img, active } = body;

  if (!name?.trim() || !precio) {
    return NextResponse.json({ error: 'Nombre y precio son obligatorios' }, { status: 400 });
  }

  const { data, error } = await adminSB()
    .from('products')
    .insert({ name: name.trim(), slogan: slogan || null, precio: Number(precio), tipo: tipo || 'normal', stock: Number(stock) || 0, img: img || null, active: active !== false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ producto: data }, { status: 201 });
}
