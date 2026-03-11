import { Router } from 'express';
import { pool } from '../config/database.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customer_commitments ORDER BY type');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customer_commitments WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer commitment not found' } });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } });
  }
});

export default router;
