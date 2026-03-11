import { pool } from '../../config/database.js';
import type { PricingContext, PricingResult, Warning } from './types.js';

export async function calculate(ctx: PricingContext): Promise<PricingResult> {
  const assumptions: Record<string, unknown> = {};
  const warnings: Warning[] = [];
  let approvalRequired = false;

  let baseUnitCost = 0;
  const rules = (await pool.query('SELECT * FROM cost_rules WHERE active = true')).rows;

  // Product base
  const baseRules = rules.filter((r) => r.rule_category === 'product_base' && matches(r, { product_family: ctx.productConfig.product_family }));
  for (const r of baseRules) {
    if (r.calculation_type === 'per_unit') baseUnitCost += Number(r.cost_value);
  }
  assumptions.base_product_cost = baseUnitCost || 1.2;

  let unitCost = baseUnitCost || 1.2;

  // Product spec modifiers
  const specRules = rules.filter((r) => r.rule_category === 'product_spec');
  for (const r of specRules) {
    if (!matches(r, { printing: ctx.productConfig.printing, material: ctx.productConfig.material })) continue;
    if (r.calculation_type === 'per_unit') unitCost += Number(r.cost_value);
    if (r.calculation_type === 'per_certification' && ctx.productConfig.certifications?.length) {
      unitCost += Number(r.cost_value) * ctx.productConfig.certifications.length;
    }
  }

  // Commercial modifiers (percentage)
  let pctAdjust = 0;
  const qty = ctx.quotedQuantity;
  const commRules = rules.filter((r) => r.rule_category === 'commercial');
  for (const r of commRules) {
    const min = r.trigger_conditions?.min_quantity;
    const max = r.trigger_conditions?.max_quantity;
    if (min != null && qty < min) continue;
    if (max != null && qty > max) continue;
    if (r.trigger_conditions?.commitment_type && r.trigger_conditions.commitment_type !== ctx.commitmentType) continue;
    if (r.trigger_conditions?.payment_terms && r.trigger_conditions.payment_terms !== ctx.paymentTerms) continue;
    pctAdjust += Number(r.cost_value);
    if (r.approval_trigger) approvalRequired = true;
  }
  unitCost = unitCost * (1 + pctAdjust / 100);
  assumptions.commercial_adjustment_pct = pctAdjust;

  // Tooling
  let toolingCharges = ctx.productConfig.mold_required && ctx.productConfig.mold_cost ? ctx.productConfig.mold_cost : 0;

  // Customer commitment costs
  const ccType = ctx.customerCommitment.type;
  const details = ctx.customerCommitmentDetails as Record<string, unknown>;
  let logisticsCharges = 0;
  let handlingCharges = 0;
  let storageCharges = 0;

  const ccRules = rules.filter((r) => r.rule_category === 'customer_commitment' && matches(r, { customer_commitment_type: ccType, ...details }));
  for (const r of ccRules) {
    const v = Number(r.cost_value);
    if (r.calculation_type === 'fixed') logisticsCharges += v;
    if (r.calculation_type === 'per_kg' && details.estimated_shipment_weight) logisticsCharges += v * Number(details.estimated_shipment_weight);
    if (r.calculation_type === 'per_pallet_week' && details.expected_storage_duration_weeks) storageCharges += v * Number(details.expected_storage_duration_weeks) * 1; // 1 pallet default
  }

  // Import duty
  let importDutyCharges = 0;
  if (details.import_duty_required) {
    const productValue = unitCost * ctx.quotedQuantity;
    const manualRate = details.estimated_duty_rate_pct;
    const dutyRules = rules.filter((r) => r.rule_category === 'import_duty' && matches(r, { import_duty_required: true, destination_country: details.destination_country }));
    const fallbackRules = rules.filter((r) => r.rule_category === 'import_duty' && matches(r, { import_duty_required: true }));
    const rate = manualRate != null ? Number(manualRate) : (dutyRules[0] || fallbackRules[0])?.cost_value ? Number((dutyRules[0] || fallbackRules[0]).cost_value) : 5;
    importDutyCharges = productValue * (rate / 100);
    assumptions.import_duty_rate_pct = rate;
    if (fallbackRules.length && !dutyRules.length) approvalRequired = true;
  }

  // Custom path
  if (ccType === 'custom_path') {
    const manual = details.manual_logistics_estimate;
    if (manual != null) logisticsCharges += Number(manual);
    if (details.manual_import_duty_estimate != null) importDutyCharges += Number(details.manual_import_duty_estimate);
    approvalRequired = true;
    warnings.push({ code: 'CUSTOM_PATH', message: 'Custom path selected - manual review required', severity: 'warning' });
  }

  // Margin
  const marginMult = 1 + ctx.marginTarget / 100;
  const unitPrice = unitCost * marginMult;
  const lineTotal = unitPrice * ctx.quotedQuantity;
  const totalQuoteValue = lineTotal + toolingCharges + logisticsCharges + importDutyCharges + handlingCharges + storageCharges;
  const costTotal = unitCost * ctx.quotedQuantity + toolingCharges + logisticsCharges + importDutyCharges + handlingCharges + storageCharges;
  const estimatedMargin = totalQuoteValue > 0 ? ((totalQuoteValue - costTotal) / totalQuoteValue) * 100 : 0;

  if (estimatedMargin < ctx.marginTarget - 5) {
    warnings.push({ code: 'LOW_MARGIN', message: `Estimated margin ${estimatedMargin.toFixed(1)}% below target ${ctx.marginTarget}%`, severity: 'warning' });
  }

  return {
    calculatedUnitPrice: Math.round(unitPrice * 100) / 100,
    toolingCharges,
    logisticsCharges,
    importDutyCharges,
    handlingCharges,
    storageCharges,
    totalQuoteValue: Math.round(totalQuoteValue * 100) / 100,
    estimatedMargin: Math.round(estimatedMargin * 10) / 10,
    assumptions,
    warnings,
    approvalRequired,
  };
}

function matches(rule: { trigger_conditions: Record<string, unknown> }, ctx: Record<string, unknown>): boolean {
  const cond = rule.trigger_conditions || {};
  for (const [k, v] of Object.entries(cond)) {
    if (v === undefined || v === null) continue;
    const cv = ctx[k];
    if (cv === undefined || cv === null) continue;
    if (String(cv) !== String(v)) return false;
  }
  return true;
}
