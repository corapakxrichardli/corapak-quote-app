'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { QuoteFormState } from '@/lib/quoteTypes';

interface Props {
  data: QuoteFormState;
  update: (patch: Partial<QuoteFormState>) => void;
}

export function OpportunityStep({ data, update }: Props) {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPaymentTerms, setNewCustomerPaymentTerms] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.customers.list().then(setCustomers).catch(() => setCustomers([]));
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCustomerName.trim();
    if (!name) {
      setError('Customer name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await api.customers.create({
        name,
        default_payment_terms: newCustomerPaymentTerms.trim() || undefined,
      });
      setCustomers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      update({ customer_id: created.id });
      setNewCustomerName('');
      setNewCustomerPaymentTerms('');
      setShowAddCustomer(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Opportunity Information</h2>

      <div>
        <label className="block text-sm font-medium text-slate-700">Customer</label>
        <div className="mt-1 flex gap-2">
          <select
            value={data.customer_id || ''}
            onChange={(e) => update({ customer_id: e.target.value || null })}
            className="block flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddCustomer(true)}
            className="shrink-0 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add new
          </button>
        </div>
      </div>

      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !saving && setShowAddCustomer(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Add New Customer</h3>
            <form onSubmit={handleAddCustomer} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="e.g. Acme Corp"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Default Payment Terms (optional)</label>
                <input
                  type="text"
                  value={newCustomerPaymentTerms}
                  onChange={(e) => setNewCustomerPaymentTerms(e.target.value)}
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="e.g. Net 30"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  disabled={saving}
                  className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Adding…' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Project / Product Name</label>
        <input
          type="text"
          value={data.project_name}
          onChange={(e) => update({ project_name: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. Acme Box Line"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Sales Rep</label>
        <input
          type="text"
          value={data.sales_rep}
          onChange={(e) => update({ sales_rep: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Quote Date</label>
          <input
            type="date"
            value={data.quote_date}
            onChange={(e) => update({ quote_date: e.target.value })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Expected Close Date</label>
          <input
            type="date"
            value={data.expected_close_date}
            onChange={(e) => update({ expected_close_date: e.target.value })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Opportunity Size</label>
          <input
            type="number"
            value={data.opportunity_size ?? ''}
            onChange={(e) => update({ opportunity_size: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Confidence Level</label>
          <select
            value={data.confidence_level}
            onChange={(e) => update({ confidence_level: e.target.value })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Internal Notes</label>
        <textarea
          value={data.opportunity_notes}
          onChange={(e) => update({ opportunity_notes: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
