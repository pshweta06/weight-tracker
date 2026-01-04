const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../weight_tracker.db');

let db;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');

      // Create tables
      db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          name TEXT,
          target_weight REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Add name column if it doesn't exist (for existing databases)
        db.run(`ALTER TABLE users ADD COLUMN name TEXT`, (err) => {
          // Ignore error if column already exists
        });

        // Weight entries table
        db.run(`CREATE TABLE IF NOT EXISTS weight_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          weight REAL NOT NULL,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE(user_id, date)
        )`);

        // Create default user if doesn't exist
        db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (err) {
            console.error('Error checking default user:', err);
            reject(err);
            return;
          }

          if (!row) {
            const defaultPassword = 'admin123'; // Change this in production!
            bcrypt.hash(defaultPassword, 10, (err, hash) => {
              if (err) {
                console.error('Error hashing default password:', err);
                reject(err);
                return;
              }
              db.run(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                ['admin', hash],
                (err) => {
                  if (err) {
                    console.error('Error creating default user:', err);
                    reject(err);
                  } else {
                    console.log('Default user created. Username: admin, Password: admin123');
                    resolve();
                  }
                }
              );
            });
          } else {
            resolve();
          }
        });
      });
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = { initDatabase, getDb };

