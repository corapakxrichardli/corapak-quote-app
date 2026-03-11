'use client';

import type { QuoteFormState } from '@/lib/quoteTypes';

interface Props {
  data: QuoteFormState;
  update: (patch: Partial<QuoteFormState>) => void;
}

export function CommercialTermsStep({ data, update }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Commercial Terms</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Quoted Quantity</label>
          <input
            type="number"
            min={1}
            value={data.quoted_quantity}
            onChange={(e) => update({ quoted_quantity: Number(e.target.value) || 1000 })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Annual Forecast Volume</label>
          <input
            type="number"
            value={data.annual_forecast_volume ?? ''}
            onChange={(e) => update({ annual_forecast_volume: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Commitment Type</label>
        <select
          value={data.commitment_type}
          onChange={(e) => update({ commitment_type: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="spot_order">Spot Order</option>
          <option value="annual_contract">Annual Contract</option>
          <option value="blanket_order">Blanket Order</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Payment Terms</label>
        <select
          value={data.payment_terms}
          onChange={(e) => update({ payment_terms: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="Net 15">Net 15</option>
          <option value="Net 30">Net 30</option>
          <option value="Net 60">Net 60</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Target Price (optional)</label>
          <input
            type="number"
            step="0.01"
            value={data.target_price ?? ''}
            onChange={(e) => update({ target_price: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Unit price target"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Margin Target (%)</label>
          <input
            type="number"
            value={data.margin_target}
            onChange={(e) => update({ margin_target: Number(e.target.value) || 25 })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
