# Email Setup Guide

## Quick Setup

1. **Create `.env` file** in the root directory (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your email credentials:
   ```
   PORT=5000
   JWT_SECRET=your-random-secret-key-here
   DB_PATH=./weight_tracker.db
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   EMAIL_TO=your-email@gmail.com
   ```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "Weight Tracker" as the name
5. Click "Generate"
6. Copy the 16-character password (no spaces)
7. Paste it into `EMAIL_PASS` in your `.env` file

### Step 3: Update `.env` file
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  (the 16-character app password)
EMAIL_TO=your-email@gmail.com
```

## Other Email Providers

### Outlook/Hotmail
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

## Testing Email

1. **Set your email** in the Settings section of the app
2. **Click "Test Email"** button
3. Check your inbox for the test email
4. If it fails, check:
   - `.env` file is in the root directory
   - Email credentials are correct
   - App password is used (not regular password for Gmail)
   - Server is restarted after changing `.env`

## Daily Reminders

Once configured, the app will automatically send daily reminders at **9:00 AM** to:
- Your email address (if set in Settings)
- Or the `EMAIL_TO` address from `.env` file

## Troubleshooting

### "Email test failed" error
- Verify `.env` file exists and has correct values
- Restart the server after changing `.env`
- For Gmail: Make sure you're using an App Password, not your regular password
- Check that 2FA is enabled for Gmail

### "No email address configured"
- Set your email in the Settings section
- Or set `EMAIL_TO` in `.env` file

### Emails not sending
- Check server logs for error messages
- Verify SMTP settings match your email provider
- Some email providers block automated emails - check spam folder

