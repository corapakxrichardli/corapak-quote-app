'use client';

interface Props {
  details: Record<string, unknown>;
  update: (patch: Record<string, unknown>) => void;
}

export function WarehousePickupFields({ details, update }: Props) {
  return (
    <div className="mt-4 space-y-4 rounded border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-medium">Warehouse Pickup Details</h3>
      <div>
        <label className="block text-sm text-slate-600">Expected Storage Duration (weeks)</label>
        <input
          type="number"
          value={Number(details.expected_storage_duration_weeks ?? '') || ''}
          onChange={(e) => update({ expected_storage_duration_weeks: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Pallet Format</label>
        <input
          type="text"
          value={String(details.pallet_format ?? '')}
          onChange={(e) => update({ pallet_format: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          placeholder="e.g. standard"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="receiving"
          checked={!!details.receiving_required}
          onChange={(e) => update({ receiving_required: e.target.checked })}
        />
        <label htmlFor="receiving" className="text-sm text-slate-600">Receiving required</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="palletizing"
          checked={!!details.palletizing_required}
          onChange={(e) => update({ palletizing_required: e.target.checked })}
        />
        <label htmlFor="palletizing" className="text-sm text-slate-600">Palletizing required</label>
      </div>
    </div>
  );
}
