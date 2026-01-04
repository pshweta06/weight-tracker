const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// All routes require authentication
router.use(authenticateToken);

// Add or update weight entry
router.post('/', (req, res) => {
  try {
    const { weight, date } = req.body;
    const userId = req.user.id;

    if (!weight || isNaN(weight)) {
      return res.status(400).json({ error: 'Valid weight value required' });
    }

    const entryDate = date || getLocalDateString();
    const db = getDb();

    db.run(
      `INSERT INTO weight_entries (user_id, weight, date)
       VALUES (?, ?, ?)`,
      [userId, weight, entryDate],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save weight entry' });
        }
        res.json({
          id: this.lastID,
          weight,
          date: entryDate,
          message: 'Weight entry saved successfully'
        });
      }
    );
  } catch (error) {
    console.error('Add weight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all weight entries
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();

    db.all(
      'SELECT * FROM weight_entries WHERE user_id = ? ORDER BY date DESC',
      [userId],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch weight entries' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Get weights error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get weight entry for a specific date
router.get('/date/:date', (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    const db = getDb();

    db.get(
      'SELECT * FROM weight_entries WHERE user_id = ? AND date = ? ORDER BY created_at DESC',
      [userId, date],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch weight entry' });
        }
        res.json(row || null);
      }
    );
  } catch (error) {
    console.error('Get weight by date error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get weight entries for a specific period
router.get('/period', (req, res) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month'
    const userId = req.user.id;
    const db = getDb();

    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'week':
        startDate = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000); // Last 8 weeks
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1); // Last 12 months
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    }

    // For week and month periods, aggregate data
    if (period === 'week' || period === 'month') {
      let groupByExpr;
      if (period === 'week') {
        // Group by year and week number (simpler calculation)
        // Calculate week as: floor((day_of_year - 1) / 7) + 1
        groupByExpr = "strftime('%Y', date) || '-' || printf('%02d', CAST((CAST(strftime('%j', date) AS INTEGER) - 1) / 7 AS INTEGER) + 1)";
      } else {
        // Group by year and month
        groupByExpr = "strftime('%Y-%m', date)";
      }

      const query = `
        SELECT 
          AVG(weight) as weight,
          COUNT(*) as entry_count,
          MIN(date) as start_date,
          MAX(date) as end_date,
          ${groupByExpr} as period_key
        FROM weight_entries 
        WHERE user_id = ? AND date >= ?
        GROUP BY period_key
        ORDER BY start_date ASC
      `;

      db.all(query, [userId, getLocalDateString(startDate)], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch weight entries' });
        }
        // Format the response to match expected structure
        const formattedRows = rows.map(row => ({
          id: null,
          user_id: userId,
          weight: parseFloat(row.weight.toFixed(2)),
          date: row.start_date, // Use start date for the period
          entry_count: row.entry_count,
          period_start: row.start_date,
          period_end: row.end_date,
          is_average: true
        }));
        res.json(formattedRows);
      });
    } else {
      // For day period, return individual entries
      const query = 'SELECT * FROM weight_entries WHERE user_id = ? AND date >= ? ORDER BY date ASC';
      db.all(query, [userId, getLocalDateString(startDate)], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch weight entries' });
        }
        res.json(rows);
      });
    }
  } catch (error) {
    console.error('Get period weights error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk upload weight entries
router.post('/bulk', (req, res) => {
  try {
    const { entries } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array is required and must not be empty' });
    }

    // Validate all entries
    for (const entry of entries) {
      if (!entry.weight || isNaN(entry.weight)) {
        return res.status(400).json({ error: `Invalid weight value for entry: ${JSON.stringify(entry)}` });
      }
      if (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
        return res.status(400).json({ error: `Invalid date format for entry. Expected YYYY-MM-DD: ${JSON.stringify(entry)}` });
      }
    }

    const db = getDb();
    const results = [];
    let completed = 0;
    let errors = [];

    entries.forEach((entry) => {
      db.run(
        `INSERT INTO weight_entries (user_id, weight, date)
         VALUES (?, ?, ?)`,
        [userId, entry.weight, entry.date],
        function(err) {
          completed++;
          if (err) {
            console.error(`Error inserting ${entry.date}:`, err);
            errors.push({ date: entry.date, weight: entry.weight, error: err.message });
          } else {
            results.push({
              id: this.lastID,
              weight: entry.weight,
              date: entry.date,
              updated: false
            });
          }

          // When all entries are processed
          if (completed === entries.length) {
            res.json({
              success: results.length,
              failed: errors.length,
              total: entries.length,
              entries: results,
              errors: errors.length > 0 ? errors : undefined
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete weight entry
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDb();

    db.run(
      'DELETE FROM weight_entries WHERE id = ? AND user_id = ?',
      [id, userId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to delete weight entry' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Weight entry not found' });
        }
        res.json({ message: 'Weight entry deleted successfully' });
      }
    );
  } catch (error) {
    console.error('Delete weight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

