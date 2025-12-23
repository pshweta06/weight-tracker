# Quick Email Setup Guide

## Option 1: Use Outlook/Hotmail (Easiest!)

Outlook/Hotmail works with your regular password (no App Password needed):

1. **Update your `.env` file:**
   ```
   EMAIL_HOST=smtp-mail.outlook.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-regular-password
   EMAIL_TO=your-email@outlook.com
   ```

2. **That's it!** No App Password needed.

## Option 2: Use Gmail (If App Password Works)

If you can get App Password working:

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" → "Other" → Name it "Weight Tracker"
   - Copy the 16-character password

3. **Update `.env`:**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_TO=your-email@gmail.com
   ```

## Option 3: Skip Email (App Works Fine!)

**The app works perfectly without email!**

- All weight tracking features work
- Graphs and statistics work
- Only email reminders won't work
- You can add email later

**To skip email:**
- Just leave EMAIL_USER and EMAIL_PASS empty in `.env`
- Or don't configure them at all
- The app will show a warning but continue working

## Option 4: Use Yahoo Mail

Similar to Gmail, requires App Password:
1. Go to: https://login.yahoo.com/account/security
2. Enable "Generate app password"
3. Create app password for "Mail"
4. Use it in `.env`

## Testing

After updating `.env`:
1. Restart server: `npm run dev`
2. Log in to app
3. Go to Settings
4. Enter your email
5. Click "Test Email"

