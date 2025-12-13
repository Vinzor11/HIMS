<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// OAuth routes
Route::get('/oauth/redirect', [App\Http\Controllers\Auth\OAuthController::class, 'redirect'])
    ->name('oauth.redirect');

Route::get('/oauth/callback', [App\Http\Controllers\Auth\OAuthController::class, 'callback'])
    ->name('oauth.callback');

// Logout routes
Route::post('/logout', [App\Http\Controllers\Auth\LogoutController::class, 'logout'])
    ->middleware(['auth'])
    ->name('logout');

Route::get('/logged-out', [App\Http\Controllers\Auth\LogoutController::class, 'handlePostLogout'])
    ->name('logout.post');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', \App\Http\Controllers\UsersController::class);
    Route::resource('categories', \App\Http\Controllers\CategoriesController::class);
    Route::resource('products', \App\Http\Controllers\ProductsController::class);
});

require __DIR__.'/settings.php';
