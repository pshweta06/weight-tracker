# Render Environment Variables Setup

## Complete Environment Variables List

When setting up your Render deployment, add these environment variables:

### Required Variables

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | **CRITICAL** - Enables production mode |
| `PORT` | `10000` | Server port (Render auto-sets this, but you can specify) |
| `JWT_SECRET` | `<see-below>` | Secret key for JWT tokens (generate below) |
| `DB_PATH` | `./weight_tracker.db` | SQLite database file path |

### Email Configuration (Required for email reminders)

| Key | Value | Description |
|-----|-------|-------------|
| `EMAIL_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `EMAIL_PORT` | `587` | Gmail SMTP port |
| `EMAIL_USER` | `your-email@gmail.com` | Your Gmail address |
| `EMAIL_PASS` | `<app-password>` | Gmail App Password (not regular password) |
| `EMAIL_TO` | `your-email@gmail.com` | Default recipient email |

---

## Generate JWT_SECRET

Run this command to generate a secure JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Or use this pre-generated secure secret:**
```
a2aaaa5bd2decf8293a7308f1c983922b232818b321650f9d0df22e2e6e333ed
```

**Important:** 
- Use a long, random string (64+ characters)
- Never share your JWT_SECRET publicly
- Use different secrets for different environments

---

## How to Add in Render

1. **Go to Render Dashboard**
2. **Click on your service** (`weight-tracker`)
3. **Go to "Environment" tab**
4. **Click "Add Environment Variable"**
5. **Add each variable** one by one:
   - Key: `NODE_ENV`
   - Value: `production`
   - Click "Save"
6. **Repeat for all variables**

---

## Quick Copy-Paste Values

```
NODE_ENV=production
PORT=10000
JWT_SECRET=a2aaaa5bd2decf8293a7308f1c983922b232818b321650f9d0df22e2e6e333ed
DB_PATH=./weight_tracker.db
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=pshweta06@gmail.com
EMAIL_PASS=<your-gmail-app-password>
EMAIL_TO=pshweta06@gmail.com
```

**Replace:**
- `<your-gmail-app-password>` with your actual Gmail App Password
- Email addresses with your actual email

---

## Gmail App Password Setup

If you need to set up Gmail App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it: "Weight Tracker"
4. Click "Generate"
5. Copy the 16-character password
6. Use this as your `EMAIL_PASS` value

---

## Security Notes

- ✅ **JWT_SECRET**: Use a long random string (64+ characters)
- ✅ **EMAIL_PASS**: Use App Password, never your regular Gmail password
- ✅ **Keep secrets private**: Don't commit these to GitHub
- ✅ **Different secrets**: Use different JWT_SECRET for production vs development

---

## Verify Setup

After adding all variables:
1. Save all environment variables
2. Trigger a new deployment
3. Check logs to ensure server starts correctly
4. Test your app!

