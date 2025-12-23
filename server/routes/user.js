const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendReminderEmail } = require('../services/emailReminder');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();

    db.get('SELECT id, username, email, name, target_weight FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        targetWeight: user.target_weight
      });
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update target weight
router.put('/target-weight', (req, res) => {
  try {
    const { targetWeight } = req.body;
    const userId = req.user.id;

    if (!targetWeight || isNaN(targetWeight)) {
      return res.status(400).json({ error: 'Valid target weight required' });
    }

    const db = getDb();

    db.run('UPDATE users SET target_weight = ? WHERE id = ?', [targetWeight, userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update target weight' });
      }
      res.json({ targetWeight, message: 'Target weight updated successfully' });
    });
  } catch (error) {
    console.error('Update target weight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update email
router.put('/email', (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    const db = getDb();

    db.run('UPDATE users SET email = ? WHERE id = ?', [email, userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update email' });
      }
      res.json({ email, message: 'Email updated successfully' });
    });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update name
router.put('/name', (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const db = getDb();

    // Update name
    db.run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update name' });
      }
      res.json({ name: name.trim(), message: 'Name updated successfully' });
    });
  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update username
router.put('/username', (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    const db = getDb();

    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId], (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Update username
      db.run('UPDATE users SET username = ? WHERE id = ?', [username.trim(), userId], function(updateErr) {
        if (updateErr) {
          console.error('Database error:', updateErr);
          return res.status(500).json({ error: 'Failed to update username' });
        }
        res.json({ username: username.trim(), message: 'Username updated successfully' });
      });
    });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test email functionality
router.post('/test-email', async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();

    db.get('SELECT email, name FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const emailTo = user?.email || process.env.EMAIL_TO;
      if (!emailTo) {
        return res.status(400).json({ error: 'No email address configured. Please set your email first.' });
      }

      // Check if email transporter is initialized
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(400).json({ 
          error: 'Email not configured. Please set EMAIL_USER and EMAIL_PASS in .env file and restart the server.' 
        });
      }

      try {
        await sendReminderEmail(emailTo, user?.name);
        res.json({ message: `Test email sent successfully to ${emailTo}. Please check your inbox (and spam folder).` });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        
        // Provide more helpful error messages
        let errorMessage = 'Failed to send email. ';
        if (emailError.code === 'EAUTH') {
          errorMessage += 'Authentication failed. Please check your EMAIL_USER and EMAIL_PASS in .env file. For Gmail, make sure you\'re using an App Password, not your regular password.';
        } else if (emailError.code === 'ECONNECTION') {
          errorMessage += 'Connection failed. Please check your EMAIL_HOST and EMAIL_PORT in .env file.';
        } else {
          errorMessage += emailError.message || 'Please check your email configuration in .env file.';
        }
        
        res.status(500).json({ 
          error: errorMessage,
          details: emailError.message,
          code: emailError.code
        });
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

