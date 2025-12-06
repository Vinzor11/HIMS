# OAuth "invalid_client" Error - Diagnostic Checklist

If you're getting `{"error":"invalid_client","error_description":"Client authentication failed"}`, follow this checklist:

## Step 1: Verify Railway Variables

Go to Railway → Your Service → Variables and check each variable:

### ✅ OAUTH_CLIENT_ID
- [ ] Variable exists
- [ ] Value matches exactly what your OAuth provider gave you
- [ ] No quotes around the value
- [ ] No extra spaces before or after
- [ ] No newlines or special characters

**Example:**
```
OAUTH_CLIENT_ID=abc123xyz789
```

### ✅ OAUTH_CLIENT_SECRET
- [ ] Variable exists
- [ ] Value matches exactly what your OAuth provider gave you
- [ ] No quotes around the value
- [ ] No extra spaces before or after
- [ ] No newlines or special characters
- [ ] If it contains special characters, they should be URL-encoded if needed

**Example:**
```
OAUTH_CLIENT_SECRET=secret456abc789
```

### ✅ OAUTH_PROVIDER_URL
- [ ] Variable exists
- [ ] Uses HTTPS (not HTTP) if your provider uses HTTPS
- [ ] Base URL only (no `/oauth` suffix)
- [ ] No trailing slash

**Correct Examples:**
```
OAUTH_PROVIDER_URL=https://your-domain.com
OAUTH_PROVIDER_URL=https://oauth.example.com
```

**Wrong Examples:**
```
OAUTH_PROVIDER_URL=https://your-domain.com/oauth  ❌
OAUTH_PROVIDER_URL=https://your-domain.com/       ❌
OAUTH_PROVIDER_URL=your-domain.com                ❌ (missing https://)
```

### ✅ OAUTH_REDIRECT_URI
- [ ] Variable exists (or will be auto-generated)
- [ ] Must exactly match what's registered with your OAuth provider
- [ ] Uses HTTPS (not HTTP)
- [ ] Full URL including `/oauth/callback`

**Correct Example:**
```
OAUTH_REDIRECT_URI=https://hims-production.up.railway.app/oauth/callback
```

## Step 2: Verify OAuth Provider Configuration

In your OAuth provider's admin panel, verify:

### Client Configuration
- [ ] **Client ID** matches `OAUTH_CLIENT_ID` in Railway (exact match, case-sensitive)
- [ ] **Client Secret** matches `OAUTH_CLIENT_SECRET` in Railway (exact match, case-sensitive)
- [ ] **Client is active/enabled** (not revoked, disabled, or expired)
- [ ] **Grant type** is set to `authorization_code` or `authorization code`

### Redirect URI Registration
- [ ] Redirect URI is registered in your OAuth provider
- [ ] Registered URI is exactly: `https://hims-production.up.railway.app/oauth/callback`
- [ ] No trailing slash
- [ ] Uses HTTPS (not HTTP)
- [ ] Matches `OAUTH_REDIRECT_URI` in Railway exactly

## Step 3: Check Railway Logs

1. Go to Railway → Your Service → Deployments
2. Click on the latest deployment
3. Click "View Logs"
4. Look for OAuth-related log entries:
   - `OAuth token exchange attempt`
   - `OAuth token exchange failed`
   - Look for the `status`, `error`, and `error_description` fields

## Step 4: Common Issues and Solutions

### Issue: Credentials Have Quotes
**Symptom:** Credentials look correct but still fail

**Solution:** Remove quotes from Railway variables
```
❌ OAUTH_CLIENT_ID="abc123"
✅ OAUTH_CLIENT_ID=abc123
```

### Issue: Extra Spaces
**Symptom:** Credentials look correct but authentication fails

**Solution:** Check for spaces before or after the `=` sign
```
❌ OAUTH_CLIENT_ID = abc123
❌ OAUTH_CLIENT_ID= abc123
❌ OAUTH_CLIENT_ID=abc123 
✅ OAUTH_CLIENT_ID=abc123
```

### Issue: Redirect URI Mismatch
**Symptom:** Works until callback, then fails

**Solution:** 
1. Check Railway variable `OAUTH_REDIRECT_URI`
2. Verify it's registered in your OAuth provider
3. Must match exactly (including protocol, domain, path)

### Issue: Provider URL Wrong Format
**Symptom:** Can't reach OAuth endpoints

**Solution:** Use base URL only
```
❌ OAUTH_PROVIDER_URL=https://domain.com/oauth
✅ OAUTH_PROVIDER_URL=https://domain.com
```

### Issue: Client Secret Contains Special Characters
**Symptom:** Authentication fails even with correct secret

**Solution:** 
- Some special characters might need URL encoding
- Try copying the secret directly from your OAuth provider
- Make sure there are no hidden characters

## Step 5: Test with Manual Request

You can test if your credentials work using curl:

```bash
# Replace with your actual values
CLIENT_ID="your-client-id"
CLIENT_SECRET="your-client-secret"
TOKEN_URL="https://your-domain.com/oauth/token"
REDIRECT_URI="https://hims-production.up.railway.app/oauth/callback"
AUTH_CODE="authorization-code-from-provider"

# Test form-based authentication
curl -X POST "$TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "code=$AUTH_CODE" \
  -d "redirect_uri=$REDIRECT_URI"

# Test Basic Auth (if form-based fails)
curl -X POST "$TOKEN_URL" \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=$AUTH_CODE" \
  -d "redirect_uri=$REDIRECT_URI"
```

If curl works but the app doesn't, there might be an issue with how the request is being sent.

## Step 6: Verify After Changes

After making any changes to Railway variables:

1. **Wait for Railway to redeploy** (usually automatic, or trigger manually)
2. **Clear your browser cache** and cookies
3. **Try OAuth login again**
4. **Check Railway logs** for new error messages

## Still Not Working?

If you've checked everything above and it still doesn't work:

1. **Double-check credentials** - Copy/paste directly from your OAuth provider
2. **Verify redirect URI** - Must match exactly in both places
3. **Check Railway logs** - Look for the detailed error messages
4. **Contact your OAuth provider admin** - They can verify the client configuration on their end
5. **Share the Railway logs** - The logs will show exactly what's being sent and what error is returned

## Quick Verification Script

To verify your Railway variables are set correctly, you can temporarily add this to a route (remove after testing):

```php
Route::get('/oauth-test', function() {
    return [
        'client_id_set' => !empty(config('services.oauth.client_id')),
        'client_id_length' => strlen(config('services.oauth.client_id') ?? ''),
        'client_secret_set' => !empty(config('services.oauth.client_secret')),
        'client_secret_length' => strlen(config('services.oauth.client_secret') ?? ''),
        'provider_url' => config('services.oauth.provider_url'),
        'redirect_uri' => config('services.oauth.redirect_uri') ?: url('/oauth/callback'),
    ];
});
```

This will help you verify that the variables are being read correctly (without exposing the actual values).

