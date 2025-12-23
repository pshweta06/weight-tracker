const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { getDb } = require('../database');

let transporter;

const initEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Email reminders will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error('Email transporter verification failed:', error.message);
      console.error('Check your EMAIL_USER and EMAIL_PASS in .env file');
    } else {
      console.log('Email server is ready to send messages');
    }
  });

  return transporter;
};

const sendReminderEmail = async (userEmail, userName) => {
  if (!transporter) {
    console.log('Email transporter not initialized. Skipping reminder.');
    return;
  }

  const emailTo = userEmail || process.env.EMAIL_TO;
  if (!emailTo) {
    console.log('No email address configured. Skipping reminder.');
    return;
  }

  // Use provided name or default to a generic greeting if no name
  const name = userName || 'there';

  try {
    const result = await transporter.sendMail({
      from: `"Weight Tracker" <${process.env.EMAIL_USER}>`,
      to: emailTo,
      subject: 'Daily Weight Log Reminder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Daily Weight Log Reminder</h2>
          <p>Hey ${name}, time for a weigh-in! Log your weight now to continue your kick-ass fitness journey.</p>
          <p style="margin-top: 30px;">
            <a href="http://localhost:3000" 
               style="background-color: #00b894; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Log My Weight
            </a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Love, Shweta
          </p>
        </div>
      `
    });
    console.log(`Reminder email sent to ${emailTo}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error; // Re-throw so caller can handle it
  }
};

const setupEmailReminder = () => {
  // Initialize email transporter
  initEmailTransporter();

  // Schedule daily reminder at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily email reminder job...');
    
    try {
      const db = getDb();
      db.all('SELECT email, name FROM users WHERE email IS NOT NULL AND email != ""', async (err, users) => {
        if (err) {
          console.error('Error fetching users for reminders:', err);
          return;
        }

        if (users.length === 0) {
          // Fallback to EMAIL_TO if no user emails configured
          await sendReminderEmail();
        } else {
          // Send to all users with email addresses
          for (const user of users) {
            await sendReminderEmail(user.email, user.name);
          }
        }
      });
    } catch (error) {
      console.error('Error in email reminder cron job:', error);
    }
  });

  console.log('Email reminder scheduled for 9:00 AM daily');
};

module.exports = { setupEmailReminder, sendReminderEmail };

