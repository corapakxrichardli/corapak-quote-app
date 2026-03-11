'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function QuotesListPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.quotes.list().then(setQuotes).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quotes</h1>
          <Link href="/quotes/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            New Quote
          </Link>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No quotes yet. <Link href="/quotes/new" className="text-slate-900 underline">Create one</Link>
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{q.project_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{q.customer_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{q.quoted_quantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{q.total_quote_value != null ? `$${Number(q.total_quote_value).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${q.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{q.quote_date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/quotes/${q.id}/review`} className="text-sm font-medium text-slate-900 hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
