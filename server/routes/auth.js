const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const db = getDb();

    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Generate username from email (part before @)
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Find available username - simplified approach
      const findAvailableUsername = (base, callback, counter = 0) => {
        const tryUsername = counter === 0 ? base : `${base}${counter}`;
        db.get('SELECT id FROM users WHERE username = ?', [tryUsername], (err, user) => {
          if (err) {
            return callback(err, null);
          }
          if (!user) {
            callback(null, tryUsername);
          } else {
            if (counter > 100) {
              return callback(new Error('Unable to generate unique username'), null);
            }
            findAvailableUsername(base, callback, counter + 1);
          }
        });
      };

      findAvailableUsername(baseUsername, async (err, finalUsername) => {
        if (err || !finalUsername) {
          console.error('Error finding username:', err);
          return res.status(500).json({ error: 'Failed to create account' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        db.run(
          'INSERT INTO users (username, password, email, name) VALUES (?, ?, ?, ?)',
          [finalUsername, hashedPassword, email, name.trim()],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              if (err.message.includes('UNIQUE constraint')) {
                return res.status(400).json({ error: 'Username or email already exists' });
              }
              return res.status(500).json({ error: 'Failed to create account' });
            }

            // Generate token
            const token = jwt.sign(
              { id: this.lastID, username: finalUsername },
              process.env.JWT_SECRET || 'default-secret-change-in-production',
              { expiresIn: '7d' }
            );

            res.status(201).json({
              token,
              user: {
                id: this.lastID,
                username: finalUsername,
                email: email,
                name: name.trim(),
                targetWeight: null
              },
              message: 'Account created successfully'
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const db = getDb();
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'default-secret-change-in-production',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          targetWeight: user.target_weight
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const db = getDb();
    
    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
        res.json({ message: 'Password updated successfully' });
      });
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

