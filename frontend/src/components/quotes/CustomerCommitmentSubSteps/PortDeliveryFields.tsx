'use client';

interface Props {
  details: Record<string, unknown>;
  update: (patch: Record<string, unknown>) => void;
}

export function PortDeliveryFields({ details, update }: Props) {
  return (
    <div className="mt-4 space-y-4 rounded border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-medium">Port Delivery Details</h3>
      <div>
        <label className="block text-sm text-slate-600">Port Name</label>
        <input
          type="text"
          value={String(details.port_name ?? '')}
          onChange={(e) => update({ port_name: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Incoterms</label>
        <select
          value={String(details.incoterms ?? 'FOB')}
          onChange={(e) => update({ incoterms: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="FOB">FOB</option>
          <option value="CIF">CIF</option>
          <option value="DDP">DDP</option>
          <option value="DAP">DAP</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="export_doc"
          checked={!!details.export_documentation_required}
          onChange={(e) => update({ export_documentation_required: e.target.checked })}
        />
        <label htmlFor="export_doc" className="text-sm text-slate-600">Export documentation required</label>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Destination Country</label>
        <input
          type="text"
          value={String(details.destination_country ?? '')}
          onChange={(e) => update({ destination_country: e.target.value })}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          placeholder="Optional"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="import_duty_port"
          checked={!!details.import_duty_required}
          onChange={(e) => update({ import_duty_required: e.target.checked })}
        />
        <label htmlFor="import_duty_port" className="text-sm text-slate-600">Import duty required (seller bears)</label>
      </div>
    </div>
  );
}
