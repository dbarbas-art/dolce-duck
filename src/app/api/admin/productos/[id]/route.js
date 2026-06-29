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

// PATCH /api/admin/productos/[id] — editar producto o toggle active
export async function PATCH(request, { params }) {
  const supabase = await createClient();
  const admin = await checkAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const campos = {};
  if (body.name     !== undefined) campos.name     = body.name;
  if (body.slogan   !== undefined) campos.slogan   = body.slogan;
  if (body.precio   !== undefined) campos.precio   = Number(body.precio);
  if (body.tipo     !== undefined) campos.tipo     = body.tipo;
  if (body.stock    !== undefined) campos.stock    = Number(body.stock);
  if (body.img      !== undefined) campos.img      = body.img;
  if (body.active   !== undefined) campos.active   = body.active;

  if (Object.keys(campos).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
  }

  const { data, error } = await adminSB()
    .from('products')
    .update(campos)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ producto: data });
}

// DELETE /api/admin/productos/[id] — eliminar producto
export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const admin = await checkAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { id } = await params;

  const { error } = await adminSB()
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
