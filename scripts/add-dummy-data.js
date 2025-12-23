require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../weight_tracker.db');

const dummyData = [
  { date: '2025-12-17', weight: 61.4 },
  { date: '2025-12-18', weight: 61.1 },
  { date: '2025-12-22', weight: 62.1 },
];

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Get the admin user ID
db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, user) => {
  if (err) {
    console.error('Error fetching user:', err);
    db.close();
    process.exit(1);
  }

  if (!user) {
    console.error('Admin user not found');
    db.close();
    process.exit(1);
  }

  const userId = user.id;
  console.log(`Found user ID: ${userId}`);

  // Insert dummy data
  let completed = 0;
  dummyData.forEach((entry) => {
    db.run(
      `INSERT INTO weight_entries (user_id, weight, date)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, date) DO UPDATE SET weight = ?`,
      [userId, entry.weight, entry.date, entry.weight],
      function(err) {
        if (err) {
          console.error(`Error inserting ${entry.date}:`, err);
        } else {
          console.log(`✓ Added weight entry: ${entry.date} - ${entry.weight} kg`);
        }
        completed++;
        if (completed === dummyData.length) {
          console.log('\nAll dummy data added successfully!');
          db.close();
        }
      }
    );
  });
});

