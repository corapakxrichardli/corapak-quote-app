'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { QuoteFormState } from '@/lib/quoteTypes';
import { AirFreightFields } from '../CustomerCommitmentSubSteps/AirFreightFields';
import { PortDeliveryFields } from '../CustomerCommitmentSubSteps/PortDeliveryFields';
import { WarehousePickupFields } from '../CustomerCommitmentSubSteps/WarehousePickupFields';
import { WarehouseToDCFields } from '../CustomerCommitmentSubSteps/WarehouseToDCFields';
import { CustomPathFields } from '../CustomerCommitmentSubSteps/CustomPathFields';

interface Props {
  data: QuoteFormState;
  update: (patch: Partial<QuoteFormState>) => void;
}

export function CustomerCommitmentStep({ data, update }: Props) {
  const [options, setOptions] = useState<{ id: string; type: string }[]>([]);

  useEffect(() => {
    api.customerCommitments.list().then(setOptions).catch(() => setOptions([]));
  }, []);

  const selected = options.find((o) => o.id === data.customer_commitment_id);
  const type = selected?.type || '';

  const patchDetails = (patch: Record<string, unknown>) => {
    update({ customer_commitment_details: { ...data.customer_commitment_details, ...patch } });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Customer Commitment</h2>

      <div>
        <label className="block text-sm font-medium text-slate-700">Delivery / Logistics Model</label>
        <div className="mt-2 grid gap-2">
          {options.map((o) => (
            <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="radio"
                name="cc"
                value={o.id}
                checked={data.customer_commitment_id === o.id}
                onChange={() => {
                  update({
                    customer_commitment_id: o.id,
                    customer_commitment_details: {},
                  });
                }}
                className="border-slate-300"
              />
              <span className="text-sm">{o.type.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {type === 'air_freight_direct' && (
        <AirFreightFields details={data.customer_commitment_details} update={patchDetails} />
      )}
      {type === 'port_delivery' && (
        <PortDeliveryFields details={data.customer_commitment_details} update={patchDetails} />
      )}
      {type === 'warehouse_pickup' && (
        <WarehousePickupFields details={data.customer_commitment_details} update={patchDetails} />
      )}
      {type === 'warehouse_to_dc' && (
        <WarehouseToDCFields details={data.customer_commitment_details} update={patchDetails} />
      )}
      {type === 'custom_path' && (
        <CustomPathFields details={data.customer_commitment_details} update={patchDetails} />
      )}
    </div>
  );
}
