'use client';

import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
];

function createSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabase();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/admin/login');
      } else {
        setUserEmail(user.email ?? '');
        setChecking(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function handleLogout() {
    const supabase = createSupabase();
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-mono-label text-xs uppercase tracking-widest text-umber">Loading…</p>
      </div>
    );
  }

  const activeLabel =
    NAV_ITEMS.find(item => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)))?.label ??
    'Admin';

  return (
    <div className="min-h-screen flex bg-ivory">
      {/* Sidebar */}
      <aside
        className={`w-60 shrink-0 bg-espresso flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/" target="_blank">
            <h1 className="font-display text-lg text-brass">Wear The Originals</h1>
          </Link>
          <p className="font-mono-label text-[0.65rem] uppercase tracking-widest text-white/50 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(item => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`block px-6 py-3 font-mono-label text-xs uppercase tracking-wider border-l-2 transition-colors ${
                  active ? 'border-brass text-brass bg-white/5' : 'border-transparent text-white/60 hover:text-white/90'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <p className="text-xs text-white/50 truncate mb-3">{userEmail}</p>
          <button
            onClick={handleLogout}
            className="w-full border border-white/15 text-white/70 hover:bg-white/10 hover:text-white py-2.5 font-mono-label text-xs uppercase tracking-widest transition-colors"
          >
            Sign Out
          </button>
          <Link
            href="/"
            target="_blank"
            className="block text-center mt-3 text-xs text-white/50 hover:text-brass transition-colors"
          >
            ↗ View Store
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-60">
        <div className="h-15 shrink-0 bg-ivory border-b border-(--hairline) flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(p => !p)} className="md:hidden text-espresso p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p className="font-display text-base text-espresso">{activeLabel}</p>
        </div>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/login') return <>{children}</>;
  return <AdminShell>{children}</AdminShell>;
}
