export interface QuoteFormState {
  customer_id: string | null;
  project_name: string;
  sales_rep: string;
  quote_date: string;
  expected_close_date: string;
  opportunity_size: number | null;
  confidence_level: string;
  opportunity_notes: string;
  product_config: {
    product_family: string;
    dimensions: { length?: number; width?: number; height?: number; unit?: string };
    material: string;
    weight: number | null;
    finish: string;
    printing: boolean;
    certifications: string[];
    packaging_configuration: string;
    pallet_configuration: string;
    mold_required: boolean;
    mold_cost: number | null;
    special_requirements: string;
  };
  quoted_quantity: number;
  annual_forecast_volume: number | null;
  commitment_type: string;
  payment_terms: string;
  target_price: number | null;
  margin_target: number;
  customer_commitment_id: string | null;
  customer_commitment_details: Record<string, unknown>;
}

export const initialFormState: QuoteFormState = {
  customer_id: null,
  project_name: '',
  sales_rep: '',
  quote_date: new Date().toISOString().split('T')[0],
  expected_close_date: '',
  opportunity_size: null,
  confidence_level: 'medium',
  opportunity_notes: '',
  product_config: {
    product_family: 'corrugated_box',
    dimensions: {},
    material: '',
    weight: null,
    finish: '',
    printing: false,
    certifications: [],
    packaging_configuration: '',
    pallet_configuration: '',
    mold_required: false,
    mold_cost: null,
    special_requirements: '',
  },
  quoted_quantity: 1000,
  annual_forecast_volume: null,
  commitment_type: 'spot_order',
  payment_terms: 'Net 30',
  target_price: null,
  margin_target: 25,
  customer_commitment_id: null,
  customer_commitment_details: {},
};
