const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all habits
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM habits ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Habit name is required' });
    }

    const result = await pool.query(
      'INSERT INTO habits (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM habits WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully', habit: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get completions for a specific habit
router.get('/:id/completions', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    let query = 'SELECT * FROM habit_completions WHERE habit_id = $1';
    const params = [id];

    if (start_date && end_date) {
      query += ' AND completion_date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY completion_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle habit completion for a specific date
router.post('/:id/completions', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Check if completion already exists
    const existingCompletion = await pool.query(
      'SELECT * FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
      [id, date]
    );

    if (existingCompletion.rows.length > 0) {
      // Toggle completion status
      const result = await pool.query(
        'UPDATE habit_completions SET completed = NOT completed WHERE habit_id = $1 AND completion_date = $2 RETURNING *',
        [id, date]
      );
      res.json(result.rows[0]);
    } else {
      // Create new completion
      const result = await pool.query(
        'INSERT INTO habit_completions (habit_id, completion_date, completed) VALUES ($1, $2, true) RETURNING *',
        [id, date]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
