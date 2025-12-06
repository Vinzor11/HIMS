# OAuth Troubleshooting Guide

## Error: "invalid_client" / "Client authentication failed"

This error means your OAuth provider rejected the client credentials. Here's how to fix it:

### 1. Verify Your Credentials in Railway

Go to Railway → Your Service → Variables and check:

- **OAUTH_CLIENT_ID** - Should match exactly what's in your OAuth provider
- **OAUTH_CLIENT_SECRET** - Should match exactly (no extra spaces, quotes, or newlines)
- **OAUTH_PROVIDER_URL** - Should be the base URL (e.g., `https://oauth-provider.com`, not `https://oauth-provider.com/oauth`)
- **OAUTH_REDIRECT_URI** - Should be `https://hims-production.up.railway.app/oauth/callback` (must match exactly what's registered)

### 2. Check for Common Issues

#### Issue: Extra Quotes or Spaces
❌ **Wrong:**
```
OAUTH_CLIENT_ID="123456"
OAUTH_CLIENT_SECRET="secret123"
```

✅ **Correct:**
```
OAUTH_CLIENT_ID=123456
OAUTH_CLIENT_SECRET=secret123
```

**Note:** Railway automatically handles quotes, but if you copy-paste from a document, make sure there are no extra spaces.

#### Issue: Redirect URI Mismatch
The redirect URI in your Railway variables **must exactly match** what's registered with your OAuth provider.

✅ **Correct format:**
```
OAUTH_REDIRECT_URI=https://hims-production.up.railway.app/oauth/callback
```

Check in your OAuth provider:
- No trailing slashes
- Exact protocol (https, not http)
- Exact domain
- Exact path (`/oauth/callback`)

#### Issue: Provider URL Format
❌ **Wrong:**
```
OAUTH_PROVIDER_URL=https://provider.com/oauth
```

✅ **Correct:**
```
OAUTH_PROVIDER_URL=https://provider.com
```

The code automatically appends `/oauth/authorize`, `/oauth/token`, etc.

### 3. Verify OAuth Provider Configuration

In your OAuth provider's admin panel, verify:

1. **Client ID** matches `OAUTH_CLIENT_ID` in Railway
2. **Client Secret** matches `OAUTH_CLIENT_SECRET` in Railway
3. **Redirect URI** is registered as: `https://hims-production.up.railway.app/oauth/callback`
4. **Client is active/enabled** (not revoked or disabled)

### 4. Check Railway Logs

1. Go to Railway → Your Service → Deployments
2. Click on the latest deployment
3. Check the logs for OAuth-related messages
4. Look for lines like:
   - `OAuth authorization redirect`
   - `OAuth token exchange attempt`
   - `OAuth token exchange failed`

The logs will show what's being sent (with sensitive data partially masked).

### 5. Test Authentication Method

The updated code now tries two methods:
1. **Basic Authentication** (client_id:client_secret in Authorization header) - Used by Laravel Passport
2. **Form-based Authentication** (client_id and client_secret in POST body) - Used by some other providers

If your provider uses a different method, you may need to modify the OAuth controller.

### 6. Common OAuth Provider-Specific Issues

#### Laravel Passport
- Requires **Basic Authentication** (the code now handles this automatically)
- Make sure the client is a "password" or "authorization code" grant type
- Redirect URI must be in the `redirect` field of the `oauth_clients` table

#### Custom OAuth Provider
- Verify the endpoints match:
  - `{OAUTH_PROVIDER_URL}/oauth/authorize`
  - `{OAUTH_PROVIDER_URL}/oauth/token`
  - `{OAUTH_PROVIDER_URL}/oauth/userinfo`
- Check if your provider requires additional parameters
- Verify the scopes requested: `openid profile email`

### 7. Quick Checklist

Before trying again, verify:

- [ ] `OAUTH_CLIENT_ID` is set and correct (no quotes, no spaces)
- [ ] `OAUTH_CLIENT_SECRET` is set and correct (no quotes, no spaces)
- [ ] `OAUTH_PROVIDER_URL` is the base URL (no `/oauth` suffix)
- [ ] `OAUTH_REDIRECT_URI` is exactly `https://hims-production.up.railway.app/oauth/callback`
- [ ] Redirect URI is registered in your OAuth provider
- [ ] Client is active in your OAuth provider
- [ ] Credentials match exactly (case-sensitive)
- [ ] Railway has redeployed after adding variables

### 8. Still Not Working?

1. **Check the exact error in Railway logs** - Look for the full error response
2. **Test with a tool like Postman** - Try the token endpoint manually to see what your provider expects
3. **Contact your OAuth provider admin** - They can verify the client configuration on their end
4. **Check if your provider requires additional scopes or parameters**

### Example: Testing Token Endpoint Manually

You can test if your credentials work using curl:

```bash
# For Basic Auth (Laravel Passport style)
curl -X POST https://your-provider.com/oauth/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=https://hims-production.up.railway.app/oauth/callback"

# For Form-based Auth
curl -X POST https://your-provider.com/oauth/token \
  -d "grant_type=authorization_code" \
  -d "client_id=CLIENT_ID" \
  -d "client_secret=CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=https://hims-production.up.railway.app/oauth/callback"
```

Replace the placeholders with your actual values. If this works, the issue might be in how the code sends the request. If it doesn't work, the issue is with your credentials or provider configuration.

