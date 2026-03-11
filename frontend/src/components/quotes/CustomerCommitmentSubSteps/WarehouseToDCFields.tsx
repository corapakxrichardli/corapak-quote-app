'use client';

interface Props {
  details: Record<string, unknown>;
  update: (patch: Record<string, unknown>) => void;
}

export function WarehouseToDCFields({ details, update }: Props) {
  return (
    <div className="mt-4 space-y-4 rounded border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-medium">Warehouse to DC Details</h3>
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
        <label className="block text-sm text-slate-600">Customer Warehouse / DC Location</label>
        <input
          type="text"
          value={String(details.customer_warehouse_location ?? '')}
          onChange={(e) => update({ customer_warehouse_location: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          placeholder="e.g. Chicago, IL"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Delivery Requirements</label>
        <textarea
          value={String(details.delivery_requirements ?? '')}
          onChange={(e) => update({ delivery_requirements: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          rows={2}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="dc_appt"
          checked={!!details.dc_appointment_required}
          onChange={(e) => update({ dc_appointment_required: e.target.checked })}
        />
        <label htmlFor="dc_appt" className="text-sm text-slate-600">DC appointment required</label>
      </div>
    </div>
  );
}
