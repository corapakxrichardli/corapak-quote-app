import { pool } from '../config/database.js';
import { customerCommitmentSeeds } from './seeds/customerCommitments.js';
import { costRuleSeeds } from './seeds/costRules.js';
import { customerSeeds } from './seeds/customers.js';

async function seed() {
  for (const row of customerCommitmentSeeds) {
    await pool.query(
      `INSERT INTO customer_commitments (type, warehouse_required, storage_required, delivery_required, freight_type, export_required, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (type) DO NOTHING`,
      [row.type, row.warehouse_required, row.storage_required, row.delivery_required, row.freight_type, row.export_required ?? false, row.notes ?? null]
    );
  }
  console.log('Seeded customer_commitments');

  const ruleCols = 'rule_name, rule_category, trigger_conditions, calculation_type, cost_value, cost_unit, active, approval_trigger, notes';
  for (const row of costRuleSeeds) {
    await pool.query(
      `INSERT INTO cost_rules (${ruleCols}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        row.rule_name,
        row.rule_category,
        JSON.stringify(row.trigger_conditions || {}),
        row.calculation_type,
        row.cost_value,
        row.cost_unit,
        row.active ?? true,
        row.approval_trigger ?? false,
        row.notes ?? null,
      ]
    );
  }
  console.log('Seeded cost_rules');

  const custCount = (await pool.query('SELECT 1 FROM customers LIMIT 1')).rowCount;
  if (custCount === 0) {
    for (const row of customerSeeds) {
      await pool.query(
        `INSERT INTO customers (name, pricing_tier, default_customer_commitment_preference, default_payment_terms, active_status)
         VALUES ($1, $2, $3, $4, $5)`,
        [row.name, row.pricing_tier, row.default_customer_commitment_preference, row.default_payment_terms, row.active_status ?? 'active']
      );
    }
    console.log('Seeded customers');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
