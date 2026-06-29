import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNav from './AdminNav';
import '../../styles/admin.css';

export const metadata = { title: 'Admin | Dolce Duck' };

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (perfil?.rol !== 'admin') redirect('/');

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="admin-brand">
          <span className="admin-badge">🛡️ Admin</span>
          <h1>Panel de Administración</h1>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
