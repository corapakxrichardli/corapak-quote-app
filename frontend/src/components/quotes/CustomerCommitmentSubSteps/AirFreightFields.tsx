'use client';

interface Props {
  details: Record<string, unknown>;
  update: (patch: Record<string, unknown>) => void;
}

export function AirFreightFields({ details, update }: Props) {
  return (
    <div className="mt-4 space-y-4 rounded border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-medium">Air Freight Details</h3>
      <div>
        <label className="block text-sm text-slate-600">Destination Country</label>
        <input
          type="text"
          value={String(details.destination_country ?? '')}
          onChange={(e) => update({ destination_country: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          placeholder="e.g. USA"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Airport</label>
        <input
          type="text"
          value={String(details.airport ?? '')}
          onChange={(e) => update({ airport: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          placeholder="e.g. LAX"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Estimated Shipment Weight (kg)</label>
        <input
          type="number"
          value={Number(details.estimated_shipment_weight ?? '') || ''}
          onChange={(e) => update({ estimated_shipment_weight: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Urgency Level</label>
        <select
          value={String(details.urgency_level ?? 'standard')}
          onChange={(e) => update({ urgency_level: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="standard">Standard</option>
          <option value="rush">Rush</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="import_duty"
          checked={!!details.import_duty_required}
          onChange={(e) => update({ import_duty_required: e.target.checked })}
        />
        <label htmlFor="import_duty" className="text-sm text-slate-600">Import duty required (seller bears)</label>
      </div>
      {details.import_duty_required && (
        <div>
          <label className="block text-sm text-slate-600">Estimated duty rate % (override)</label>
          <input
            type="number"
            step="0.1"
            value={Number(details.estimated_duty_rate_pct ?? '') || ''}
            onChange={(e) => update({ estimated_duty_rate_pct: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
      )}
    </div>
  );
}
