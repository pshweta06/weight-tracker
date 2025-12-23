require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../weight_tracker.db');

const resetPassword = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
    });

    const defaultPassword = 'admin123';
    bcrypt.hash(defaultPassword, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        db.close();
        reject(err);
        return;
      }

      db.run(
        "UPDATE users SET password = ? WHERE username = 'admin'",
        [hash],
        function(err) {
          if (err) {
            console.error('Error resetting password:', err);
            db.close();
            reject(err);
            return;
          }
          console.log('✅ Password reset successfully!');
          console.log('Username: admin');
          console.log('Password: admin123');
          db.close();
          resolve();
        }
      );
    });
  });
};

resetPassword().catch(console.error);

