'use client';

import type { QuoteFormState } from '@/lib/quoteTypes';

interface Props {
  data: QuoteFormState;
  update: (patch: Partial<QuoteFormState>) => void;
}

export function ProductSpecStep({ data, update }: Props) {
  const pc = data.product_config;

  const patchProduct = (patch: Partial<QuoteFormState['product_config']>) => {
    update({ product_config: { ...pc, ...patch } });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Product Specification</h2>

      <div>
        <label className="block text-sm font-medium text-slate-700">Product Family</label>
        <select
          value={pc.product_family}
          onChange={(e) => patchProduct({ product_family: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="corrugated_box">Corrugated Box</option>
          <option value="rigid_box">Rigid Box</option>
          <option value="flexible_packaging">Flexible Packaging</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Length (cm)</label>
          <input
            type="number"
            value={pc.dimensions?.length ?? ''}
            onChange={(e) => patchProduct({ dimensions: { ...pc.dimensions, length: e.target.value ? Number(e.target.value) : undefined } })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Width (cm)</label>
          <input
            type="number"
            value={pc.dimensions?.width ?? ''}
            onChange={(e) => patchProduct({ dimensions: { ...pc.dimensions, width: e.target.value ? Number(e.target.value) : undefined } })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Height (cm)</label>
          <input
            type="number"
            value={pc.dimensions?.height ?? ''}
            onChange={(e) => patchProduct({ dimensions: { ...pc.dimensions, height: e.target.value ? Number(e.target.value) : undefined } })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Material</label>
          <input
            type="text"
            value={pc.material}
            onChange={(e) => patchProduct({ material: e.target.value })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. Kraft"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            value={pc.weight ?? ''}
            onChange={(e) => patchProduct({ weight: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Finish</label>
        <input
          type="text"
          value={pc.finish}
          onChange={(e) => patchProduct({ finish: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="printing"
          checked={pc.printing}
          onChange={(e) => patchProduct({ printing: e.target.checked })}
          className="rounded border-slate-300"
        />
        <label htmlFor="printing" className="text-sm font-medium text-slate-700">Printing / Branding</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Packaging Configuration</label>
        <input
          type="text"
          value={pc.packaging_configuration}
          onChange={(e) => patchProduct({ packaging_configuration: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Pallet Configuration</label>
        <input
          type="text"
          value={pc.pallet_configuration}
          onChange={(e) => patchProduct({ pallet_configuration: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="mold_required"
          checked={pc.mold_required}
          onChange={(e) => patchProduct({ mold_required: e.target.checked })}
          className="rounded border-slate-300"
        />
        <label htmlFor="mold_required" className="text-sm font-medium text-slate-700">Mold / Tooling Required</label>
      </div>

      {pc.mold_required && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Estimated Mold Cost</label>
          <input
            type="number"
            value={pc.mold_cost ?? ''}
            onChange={(e) => patchProduct({ mold_cost: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Special Requirements</label>
        <textarea
          value={pc.special_requirements}
          onChange={(e) => patchProduct({ special_requirements: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
          rows={2}
        />
      </div>
    </div>
  );
}
