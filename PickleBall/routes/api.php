<?php

use App\Http\Controllers\PostController;
use App\Modules\Booking\Http\Controllers\Admin\AdminCourtController;
use App\Modules\Booking\Http\Controllers\Admin\CheckInAdminController;
use App\Modules\Booking\Http\Controllers\CourtController;
use App\Modules\Booking\Http\Controllers\HoldController;
use App\Modules\Booking\Http\Controllers\SlotController;
use App\Modules\Order\Http\Controllers\Admin\AdminOrderController;
use App\Modules\Order\Http\Controllers\CheckoutController;
use App\Modules\Order\Http\Controllers\OrderController;
use App\Modules\Order\Http\Controllers\PaymentWebhookController;
use App\Modules\Report\Http\Controllers\ReportController;
use App\Modules\Shop\Http\Controllers\Admin\AdminProductController;
use App\Modules\Shop\Http\Controllers\BrandController;
use App\Modules\Shop\Http\Controllers\CartController;
use App\Modules\Shop\Http\Controllers\CategoryController;
use App\Modules\Shop\Http\Controllers\ProductController;
use App\Modules\User\Http\Controllers\AuthController;
use App\Modules\User\Http\Controllers\ProfileController;
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
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Public Shop Catalog
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/brands', [BrandController::class, 'index']);

    // Public Blog Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{slug}', [PostController::class, 'show']);

    // Public Court & Slot Availability
    Route::get('/courts', [CourtController::class, 'index']);
    Route::get('/courts/{id}', [CourtController::class, 'show']);
    Route::get('/slots', [SlotController::class, 'index']);

    // Cart (Public & Guest via X-Session-Id header)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::put('/cart/items/{id}', [CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [CartController::class, 'destroy']);

    // Booking Holds (Public & Guest)
    Route::post('/booking/hold', [HoldController::class, 'store']);
    Route::delete('/booking/hold/{id}', [HoldController::class, 'destroy']);

    // Webhooks (Cấp 2 - Realtime Bank Gateway)
    Route::post('/webhooks/payment/momo', [PaymentWebhookController::class, 'momoWebhook']);
    Route::post('/webhooks/payment/vietqr', [PaymentWebhookController::class, 'vietqrWebhook']);

    // ── 2. Protected Routes (Customer Auth) ──────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // User Auth & Profile
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/user/profile', [ProfileController::class, 'show']);
        Route::put('/user/profile', [ProfileController::class, 'update']);
        Route::post('/user/email/send-otp', [ProfileController::class, 'sendEmailOtp']);
        Route::post('/user/email/verify-otp', [ProfileController::class, 'verifyEmailOtp']);

        // Checkout Saga
        Route::post('/checkout', [CheckoutController::class, 'store']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{code}', [OrderController::class, 'show']);
    });

    // ── 3. Admin & Staff Shared Routes (Read-only Catalog, POS Orders & Scan) ────
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin|super_admin|staff'])->group(function () {
        // Check-in QR Scan
        Route::post('/checkin/scan', [CheckInAdminController::class, 'scan']);

        // Staff & Admin View Catalog & Orders for POS
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/courts', [AdminCourtController::class, 'index']);
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::get('/posts', [PostController::class, 'adminIndex']);
    });

    // ── 4. Admin Only Operations (Stock Adjustments, Deletions, Reports & Locks) ──
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin|super_admin'])->group(function () {
        // Admin Product CRUD & Inventory Adjustment
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::post('/products/{id}/stock', [AdminProductController::class, 'adjustStock']);

        // Admin Emergency Court Lock
        Route::post('/courts/{id}/lock', [AdminCourtController::class, 'toggleStatus']);

        // Sensitive Financial & Utilization Reports
        Route::get('/reports/revenue', [ReportController::class, 'revenue']);
        Route::get('/reports/utilization-rate', [ReportController::class, 'utilization']);

        // Blog Post Modification
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    });
});
