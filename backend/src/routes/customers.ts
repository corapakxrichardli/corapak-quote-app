import { Router } from 'express';
import { pool } from '../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, active_status = 'active' } = req.query;
    let q = 'SELECT * FROM customers WHERE 1=1';
    const params: unknown[] = [];
    if (active_status) {
      params.push(active_status);
      q += ` AND active_status = $${params.length}`;
    }
    if (search && typeof search === 'string') {
      params.push(`%${search}%`);
      q += ` AND name ILIKE $${params.length}`;
    }
    q += ' ORDER BY name';
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, pricing_tier, default_customer_commitment_preference, default_payment_terms, active_status } = req.body;
    if (!name) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name required' } });
    const { rows } = await pool.query(
      `INSERT INTO customers (name, pricing_tier, default_customer_commitment_preference, default_payment_terms, active_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, pricing_tier || 'standard', default_customer_commitment_preference, default_payment_terms, active_status || 'active']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

export default router;
