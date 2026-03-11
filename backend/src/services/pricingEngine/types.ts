export interface ProductConfig {
  product_family: string;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  material?: string;
  weight?: number | null;
  finish?: string;
  printing?: boolean;
  certifications?: string[];
  mold_required?: boolean;
  mold_cost?: number | null;
}

export interface CustomerCommitment {
  id: string;
  type: string;
}

export interface PricingContext {
  productConfig: ProductConfig;
  quotedQuantity: number;
  annualForecastVolume?: number | null;
  commitmentType: string;
  paymentTerms: string;
  marginTarget: number;
  customerCommitment: CustomerCommitment;
  customerCommitmentDetails: Record<string, unknown>;
}

export interface Warning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface PricingResult {
  calculatedUnitPrice: number;
  toolingCharges: number;
  logisticsCharges: number;
  importDutyCharges: number;
  handlingCharges: number;
  storageCharges: number;
  totalQuoteValue: number;
  estimatedMargin: number;
  assumptions: Record<string, unknown>;
  warnings: Warning[];
  approvalRequired: boolean;
}
