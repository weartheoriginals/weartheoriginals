'use client';

import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Stats {
  totalProducts: number;
  totalCategories: number;
}

function createSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalCategories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/products?limit=1', { headers }),
          fetch('/api/admin/categories', { headers }),
        ]);
        const [productsData, categoriesData] = await Promise.all([productsRes.json(), categoriesRes.json()]);

        setStats({
          totalProducts: productsData.success ? productsData.data.total : 0,
          totalCategories: categoriesData.success ? categoriesData.data.length : 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: 'Products', value: stats.totalProducts, href: '/admin/products' },
    { label: 'Categories', value: stats.totalCategories, href: '/admin/categories' },
  ];

  const quickActions = [
    { label: 'Add a product', desc: 'Create a new listing', href: '/admin/products' },
    { label: 'Add a category', desc: 'Organize your catalog', href: '/admin/categories' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-espresso mb-1">Dashboard</h2>
        <p className="text-sm text-umber">An overview of your store.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8 max-w-lg">
        {statCards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-(--hairline) bg-ivory p-5 hover:border-saddle transition-colors"
          >
            <p className="font-display text-3xl text-espresso leading-none mb-1">{loading ? '—' : card.value}</p>
            <p className="font-mono-label text-xs uppercase tracking-wider text-umber">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="border border-(--hairline) bg-ivory max-w-lg">
        <div className="px-5 py-4 border-b border-(--hairline)">
          <h3 className="font-display text-base text-espresso">Quick actions</h3>
        </div>
        <div className="p-3 space-y-1">
          {quickActions.map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between px-3 py-3 border border-transparent hover:border-[var(--hairline)] transition-colors"
            >
              <div>
                <p className="text-sm text-espresso">{action.label}</p>
                <p className="text-xs text-umber">{action.desc}</p>
              </div>
              <span className="text-saddle">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
