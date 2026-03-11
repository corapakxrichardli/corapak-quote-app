import { Router } from 'express';
import { pool } from '../config/database.js';
import { calculate } from '../services/pricingEngine/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function toDate(s: unknown): string | null {
  if (!s || typeof s !== 'string') return null;
  return s.split('T')[0] || s;
}

const PRODUCT_FAMILY_LABELS: Record<string, string> = {
  corrugated_box: 'Corrugated Box',
  rigid_box: 'Rigid Box',
  flexible_packaging: 'Flexible Packaging',
};

function formatProductFamily(key: string | null): string {
  if (!key) return 'Packaging';
  return PRODUCT_FAMILY_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

router.get('/', async (req, res) => {
  try {
    const { status, customer_id, limit = 50, offset = 0 } = req.query;
    let q = 'SELECT q.*, c.name as customer_name FROM quotes q LEFT JOIN customers c ON q.customer_id = c.id WHERE 1=1';
    const params: unknown[] = [];
    let i = 1;
    if (status) {
      params.push(status);
      q += ` AND q.status = $${i++}`;
    }
    if (customer_id) {
      params.push(customer_id);
      q += ` AND q.customer_id = $${i++}`;
    }
    params.push(Number(limit), Number(offset));
    q += ` ORDER BY q.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT q.*, c.name as customer_name, c.default_payment_terms,
        pc.product_family, pc.dimensions, pc.material, pc.weight, pc.finish, pc.printing, pc.certifications,
        pc.packaging_configuration, pc.pallet_configuration, pc.mold_required, pc.mold_cost, pc.special_requirements,
        cc.type as customer_commitment_type
       FROM quotes q
       LEFT JOIN customers c ON q.customer_id = c.id
       LEFT JOIN product_configs pc ON q.product_config_id = pc.id
       LEFT JOIN customer_commitments cc ON q.customer_commitment_id = cc.id
       WHERE q.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    const r = rows[0];
    res.json({
      ...r,
      customer: r.customer_id ? { id: r.customer_id, name: r.customer_name } : null,
      product_config: r.product_config_id ? { product_family: r.product_family, dimensions: r.dimensions, material: r.material, weight: r.weight, finish: r.finish, printing: r.printing, certifications: r.certifications || [], packaging_configuration: r.packaging_configuration, pallet_configuration: r.pallet_configuration, mold_required: r.mold_required, mold_cost: r.mold_cost, special_requirements: r.special_requirements } : null,
      customer_commitment: r.customer_commitment_id ? { id: r.customer_commitment_id, type: r.customer_commitment_type } : null,
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const productConfig = body.product_config || {};
    const pcResult = await pool.query(
      `INSERT INTO product_configs (product_family, dimensions, material, weight, finish, printing, certifications, packaging_configuration, pallet_configuration, mold_required, mold_cost, special_requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        productConfig.product_family || 'corrugated_box',
        JSON.stringify(productConfig.dimensions || {}),
        productConfig.material,
        productConfig.weight,
        productConfig.finish,
        productConfig.printing ?? false,
        JSON.stringify(productConfig.certifications || []),
        productConfig.packaging_configuration,
        productConfig.pallet_configuration,
        productConfig.mold_required ?? false,
        productConfig.mold_cost,
        productConfig.special_requirements,
      ]
    );
    const productConfigId = pcResult.rows[0].id;

    const cc = body.customer_commitment_id ? (await pool.query('SELECT * FROM customer_commitments WHERE id = $1', [body.customer_commitment_id])).rows[0] : null;
    const ccDetails = body.customer_commitment_details || {};

    const pricingResult = cc
      ? await calculate({
          productConfig: { ...productConfig, product_family: productConfig.product_family || 'corrugated_box' },
          quotedQuantity: body.quoted_quantity || 1000,
          annualForecastVolume: body.annual_forecast_volume,
          commitmentType: body.commitment_type || 'spot_order',
          paymentTerms: body.payment_terms || 'Net 30',
          marginTarget: body.margin_target ?? 25,
          customerCommitment: { id: cc.id, type: cc.type },
          customerCommitmentDetails: ccDetails,
        })
      : null;

    const id = uuidv4();
    const quoteDate = toDate(body.quote_date) || new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO quotes (id, customer_id, sales_rep, quote_date, expected_close_date, opportunity_notes, project_name, opportunity_size, confidence_level,
        product_config_id, quoted_quantity, annual_forecast_volume, commitment_type, payment_terms, target_price, margin_target,
        customer_commitment_id, customer_commitment_details,
        calculated_unit_price, tooling_charges, logistics_charges, import_duty_charges, handling_charges, storage_charges,
        total_quote_value, estimated_margin, assumptions_json, warnings_json, approval_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)`,
      [
        id,
        body.customer_id || null,
        body.sales_rep,
        quoteDate,
        toDate(body.expected_close_date),
        body.opportunity_notes,
        body.project_name,
        body.opportunity_size,
        body.confidence_level,
        productConfigId,
        body.quoted_quantity || 1000,
        body.annual_forecast_volume,
        body.commitment_type || 'spot_order',
        body.payment_terms || 'Net 30',
        body.target_price,
        body.margin_target ?? 25,
        body.customer_commitment_id || null,
        JSON.stringify(ccDetails),
        pricingResult?.calculatedUnitPrice,
        pricingResult?.toolingCharges ?? 0,
        pricingResult?.logisticsCharges ?? 0,
        pricingResult?.importDutyCharges ?? 0,
        pricingResult?.handlingCharges ?? 0,
        pricingResult?.storageCharges ?? 0,
        pricingResult?.totalQuoteValue,
        pricingResult?.estimatedMargin,
        JSON.stringify(pricingResult?.assumptions || {}),
        JSON.stringify(pricingResult?.warnings || []),
        pricingResult?.approvalRequired ?? false,
        'draft',
      ]
    );

    const { rows } = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    const { rows: existing } = await pool.query('SELECT * FROM quotes WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    const q = existing[0];

    const productConfig = body.product_config || {};
    await pool.query(
      `UPDATE product_configs SET product_family=$1, dimensions=$2, material=$3, weight=$4, finish=$5, printing=$6, certifications=$7, packaging_configuration=$8, pallet_configuration=$9, mold_required=$10, mold_cost=$11, special_requirements=$12, updated_at=NOW() WHERE id=$13`,
      [
        productConfig.product_family ?? q.product_family,
        JSON.stringify(productConfig.dimensions || {}),
        productConfig.material,
        productConfig.weight,
        productConfig.finish,
        productConfig.printing ?? false,
        JSON.stringify(productConfig.certifications || []),
        productConfig.packaging_configuration,
        productConfig.pallet_configuration,
        productConfig.mold_required ?? false,
        productConfig.mold_cost,
        productConfig.special_requirements,
        q.product_config_id,
      ]
    );

    const cc = body.customer_commitment_id ? (await pool.query('SELECT * FROM customer_commitments WHERE id = $1', [body.customer_commitment_id])).rows[0] : null;
    const ccDetails = body.customer_commitment_details || {};
    const existingPc = q.product_config_id ? (await pool.query('SELECT * FROM product_configs WHERE id = $1', [q.product_config_id])).rows[0] : null;
    const mergedPc = { ...existingPc, ...productConfig };

    const pricingResult =
      cc && q.product_config_id
        ? await calculate({
            productConfig: { ...mergedPc, product_family: mergedPc?.product_family || 'corrugated_box' },
            quotedQuantity: body.quoted_quantity ?? q.quoted_quantity,
            annualForecastVolume: body.annual_forecast_volume ?? q.annual_forecast_volume,
            commitmentType: body.commitment_type ?? q.commitment_type,
            paymentTerms: body.payment_terms ?? q.payment_terms,
            marginTarget: body.margin_target ?? q.margin_target ?? 25,
            customerCommitment: { id: cc.id, type: cc.type },
            customerCommitmentDetails: ccDetails,
          })
      : null;

    await pool.query(
      `UPDATE quotes SET customer_id=$1, sales_rep=$2, quote_date=$3, expected_close_date=$4, opportunity_notes=$5, project_name=$6, opportunity_size=$7, confidence_level=$8,
        quoted_quantity=$9, annual_forecast_volume=$10, commitment_type=$11, payment_terms=$12, target_price=$13, margin_target=$14,
        customer_commitment_id=$15, customer_commitment_details=$16,
        calculated_unit_price=$17, tooling_charges=$18, logistics_charges=$19, import_duty_charges=$20, handling_charges=$21, storage_charges=$22,
        total_quote_value=$23, estimated_margin=$24, assumptions_json=$25, warnings_json=$26, approval_required=$27, updated_at=NOW()
       WHERE id=$28`,
      [
        body.customer_id ?? q.customer_id,
        body.sales_rep ?? q.sales_rep,
        toDate(body.quote_date) ?? q.quote_date,
        toDate(body.expected_close_date) ?? q.expected_close_date,
        body.opportunity_notes ?? q.opportunity_notes,
        body.project_name ?? q.project_name,
        body.opportunity_size ?? q.opportunity_size,
        body.confidence_level ?? q.confidence_level,
        body.quoted_quantity ?? q.quoted_quantity,
        body.annual_forecast_volume ?? q.annual_forecast_volume,
        body.commitment_type ?? q.commitment_type,
        body.payment_terms ?? q.payment_terms,
        body.target_price ?? q.target_price,
        body.margin_target ?? q.margin_target ?? 25,
        body.customer_commitment_id ?? q.customer_commitment_id,
        JSON.stringify(ccDetails),
        pricingResult?.calculatedUnitPrice ?? q.calculated_unit_price,
        pricingResult?.toolingCharges ?? q.tooling_charges ?? 0,
        pricingResult?.logisticsCharges ?? q.logistics_charges ?? 0,
        pricingResult?.importDutyCharges ?? q.import_duty_charges ?? 0,
        pricingResult?.handlingCharges ?? q.handling_charges ?? 0,
        pricingResult?.storageCharges ?? q.storage_charges ?? 0,
        pricingResult?.totalQuoteValue ?? q.total_quote_value,
        pricingResult?.estimatedMargin ?? q.estimated_margin,
        JSON.stringify(pricingResult?.assumptions ?? q.assumptions_json ?? {}),
        JSON.stringify(pricingResult?.warnings ?? q.warnings_json ?? []),
        pricingResult?.approvalRequired ?? q.approval_required ?? false,
        req.params.id,
      ]
    );

    const { rows } = await pool.query('SELECT * FROM quotes WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.post('/:id/calculate', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT q.*, pc.*, cc.id as cc_id, cc.type as cc_type
       FROM quotes q
       LEFT JOIN product_configs pc ON q.product_config_id = pc.id
       LEFT JOIN customer_commitments cc ON q.customer_commitment_id = cc.id
       WHERE q.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    const r = rows[0];
    if (!r.cc_id) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Customer commitment required for calculation' } });

    const result = await calculate({
      productConfig: { product_family: r.product_family || 'corrugated_box', dimensions: r.dimensions, material: r.material, weight: r.weight, finish: r.finish, printing: r.printing, certifications: r.certifications || [], mold_required: r.mold_required, mold_cost: r.mold_cost },
      quotedQuantity: r.quoted_quantity,
      annualForecastVolume: r.annual_forecast_volume,
      commitmentType: r.commitment_type,
      paymentTerms: r.payment_terms,
      marginTarget: r.margin_target ?? 25,
      customerCommitment: { id: r.cc_id, type: r.cc_type },
      customerCommitmentDetails: r.customer_commitment_details || {},
    });

    await pool.query(
      `UPDATE quotes SET calculated_unit_price=$1, tooling_charges=$2, logistics_charges=$3, import_duty_charges=$4, handling_charges=$5, storage_charges=$6, total_quote_value=$7, estimated_margin=$8, assumptions_json=$9, warnings_json=$10, approval_required=$11, updated_at=NOW() WHERE id=$12`,
      [
        result.calculatedUnitPrice,
        result.toolingCharges,
        result.logisticsCharges,
        result.importDutyCharges,
        result.handlingCharges,
        result.storageCharges,
        result.totalQuoteValue,
        result.estimatedMargin,
        JSON.stringify(result.assumptions),
        JSON.stringify(result.warnings),
        result.approvalRequired,
        req.params.id,
      ]
    );

    const { rows: updated } = await pool.query('SELECT * FROM quotes WHERE id = $1', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.post('/:id/preview', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT q.*, pc.product_family, cc.type as cc_type
       FROM quotes q
       LEFT JOIN product_configs pc ON q.product_config_id = pc.id
       LEFT JOIN customer_commitments cc ON q.customer_commitment_id = cc.id
       WHERE q.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    const r = rows[0];
    res.json({
      product_description: `${formatProductFamily(r.product_family)} - Qty ${r.quoted_quantity}`,
      quantity: r.quoted_quantity,
      unit_price: r.calculated_unit_price,
      tooling_fees: r.tooling_charges,
      freight_terms: r.cc_type ? `Customer commitment: ${r.cc_type}` : 'To be confirmed',
      lead_time_assumptions: '8-10 weeks',
      validity_period: '30 days',
      exclusions: ['Custom duties and taxes unless specified', 'Rush fees if applicable'],
      assumptions: Object.entries(r.assumptions_json || {}).map(([k, v]) => `${k}: ${v}`),
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

export default router;
