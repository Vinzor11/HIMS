# Railway Environment Variables Setup Guide

This guide will help you configure all necessary environment variables for your Laravel HIMS application on Railway.

## How to Add Variables in Railway

1. Go to your Railway project dashboard
2. Select your service
3. Click on the **Variables** tab
4. Add each variable below with its corresponding value

## Required Environment Variables

### 1. Application Configuration

```env
APP_NAME=HIMS
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-app-name.up.railway.app
APP_TIMEZONE=UTC
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
```

**Important Notes:**
- **APP_KEY**: Generate this by running `php artisan key:generate` locally, then copy the value from your `.env` file
- **APP_URL**: Railway will provide this automatically when you deploy. You can also find it in your service settings. It will look like `https://your-app-name.up.railway.app`

### 2. Database Configuration

Railway provides PostgreSQL by default. If you added a PostgreSQL service:

```env
DB_CONNECTION=pgsql
DB_HOST=your-postgres-host.railway.app
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=your-postgres-password
```

**How to get these values:**
- In Railway, click on your PostgreSQL service
- Go to the **Variables** tab
- Railway automatically provides these variables. You can reference them or copy the values:
  - `PGHOST` → use as `DB_HOST`
  - `PGPORT` → use as `DB_PORT`
  - `PGDATABASE` → use as `DB_DATABASE`
  - `PGUSER` → use as `DB_USERNAME`
  - `PGPASSWORD` → use as `DB_PASSWORD`

**Alternative:** Railway also provides a `DATABASE_URL` variable. You can use:
```env
DB_URL=postgresql://user:password@host:port/database
```

### 3. Mail Configuration (Gmail SMTP)

Based on your GMAIL_SMTP_SETUP.md, configure Gmail:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME=HIMS
```

**To get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password (remove spaces)

### 4. Session & Cache Configuration

```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### 5. Logging Configuration

```env
LOG_CHANNEL=stack
LOG_LEVEL=error
```

## Quick Setup Steps

1. **Generate APP_KEY** (if you haven't already):
   ```bash
   php artisan key:generate
   ```
   Copy the `APP_KEY` value from your local `.env` file.

2. **Add PostgreSQL Service** (if not already added):
   - In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create the database

3. **Copy Database Variables**:
   - Railway provides database connection variables automatically
   - Copy them to your application service variables

4. **Set APP_URL**:
   - Railway provides this automatically
   - Or find it in your service settings under "Domains"

5. **Add All Variables**:
   - Go to your application service → Variables tab
   - Add all the variables listed above

6. **Run Migrations**:
   After deployment, you may need to run migrations. Railway can do this automatically with a build command, or you can add it to your deployment script.

## Railway-Specific Tips

1. **Automatic Variables**: Railway provides some variables automatically:
   - `RAILWAY_ENVIRONMENT`
   - `RAILWAY_PROJECT_ID`
   - `RAILWAY_SERVICE_NAME`

2. **Database URL**: Railway provides `DATABASE_URL` for PostgreSQL. You can use this instead of individual DB variables:
   ```env
   DB_URL=${DATABASE_URL}
   ```

3. **Build Command**: Make sure your Railway service has the correct build command:
   ```
   composer install --no-dev --optimize-autoloader && npm ci && npm run build
   ```

4. **Start Command**: Your start command should be:
   ```
   php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
   ```

## Verification Checklist

After setting up variables, verify:
- [ ] APP_KEY is set (required for encryption)
- [ ] Database variables are correct
- [ ] APP_URL matches your Railway domain
- [ ] Mail configuration is set (if using email features)
- [ ] APP_DEBUG is set to `false` for production

## Troubleshooting

**Application shows "No application encryption key set":**
- Make sure `APP_KEY` is set in Railway variables

**Database connection errors:**
- Verify all DB_* variables are correct
- Check that PostgreSQL service is running
- Ensure database service is linked to your app service

**Emails not sending:**
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check that 2-Step Verification is enabled on your Google account
- Ensure MAIL_FROM_ADDRESS matches your Gmail address

