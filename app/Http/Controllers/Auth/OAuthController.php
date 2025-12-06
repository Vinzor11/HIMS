<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    public function redirect()
    {
        $clientId = config('services.oauth.client_id');
        $clientSecret = config('services.oauth.client_secret');
        $redirectUri = config('services.oauth.redirect_uri');
        $providerUrl = config('services.oauth.provider_url');
        
        // Validate configuration
        if (!$clientId) {
            return redirect('/login')->with('error', 'OAuth is not configured. Please contact your administrator.');
        }
        
        if (!$clientSecret) {
            return redirect('/login')->with('error', 'OAuth is not configured. Please contact your administrator.');
        }
        
        if (!$redirectUri) {
            $redirectUri = url('/oauth/callback');
        }
        
        if (!$providerUrl) {
            return redirect('/login')->with('error', 'OAuth is not configured. Please contact your administrator.');
        }
        
        $state = Str::random(40);
        session(['oauth_state' => $state]);
        
        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'state' => $state,
        ];
        
        $url = $providerUrl . '/oauth/authorize?' . http_build_query($params);
        
        // Log for debugging (without sensitive data)
        \Log::info('OAuth authorization redirect', [
            'provider_url' => $providerUrl,
            'redirect_uri' => $redirectUri,
            'client_id_preview' => substr($clientId, 0, 10) . '...',
        ]);
        
        return redirect($url);
    }
    
    public function callback(Request $request)
    {
        // Verify state
        if ($request->get('state') !== session('oauth_state')) {
            return redirect('/login')->with('error', 'Invalid state parameter');
        }
        
        $code = $request->get('code');
        
        if (!$code) {
            return redirect('/login')->with('error', 'Authorization failed');
        }
        
        $clientId = config('services.oauth.client_id');
        $clientSecret = config('services.oauth.client_secret');
        $redirectUri = config('services.oauth.redirect_uri') ?: url('/oauth/callback');
        $providerUrl = config('services.oauth.provider_url');
        
        // Log for debugging (remove sensitive data in production)
        \Log::info('OAuth token exchange attempt', [
            'client_id' => substr($clientId, 0, 10) . '...',
            'redirect_uri' => $redirectUri,
            'provider_url' => $providerUrl,
        ]);
        
        // Try Basic Auth first (some providers like Laravel Passport require this)
        $response = Http::withBasicAuth($clientId, $clientSecret)
            ->asForm()
            ->post($providerUrl . '/oauth/token', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $redirectUri,
            ]);
        
        // If Basic Auth fails, try form-based authentication
        if (!$response->successful() && $response->status() === 401) {
            \Log::info('Basic Auth failed, trying form-based authentication');
            $response = Http::asForm()->post($providerUrl . '/oauth/token', [
                'grant_type' => 'authorization_code',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'code' => $code,
                'redirect_uri' => $redirectUri,
            ]);
        }
        
        if (!$response->successful()) {
            $errorBody = $response->body();
            $errorJson = $response->json();
            
            \Log::error('OAuth token exchange failed', [
                'status' => $response->status(),
                'error' => $errorJson['error'] ?? 'unknown',
                'error_description' => $errorJson['error_description'] ?? $errorBody,
            ]);
            
            $errorMessage = $errorJson['error_description'] ?? $errorJson['error'] ?? 'Failed to get access token';
            return redirect('/login')->with('error', 'OAuth authentication failed: ' . $errorMessage);
        }
        
        $tokenData = $response->json();
        
        if (!isset($tokenData['access_token'])) {
            return redirect('/login')->with('error', 'Invalid token response');
        }
        
        // Get user info
        $userResponse = Http::withToken($tokenData['access_token'])
            ->get(config('services.oauth.provider_url') . '/oauth/userinfo');
        
        if (!$userResponse->successful()) {
            return redirect('/login')->with('error', 'Failed to get user info: ' . $userResponse->body());
        }
        
        $userInfo = $userResponse->json();
        
        if (!isset($userInfo['email'])) {
            return redirect('/login')->with('error', 'User email not found in OAuth response');
        }
        
        // Find or create user
        $user = \App\Models\User::firstOrCreate(
            ['email' => $userInfo['email']],
            [
                'name' => $userInfo['name'] ?? $userInfo['email'],
                'password' => bcrypt(Str::random(32)),
            ]
        );
        
        // Update user name if it changed
        if (isset($userInfo['name']) && $user->name !== $userInfo['name']) {
            $user->name = $userInfo['name'];
            $user->save();
        }
        
        // Login
        Auth::login($user);
        
        // Clear OAuth state
        session()->forget('oauth_state');
        
        return redirect('/dashboard');
    }
}

