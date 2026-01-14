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

    // HR System API routes
    Route::prefix('hr-system')->name('hr-system.')->group(function () {
        Route::get('/', [\App\Http\Controllers\HRSystemController::class, 'index'])->name('index');
        Route::get('/employees', [\App\Http\Controllers\HRSystemController::class, 'getEmployees'])->name('employees.index');
        Route::get('/employee/me', [\App\Http\Controllers\HRSystemController::class, 'getCurrentEmployee'])->name('employee.me');
        Route::get('/employee/{employeeId}', [\App\Http\Controllers\HRSystemController::class, 'getEmployee'])->name('employee.show');
        Route::get('/departments', [\App\Http\Controllers\HRSystemController::class, 'getDepartments'])->name('departments.index');
        Route::get('/departments/{departmentId}', [\App\Http\Controllers\HRSystemController::class, 'getDepartment'])->name('departments.show');
        Route::get('/faculties', [\App\Http\Controllers\HRSystemController::class, 'getFaculties'])->name('faculties.index');
        Route::get('/faculties/{facultyId}', [\App\Http\Controllers\HRSystemController::class, 'getFaculty'])->name('faculties.show');
        Route::post('/refresh', [\App\Http\Controllers\HRSystemController::class, 'refresh'])->name('refresh');
    });
});

require __DIR__.'/settings.php';
