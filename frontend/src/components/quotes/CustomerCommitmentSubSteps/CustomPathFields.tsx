'use client';

interface Props {
  details: Record<string, unknown>;
  update: (patch: Record<string, unknown>) => void;
}

export function CustomPathFields({ details, update }: Props) {
  return (
    <div className="mt-4 space-y-4 rounded border border-amber-200 bg-amber-50 p-4">
      <h3 className="font-medium text-amber-900">Custom Path – Manual Review Required</h3>
      <div>
        <label className="block text-sm text-amber-800">Custom fulfillment notes</label>
        <textarea
          value={String(details.custom_notes ?? '')}
          onChange={(e) => update({ custom_notes: e.target.value })}
          className="mt-1 block w-full rounded border border-amber-300 px-2 py-1.5 text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm text-amber-800">Manual logistics estimate ($)</label>
        <input
          type="number"
          value={Number(details.manual_logistics_estimate ?? '') || ''}
          onChange={(e) => update({ manual_logistics_estimate: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1 block w-full rounded border border-amber-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-amber-800">Manual import duty estimate ($)</label>
        <input
          type="number"
          value={Number(details.manual_import_duty_estimate ?? '') || ''}
          onChange={(e) => update({ manual_import_duty_estimate: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1 block w-full rounded border border-amber-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="approval"
          checked={!!details.approval_required}
          onChange={(e) => update({ approval_required: e.target.checked })}
        />
        <label htmlFor="approval" className="text-sm text-amber-800">Approval required</label>
      </div>
    </div>
  );
}
