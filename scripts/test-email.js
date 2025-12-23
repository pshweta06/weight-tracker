require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('Testing email configuration...\n');
  
  // Check environment variables
  console.log('Email Configuration:');
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || '587'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***SET***' : 'NOT SET'}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS not set in .env file');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
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

  // Verify connection
  console.log('Verifying email connection...');
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified!\n');
  } catch (error) {
    console.error('❌ Email server verification failed:');
    console.error(`   Error: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.error('\n💡 TIP: Authentication failed. Common issues:');
      console.error('   - For Gmail: Make sure you\'re using an App Password, not your regular password');
      console.error('   - App Password should be 16 characters (no spaces)');
      console.error('   - Make sure 2-Step Verification is enabled');
    }
    process.exit(1);
  }

  // Send test email
  const emailTo = process.env.EMAIL_TO || process.env.EMAIL_USER;
  console.log(`Sending test email to ${emailTo}...`);
  
  try {
    const info = await transporter.sendMail({
      from: `"Weight Tracker" <${process.env.EMAIL_USER}>`,
      to: emailTo,
      subject: 'Test Email from Weight Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p>If you received this email, your email configuration is working correctly!</p>
          <p>Your Weight Tracker app is ready to send daily reminders.</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Check your inbox at: ${emailTo}`);
    console.log('   (Also check spam folder if you don\'t see it)');
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(`   Error: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.error('\n💡 TIP: Authentication failed. Check your EMAIL_PASS in .env file');
    }
    process.exit(1);
  }
};

testEmail().catch(console.error);

