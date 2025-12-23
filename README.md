# Weight Tracker

A simple web application to track daily weight with password protection and email reminders.

## Features

- Password-protected access
- Daily email reminders to log weight
- Easy input for target weight and current weight
- Interactive graphs showing day-on-day, week-on-week, and month-on-month trends

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your email app password (for Gmail, use App Password)
- `EMAIL_TO`: Email address to receive reminders
- `JWT_SECRET`: A random secret key for authentication

3. Run the application:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Default Login Credentials

On first run, use these default credentials:
- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change the password after first login for security!

## Email Setup

For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASS`

