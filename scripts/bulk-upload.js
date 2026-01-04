require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../weight_tracker.db');

// Example usage:
// node scripts/bulk-upload.js <userId> <entries.json>
// Or use the default example data below

// Example data format:
// [
//   { date: '2024-10-01', weight: 65.5 },
//   { date: '2024-10-02', weight: 65.3 },
//   { date: '2024-10-03', weight: 65.1 },
// ]

const exampleData = [
  // Add your historical data here
  // Format: { date: 'YYYY-MM-DD', weight: number }
  // Example for past few months:
  { date: '2024-10-01', weight: 65.5 },
  { date: '2024-10-05', weight: 65.3 },
  { date: '2024-10-10', weight: 65.1 },
  { date: '2024-10-15', weight: 64.9 },
  { date: '2024-10-20', weight: 64.7 },
  { date: '2024-10-25', weight: 64.5 },
  { date: '2024-11-01', weight: 64.3 },
  { date: '2024-11-05', weight: 64.1 },
  { date: '2024-11-10', weight: 63.9 },
  { date: '2024-11-15', weight: 63.7 },
  { date: '2024-11-20', weight: 63.5 },
  { date: '2024-11-25', weight: 63.3 },
  { date: '2024-12-01', weight: 63.1 },
  { date: '2024-12-05', weight: 62.9 },
  { date: '2024-12-10', weight: 62.7 },
  { date: '2024-12-15', weight: 62.5 },
];

function loadDataFromFile(filePath) {
  try {
    const fs = require('fs');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    process.exit(1);
  }
}

function validateEntry(entry, index) {
  if (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    throw new Error(`Entry ${index}: Invalid date format. Expected YYYY-MM-DD, got: ${entry.date}`);
  }
  if (!entry.weight || isNaN(entry.weight)) {
    throw new Error(`Entry ${index}: Invalid weight value. Expected a number, got: ${entry.weight}`);
  }
}

function bulkUpload(userId, entries) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to database');
    });

    // Verify user exists
    db.get('SELECT id, username FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        db.close();
        reject(err);
        return;
      }

      if (!user) {
        console.error(`User with ID ${userId} not found`);
        db.close();
        reject(new Error('User not found'));
        return;
      }

      console.log(`Found user: ${user.username} (ID: ${user.id})`);
      console.log(`Uploading ${entries.length} weight entries...\n`);

      // Validate all entries first
      try {
        entries.forEach((entry, index) => {
          validateEntry(entry, index);
        });
      } catch (error) {
        console.error('Validation error:', error.message);
        db.close();
        reject(error);
        return;
      }

      // Insert entries
      let completed = 0;
      let successCount = 0;
      let updateCount = 0;
      let errorCount = 0;
      const errors = [];

      entries.forEach((entry) => {
        db.run(
          `INSERT INTO weight_entries (user_id, weight, date)
           VALUES (?, ?, ?)
           ON CONFLICT(user_id, date) DO UPDATE SET weight = ?`,
          [userId, entry.weight, entry.date, entry.weight],
          function(err) {
            completed++;
            if (err) {
              console.error(`✗ Error inserting ${entry.date}:`, err.message);
              errorCount++;
              errors.push({ date: entry.date, weight: entry.weight, error: err.message });
            } else {
              // this.changes === 1 means INSERT, >1 means UPDATE
              if (this.changes === 1) {
                console.log(`✓ Added: ${entry.date} - ${entry.weight} kg`);
                successCount++;
              } else {
                console.log(`↻ Updated: ${entry.date} - ${entry.weight} kg`);
                updateCount++;
              }
            }

            // When all entries are processed
            if (completed === entries.length) {
              console.log('\n' + '='.repeat(50));
              console.log('Upload Summary:');
              console.log(`  Total entries: ${entries.length}`);
              console.log(`  Successfully added: ${successCount}`);
              console.log(`  Updated: ${updateCount}`);
              console.log(`  Failed: ${errorCount}`);
              if (errors.length > 0) {
                console.log('\nErrors:');
                errors.forEach(e => {
                  console.log(`  - ${e.date}: ${e.error}`);
                });
              }
              console.log('='.repeat(50));
              db.close();
              resolve({ successCount, updateCount, errorCount, errors });
            }
          }
        );
      });
    });
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node scripts/bulk-upload.js <userId> [entries.json]');
  console.log('\nExample:');
  console.log('  node scripts/bulk-upload.js 1');
  console.log('  node scripts/bulk-upload.js 1 data/weight-history.json');
  console.log('\nIf no JSON file is provided, example data will be used.');
  process.exit(1);
}

const userId = parseInt(args[0], 10);
if (isNaN(userId)) {
  console.error('Error: userId must be a number');
  process.exit(1);
}

let entries;
if (args[1]) {
  entries = loadDataFromFile(args[1]);
} else {
  entries = exampleData;
  console.log('Using example data. To use your own data, provide a JSON file as the second argument.');
  console.log('Example data format:');
  console.log(JSON.stringify(exampleData.slice(0, 3), null, 2));
  console.log('\n');
}

bulkUpload(userId, entries)
  .then(() => {
    console.log('\nBulk upload completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nBulk upload failed:', error.message);
    process.exit(1);
  });



