<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — DemoPick Web v1
|--------------------------------------------------------------------------
| Prefix: /api/v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── 1. Auth & Public Catalog Routes ──────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [\App\Modules\User\Http\Controllers\AuthController::class, 'register']);
        Route::post('/login', [\App\Modules\User\Http\Controllers\AuthController::class, 'login']);
    });

    // Public Shop Catalog
    Route::get('/products', [\App\Modules\Shop\Http\Controllers\ProductController::class, 'index']);
    Route::get('/products/{slug}', [\App\Modules\Shop\Http\Controllers\ProductController::class, 'show']);
    Route::get('/categories', [\App\Modules\Shop\Http\Controllers\CategoryController::class, 'index']);
    Route::get('/brands', [\App\Modules\Shop\Http\Controllers\BrandController::class, 'index']);

    // Public Blog Posts
    Route::get('/posts', [\App\Http\Controllers\PostController::class, 'index']);
    Route::get('/posts/{slug}', [\App\Http\Controllers\PostController::class, 'show']);

    // Public Court & Slot Availability
    Route::get('/courts', [\App\Modules\Booking\Http\Controllers\CourtController::class, 'index']);
    Route::get('/courts/{id}', [\App\Modules\Booking\Http\Controllers\CourtController::class, 'show']);
    Route::get('/slots', [\App\Modules\Booking\Http\Controllers\SlotController::class, 'index']);

    // Cart (Public & Guest via X-Session-Id header)
    Route::get('/cart', [\App\Modules\Shop\Http\Controllers\CartController::class, 'index']);
    Route::post('/cart/items', [\App\Modules\Shop\Http\Controllers\CartController::class, 'store']);
    Route::put('/cart/items/{id}', [\App\Modules\Shop\Http\Controllers\CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [\App\Modules\Shop\Http\Controllers\CartController::class, 'destroy']);

    // Booking Holds (Public & Guest)
    Route::post('/booking/hold', [\App\Modules\Booking\Http\Controllers\HoldController::class, 'store']);
    Route::delete('/booking/hold/{id}', [\App\Modules\Booking\Http\Controllers\HoldController::class, 'destroy']);

    // Webhooks
    Route::post('/webhooks/payment/momo', [\App\Modules\Order\Http\Controllers\PaymentWebhookController::class, 'momoWebhook']);

    // ── 2. Protected Routes (Customer Auth) ──────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // User Auth & Profile
        Route::post('/auth/logout', [\App\Modules\User\Http\Controllers\AuthController::class, 'logout']);
        Route::get('/user/profile', [\App\Modules\User\Http\Controllers\ProfileController::class, 'show']);
        Route::put('/user/profile', [\App\Modules\User\Http\Controllers\ProfileController::class, 'update']);

        // Checkout Saga
        Route::post('/checkout', [\App\Modules\Order\Http\Controllers\CheckoutController::class, 'store']);

        // Orders
        Route::get('/orders', [\App\Modules\Order\Http\Controllers\OrderController::class, 'index']);
        Route::get('/orders/{code}', [\App\Modules\Order\Http\Controllers\OrderController::class, 'show']);
    });

    // ── 3. Admin Routes (Admin / Staff / Super Admin) ────────
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin|super_admin|staff'])->group(function () {

        // Check-in QR Scan
        Route::post('/checkin/scan', [\App\Modules\Booking\Http\Controllers\Admin\CheckInAdminController::class, 'scan']);

        // Admin Products & Stock Inventory Management
        Route::get('/products', [\App\Modules\Shop\Http\Controllers\Admin\AdminProductController::class, 'index']);
        Route::post('/products', [\App\Modules\Shop\Http\Controllers\Admin\AdminProductController::class, 'store']);
        Route::put('/products/{id}', [\App\Modules\Shop\Http\Controllers\Admin\AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [\App\Modules\Shop\Http\Controllers\Admin\AdminProductController::class, 'destroy']);
        Route::post('/products/{id}/stock', [\App\Modules\Shop\Http\Controllers\Admin\AdminProductController::class, 'adjustStock']);

        // Admin Court & Emergency Maintenance Lock
        Route::get('/courts', [\App\Modules\Booking\Http\Controllers\Admin\AdminCourtController::class, 'index']);
        Route::post('/courts/{id}/lock', [\App\Modules\Booking\Http\Controllers\Admin\AdminCourtController::class, 'toggleStatus']);

        // Admin Orders Management
        Route::get('/orders', [\App\Modules\Order\Http\Controllers\Admin\AdminOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [\App\Modules\Order\Http\Controllers\Admin\AdminOrderController::class, 'updateStatus']);

        // Admin Reporting & Analytics
        Route::get('/reports/revenue', [\App\Modules\Report\Http\Controllers\ReportController::class, 'revenue']);
        Route::get('/reports/utilization-rate', [\App\Modules\Report\Http\Controllers\ReportController::class, 'utilization']);

        // Blog Posts Management
        Route::get('/posts', [\App\Http\Controllers\PostController::class, 'adminIndex']);
        Route::post('/posts', [\App\Http\Controllers\PostController::class, 'store']);
        Route::put('/posts/{id}', [\App\Http\Controllers\PostController::class, 'update']);
        Route::delete('/posts/{id}', [\App\Http\Controllers\PostController::class, 'destroy']);
    });
});
