# OAuth Setup Guide

This guide will help you enable OAuth authentication for your HIMS application. The application uses OAuth 2.0 Authorization Code flow to authenticate users from an external OAuth provider (e.g., HR System).

## Prerequisites

You need an OAuth provider that supports:
- OAuth 2.0 Authorization Code flow
- The following endpoints:
  - `GET /oauth/authorize` - Authorization endpoint
  - `POST /oauth/token` - Token exchange endpoint
  - `GET /oauth/userinfo` - User information endpoint

## Step 1: Register Your Application with OAuth Provider

1. **Log in to your OAuth provider** (e.g., your HR System admin panel)
2. **Create a new OAuth application** or client
3. **Configure the following settings:**
   - **Application Name**: HIMS (or your preferred name)
   - **Redirect URI**: `https://hims-production.up.railway.app/oauth/callback`
   - **Scopes**: `openid profile email` (or whatever scopes your provider requires)
   - **Response Type**: `code` (Authorization Code)

4. **Save the credentials** provided by your OAuth provider:
   - **Client ID**
   - **Client Secret**
   - **Provider URL** (base URL of your OAuth provider, e.g., `https://hr-system.example.com`)

## Step 2: Configure Environment Variables in Railway

1. Go to your Railway project dashboard
2. Select your HIMS service
3. Click on the **Variables** tab
4. Add the following environment variables:

### Required Variables

```env
OAUTH_CLIENT_ID=your-client-id-here
OAUTH_CLIENT_SECRET=your-client-secret-here
OAUTH_PROVIDER_URL=https://your-oauth-provider.com
```

### Optional Variable

If your redirect URI is different from the default, you can set it explicitly:

```env
OAUTH_REDIRECT_URI=https://hims-production.up.railway.app/oauth/callback
```

**Note:** If you don't set `OAUTH_REDIRECT_URI`, it will automatically use `{APP_URL}/oauth/callback`.

## Step 3: Verify Configuration

After adding the variables:

1. **Redeploy your application** (Railway will automatically redeploy when you add variables, or you can trigger a manual redeploy)
2. **Visit your login page**: `https://hims-production.up.railway.app/login`
3. **Check for the OAuth button**: You should see a "Sign in with HR System" button below the regular login form

## Step 4: Test OAuth Login

1. Click the **"Sign in with HR System"** button
2. You should be redirected to your OAuth provider's login page
3. After logging in, you'll be redirected back to your HIMS application
4. The user account will be automatically created if it doesn't exist

## OAuth Provider Requirements

Your OAuth provider must implement the following endpoints:

### 1. Authorization Endpoint
```
GET {OAUTH_PROVIDER_URL}/oauth/authorize
```

**Query Parameters:**
- `client_id` - Your OAuth client ID
- `redirect_uri` - Callback URL
- `response_type` - Must be `code`
- `scope` - Requested scopes (e.g., `openid profile email`)
- `state` - Random state string for CSRF protection

**Response:** Redirects to `redirect_uri` with `code` and `state` parameters

### 2. Token Endpoint
```
POST {OAUTH_PROVIDER_URL}/oauth/token
```

**Request Body (form-urlencoded):**
- `grant_type` - `authorization_code`
- `client_id` - Your OAuth client ID
- `client_secret` - Your OAuth client secret
- `code` - Authorization code from step 1
- `redirect_uri` - Must match the redirect URI used in step 1

**Response (JSON):**
```json
{
  "access_token": "your-access-token",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 3. User Info Endpoint
```
GET {OAUTH_PROVIDER_URL}/oauth/userinfo
```

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (JSON):**
```json
{
  "email": "user@example.com",
  "name": "User Name"
}
```

## Common OAuth Providers

### If using Laravel Passport (Laravel-based OAuth provider)

1. Install Laravel Passport on your OAuth provider
2. Create a client:
   ```bash
   php artisan passport:client --name="HIMS"
   ```
3. Use the provided Client ID and Client Secret
4. Set `OAUTH_PROVIDER_URL` to your Laravel application URL

### If using a third-party provider (Google, Microsoft, etc.)

You may need to modify the OAuth controller to match the provider's specific endpoints and response formats. The current implementation follows a standard OAuth 2.0 flow.

## Troubleshooting

### OAuth button doesn't appear
- Check that all three variables are set: `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_PROVIDER_URL`
- Clear your browser cache
- Check Railway logs for any configuration errors

### "Invalid state parameter" error
- This usually means the session expired or there's a session configuration issue
- Make sure `SESSION_DRIVER` is set to `database` in Railway
- Check that sessions are working properly

### "Failed to get access token" error
- Verify your `OAUTH_CLIENT_SECRET` is correct
- Check that the `redirect_uri` matches exactly what's registered with your OAuth provider
- Ensure the authorization code hasn't expired (usually expires within 10 minutes)

### "Failed to get user info" error
- Verify the access token is valid
- Check that the `/oauth/userinfo` endpoint exists and is accessible
- Ensure the token has the required scopes

### User not created automatically
- Check that the user info response includes an `email` field
- Check Railway logs for any database errors
- Verify database connection is working

## Security Notes

1. **Never commit OAuth credentials** to version control
2. **Use HTTPS** for all OAuth endpoints (Railway provides this automatically)
3. **Keep your client secret secure** - it's stored in Railway environment variables
4. **Regularly rotate** your OAuth client secrets
5. **Monitor OAuth usage** in your OAuth provider's dashboard

## Example Configuration

Here's a complete example of what your Railway variables should look like:

```env
OAUTH_CLIENT_ID=1234567890-abcdefghijklmnop.apps.example.com
OAUTH_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
OAUTH_PROVIDER_URL=https://oauth-provider.example.com
OAUTH_REDIRECT_URI=https://hims-production.up.railway.app/oauth/callback
```

After setting these, the OAuth button will automatically appear on your login page!

