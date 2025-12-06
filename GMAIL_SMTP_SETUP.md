# Gmail SMTP Setup Guide

## Problem
You're getting an OAuth error: `invalid_grant` when trying to send emails. This happens because Gmail OAuth tokens expire and require complex refresh token management.

## Solution: Use Gmail App Password (Recommended)

Using an App Password is simpler and more reliable than OAuth for SMTP.

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Still in Security settings, find **2-Step Verification**
2. Click on **2-Step Verification**
3. Scroll down and click **App passwords**
4. You may need to sign in again
5. Select **Mail** as the app
6. Select **Other (Custom name)** as the device
7. Enter a name like "Laravel HIMS"
8. Click **Generate**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Add or update these lines in your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the 16-character App Password (remove spaces)
- Use port `587` with `tls` encryption (or port `465` with `ssl`)

### Step 4: Clear Config Cache
Run this command to clear the configuration cache:

```bash
php artisan config:clear
```

### Step 5: Test Email Sending
Test if emails are working:

```bash
php artisan test:email-verification your-email@gmail.com
```

Or create a test user and check if verification emails are sent.

## Alternative: Use Mailtrap (Development)
If you're in development, you can use Mailtrap instead:

1. Sign up at https://mailtrap.io/
2. Get your SMTP credentials from Mailtrap
3. Update `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
```

## Troubleshooting

### Still getting OAuth errors?
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the App Password was copied correctly (no spaces)
- Clear config cache: `php artisan config:clear`

### "Less secure app access" error?
- Google no longer supports "less secure apps"
- You **must** use an App Password with 2-Step Verification enabled

### Emails going to spam?
- Make sure `MAIL_FROM_ADDRESS` matches your Gmail address
- Consider setting up SPF/DKIM records if using a custom domain

