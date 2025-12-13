<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LogoutResponse;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        // Check if user authenticated via SSO
        $isSSOUser = session('auth_method') === 'sso';
        $hrSystemUrl = session('hr_system_url');

        // Clear local session
        Auth::logout();
        $request->session()->flush();

        if ($isSSOUser && $hrSystemUrl) {
            // SSO logout - redirect to HR system
            $redirectUri = urlencode(config('app.url') . '/logged-out');
            $logoutUrl = rtrim($hrSystemUrl, '/') . '/oauth/end-session?post_logout_redirect_uri=' . $redirectUri;

            \Log::info('SSO logout initiated', [
                'hr_system_url' => $hrSystemUrl,
                'redirect_uri' => config('app.url') . '/logged-out',
            ]);

            return redirect($logoutUrl);
        } else {
            // Direct logout - redirect to login page
            \Log::info('Direct logout initiated');
            return redirect('/login')->with('message', 'Logged out successfully');
        }
    }

    public function handlePostLogout()
    {
        // Clear any remaining session data
        session()->flush();

        \Log::info('Post-logout redirect handled');

        return redirect('/login')->with('message', 'You have been logged out successfully');
    }
}
