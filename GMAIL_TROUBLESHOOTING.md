# Gmail App Password Troubleshooting

## Common Issues & Solutions

### Issue 1: "App Passwords" option not showing

**Possible Reasons:**
1. **2-Step Verification not enabled**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification" first
   - Wait a few minutes, then try App Passwords again

2. **Using Google Workspace (Business Account)**
   - App Passwords might be disabled by your admin
   - Contact your IT administrator
   - Or use a personal Gmail account instead

3. **Account restrictions**
   - Some accounts have restrictions
   - Try a different Gmail account

### Issue 2: Can't find App Passwords page

**Direct Link:**
https://myaccount.google.com/apppasswords

**Steps:**
1. Go to Google Account: https://myaccount.google.com/
2. Click "Security" (left sidebar)
3. Scroll down to "2-Step Verification"
4. Click on it
5. Scroll down to find "App passwords" section
6. Click "App passwords"

### Issue 3: "App passwords aren't available for this account"

**Solutions:**
- Use a personal Gmail account (not Workspace)
- Enable 2-Step Verification
- Wait 24 hours after enabling 2FA
- Try a different browser or incognito mode

## Alternative Solutions

### Option 1: Use a Different Email Provider

#### Outlook/Hotmail (Easier Setup)
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-regular-password
```

#### Yahoo Mail
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```
(Yahoo also requires App Password - similar to Gmail)

#### ProtonMail
```
EMAIL_HOST=127.0.0.1
EMAIL_PORT=1025
```
(Requires ProtonMail Bridge)

### Option 2: Use Gmail with "Less Secure Apps" (Not Recommended)

⚠️ **Warning:** This is less secure and Google may disable it.

1. Go to: https://myaccount.google.com/lesssecureapps
2. Enable "Allow less secure apps"
3. Use your regular Gmail password

**Note:** Google is phasing this out, so it may not work.

### Option 3: Use a Dedicated Email Service

#### SendGrid (Free tier available)
- Sign up at: https://sendgrid.com
- Get API key
- Use SMTP settings provided

#### Mailgun (Free tier available)
- Sign up at: https://www.mailgun.com
- Get SMTP credentials

### Option 4: Skip Email Reminders (Temporary)

You can disable email reminders and use the app without them:
- Just don't configure EMAIL_USER and EMAIL_PASS
- The app will work fine, just no email reminders
- You can add email later when you resolve the issue

## Recommended: Create a New Gmail Account

If you're having persistent issues:
1. Create a new personal Gmail account
2. Enable 2-Step Verification immediately
3. Generate App Password
4. Use this account specifically for the weight tracker

## Testing Without Email

The app works perfectly fine without email configuration:
- All weight tracking features work
- Graphs and statistics work
- Only email reminders won't work
- You can add email later

