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
use App\Modules\Order\Http\Controllers\ShippingController;
use App\Modules\Order\Http\Controllers\OrderApiController;
use App\Modules\User\Http\Controllers\AuthController;
use App\Modules\User\Http\Controllers\ProfileController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — DemoPick Web v1
|--------------------------------------------------------------------------
| Prefix: /api/v1
|--------------------------------------------------------------------------
*/

// Root API alias: /api/auth/google
Route::post('/auth/google', [AuthController::class, 'googleAuth'])->middleware('throttle:30,1');

Route::prefix('v1')->group(function () {

    // ── 1. Auth & Public Catalog Routes ──────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/check-email', [AuthController::class, 'checkEmail']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/google', [AuthController::class, 'googleAuth'])->middleware('throttle:30,1');
        Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    // ── GHN Express Shipping Routes ───────────────────────────
    Route::prefix('shipping')->group(function () {
        Route::get('/provinces', [ShippingController::class, 'provinces']);
        Route::get('/districts', [ShippingController::class, 'districts']);
        Route::get('/wards', [ShippingController::class, 'wards']);
        Route::post('/calculate-fee', [ShippingController::class, 'calculateFee']);
        Route::post('/create-order', [ShippingController::class, 'createOrder']);
        Route::get('/tracking/{code}', [ShippingController::class, 'tracking']);
    });

    // ── Live Chat (Khách hàng & Khách vãng lai) ───────────────
    Route::get('/user/chat/messages', [ChatController::class, 'getCustomerMessages']);
    Route::post('/user/chat/send', [ChatController::class, 'sendCustomerMessage']);

    // ── Orders & Checkout API ─────────────────────────────────
    Route::get('/orders', [OrderApiController::class, 'index']);
    Route::post('/orders', [OrderApiController::class, 'create']);
    Route::get('/orders/{code}', [OrderApiController::class, 'show']);
    Route::post('/orders/{code}/cancel', [OrderApiController::class, 'cancelOrder']);

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

    // Webhooks & Payment Gateways (Cấp 2 - Realtime Bank & Hosted Gateway)
    Route::match(['get', 'post'], '/payments/momo/verify', [OrderApiController::class, 'momoVerify']);
    Route::post('/payments/webhook/momo', [OrderApiController::class, 'momoWebhook']);
    Route::post('/webhooks/payment/momo', [OrderApiController::class, 'momoWebhook']);
    Route::post('/webhooks/payment/vietqr', [PaymentWebhookController::class, 'vietqrWebhook']);

    // ── 2. Protected Routes (Customer Auth) ──────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // User Auth & Profile
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/user/profile', [ProfileController::class, 'show']);
        Route::put('/user/profile', [ProfileController::class, 'update']);
        Route::post('/user/email/send-otp', [ProfileController::class, 'sendEmailOtp']);
        Route::post('/user/email/verify-otp', [ProfileController::class, 'verifyEmailOtp']);
        Route::post('/user/change-password', [ProfileController::class, 'changePassword']);

        // Checkout Saga
        Route::post('/checkout', [CheckoutController::class, 'store']);
    });

    // ── 3. Admin & Staff Shared Routes (Read-only Catalog, POS Orders & Scan) ────
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin|super_admin|staff'])->group(function () {
        // Check-in QR Scan
        Route::post('/checkin/scan', [CheckInAdminController::class, 'scan']);

        // Staff & Admin View Catalog & Orders for POS
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/courts', [AdminCourtController::class, 'index']);
        Route::get('/courts/live-status', [AdminCourtController::class, 'liveStatus']);
        Route::post('/courts/{id}/start-session', [AdminCourtController::class, 'startSession']);
        Route::post('/courts/{id}/stop-session', [AdminCourtController::class, 'stopSession']);
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::post('/orders/{code}/cancel', [AdminOrderController::class, 'cancelOrder']);
        Route::get('/posts', [PostController::class, 'adminIndex']);

        // Live Chat Hỗ Trợ 2 Chiều
        Route::get('/chat/conversations', [ChatController::class, 'getAdminConversations']);
        Route::get('/chat/messages/{sessionId}', [ChatController::class, 'getAdminConversationMessages']);
        Route::post('/chat/send', [ChatController::class, 'sendAdminReply']);
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
