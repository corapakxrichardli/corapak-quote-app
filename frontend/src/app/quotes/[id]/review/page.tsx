'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function QuoteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [quote, setQuote] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.quotes.get(id).then(setQuote).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (quote?.id) {
      api.quotes.preview(id).then(setPreview).catch(() => setPreview(null));
    }
  }, [quote?.id, id]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        customer_id: quote.customer_id,
        sales_rep: quote.sales_rep,
        quote_date: quote.quote_date,
        expected_close_date: quote.expected_close_date,
        opportunity_notes: quote.opportunity_notes,
        project_name: quote.project_name,
        opportunity_size: quote.opportunity_size,
        confidence_level: quote.confidence_level,
        product_config: quote.product_config || {},
        quoted_quantity: quote.quoted_quantity,
        annual_forecast_volume: quote.annual_forecast_volume,
        commitment_type: quote.commitment_type,
        payment_terms: quote.payment_terms,
        target_price: quote.target_price,
        margin_target: quote.margin_target,
        customer_commitment_id: quote.customer_commitment_id,
        customer_commitment_details: quote.customer_commitment_details || {},
      };
      await api.quotes.update(id, payload);
      setQuote((q: any) => q && { ...q, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshPreview = async () => {
    try {
      const p = await api.quotes.preview(id);
      setPreview(p);
    } catch (e) {
      console.error(e);
      alert('Failed to load preview');
    }
  };

  if (loading || !quote) return <div className="p-8">Loading...</div>;

  const warnings = quote.warnings_json || [];
  const assumptions = quote.assumptions_json || {};

  const assumptionLabels: Record<string, string> = {
    base_product_cost: 'Base product cost (per unit)',
    commercial_adjustment_pct: 'Commercial adjustment',
    import_duty_rate_pct: 'Import duty rate',
  };

  const formatAssumptionValue = (key: string, value: unknown): string => {
    const n = Number(value);
    if (key.endsWith('_pct') && !Number.isNaN(n)) return `${n}%`;
    if ((key.includes('cost') || key.includes('price')) && !Number.isNaN(n)) return `$${n.toFixed(2)}`;
    return String(value);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/quotes" className="text-sm text-slate-600 hover:text-slate-900">← Back to Quotes</Link>
          <Link href={`/quotes/${id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Edit Quote
          </Link>
        </div>

        <h1 className="text-2xl font-bold">Internal Review: {quote.project_name || 'Quote'}</h1>
        <p className="mt-1 text-slate-600">{quote.customer_name} • {quote.quoted_quantity?.toLocaleString()} units</p>

        {quote.approval_required && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <strong>Approval required</strong> – This quote has been flagged for manual review.
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-medium text-amber-900">Warnings</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {warnings.map((w: any, i: number) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Pricing Summary</h2>
            <dl className="mt-4 space-y-2">
              <div className="flex justify-between">
                <dt className="text-slate-600">Unit Price</dt>
                <dd className="font-medium">${quote.calculated_unit_price != null ? Number(quote.calculated_unit_price).toFixed(2) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Tooling</dt>
                <dd className="font-medium">${Number(quote.tooling_charges || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Logistics</dt>
                <dd className="font-medium">${Number(quote.logistics_charges || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Import Duty</dt>
                <dd className="font-medium">${Number(quote.import_duty_charges || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Handling</dt>
                <dd className="font-medium">${Number(quote.handling_charges || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Storage</dt>
                <dd className="font-medium">${Number(quote.storage_charges || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="font-medium">Total Quote Value</dt>
                <dd className="font-bold">${quote.total_quote_value != null ? Number(quote.total_quote_value).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Estimated Margin</dt>
                <dd className="font-medium">{quote.estimated_margin != null ? `${quote.estimated_margin}%` : '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Assumptions</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {Object.entries(assumptions).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4">
                  <span className="text-slate-600">{assumptionLabels[k] ?? k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                  <span className="font-medium text-slate-900">{formatAssumptionValue(k, v)}</span>
                </li>
              ))}
              {Object.keys(assumptions).length === 0 && <li className="text-slate-400">No assumptions recorded</li>}
            </ul>
          </div>
        </div>

        {preview && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold">Customer-Facing Preview</h2>
            <p className="mt-2 text-sm text-slate-600">{preview.product_description}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-slate-600">Quantity</dt>
              <dd className="font-medium text-slate-900">{preview.quantity?.toLocaleString() ?? '—'}</dd>
              <dt className="text-slate-600">Unit price</dt>
              <dd className="font-medium text-slate-900">${Number(preview.unit_price ?? 0).toFixed(2)}</dd>
              <dt className="text-slate-600">Tooling</dt>
              <dd className="font-medium text-slate-900">${Number(preview.tooling_fees ?? 0).toLocaleString()}</dd>
              <dt className="text-slate-600">Freight & delivery</dt>
              <dd className="font-medium text-slate-900">
                {typeof preview.freight_terms === 'string' && preview.freight_terms.startsWith('Customer commitment: ')
                  ? preview.freight_terms.replace('Customer commitment: ', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  : preview.freight_terms ?? 'To be confirmed'}
              </dd>
              {preview.lead_time_assumptions && (
                <>
                  <dt className="text-slate-600">Lead time</dt>
                  <dd className="font-medium text-slate-900">{preview.lead_time_assumptions}</dd>
                </>
              )}
              {preview.validity_period && (
                <>
                  <dt className="text-slate-600">Quote valid for</dt>
                  <dd className="font-medium text-slate-900">{preview.validity_period}</dd>
                </>
              )}
              {Array.isArray(preview.exclusions) && preview.exclusions.length > 0 && (
                <>
                  <dt className="text-slate-600 border-t pt-2">Exclusions</dt>
                  <dd className="text-slate-900 border-t pt-2">
                    <ul className="list-disc space-y-0.5 pl-4">
                      {preview.exclusions.map((ex: string, i: number) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={handleRefreshPreview}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Refresh Preview
          </button>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-400" disabled title="Coming in Phase 2">
            Export PDF (Phase 2)
          </button>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-400" disabled title="Coming in Phase 2">
            Push to Odoo (Phase 2)
          </button>
        </div>
      </div>
    </main>
  );
}
