<?php

namespace App\Modules\Order\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\BookingItem;
use App\Modules\Booking\Models\Hold;
use App\Modules\Booking\Models\TimeSlot;
use App\Modules\Booking\Services\HoldService;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\OrderSagaLog;
use App\Modules\Order\Models\Payment;
use App\Modules\Shared\Exceptions\ApiException;
use App\Modules\Shared\Exceptions\HoldExpiredException;
use App\Modules\Shared\Exceptions\InsufficientStockException;
use App\Modules\Shop\Models\Cart;
use App\Modules\Shop\Models\InventoryTransaction;
use App\Modules\Shop\Models\ProductVariant;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutOrchestrator
{
    public function __construct(
        protected HoldService $holdService,
        protected PaymentService $paymentService
    ) {}

    public function processCheckout(int $userId, int $cartId, string $paymentGateway, ?string $pickupNotes = null): array
    {
        $cart = Cart::with('items.variant.product')->findOrFail($cartId);

        if ($cart->items->isEmpty()) {
            throw new ApiException('Giỏ hàng của bạn đang trống.', 400);
        }

        $orderCode = 'ORD-'.date('Ymd').'-'.strtoupper(Str::random(6));

        // Saga step tracking variables
        $reservedVariants = [];
        $convertedBookings = [];
        $createdOrder = null;

        try {
            // ── STEP 1: Verify & Lock Holds and Stock ──────────
            $this->logSagaStep(0, 1, 'verify_items', 'pending', ['cart_id' => $cartId]);

            $subtotal = 0;
            $hasProduct = false;
            $hasBooking = false;

            foreach ($cart->items as $item) {
                if ($item->item_type === 'product') {
                    $hasProduct = true;
                    $variant = ProductVariant::with('product')->findOrFail($item->variant_id);
                    if ($variant->available_stock < $item->quantity) {
                        throw new InsufficientStockException("Sản phẩm {$variant->product->name} (SKU: {$variant->sku}) không đủ tồn kho.");
                    }
                    $subtotal += $variant->effective_price * $item->quantity;
                } elseif ($item->item_type === 'booking_slot') {
                    $hasBooking = true;
                    $hold = Hold::with('slot.court')->where('slot_id', $item->slot_id)->first();
                    if (! $hold || $hold->status !== 'active' || $hold->isExpired()) {
                        throw new HoldExpiredException('Vẫn còn khung giờ giữ chỗ đã hết hạn. Vui lòng chọn lại.');
                    }
                    $subtotal += $hold->slot->price;
                }
            }

            $orderType = ($hasProduct && $hasBooking) ? 'mixed' : ($hasBooking ? 'booking' : 'shop');

            $this->logSagaStep(0, 1, 'verify_items', 'success');

            // ── STEP 2: Reserve Inventory (Shop DB) ────────────
            $this->logSagaStep(0, 2, 'reserve_stock', 'pending');

            DB::connection('shop')->transaction(function () use ($cart, &$reservedVariants) {
                foreach ($cart->items->where('item_type', 'product') as $item) {
                    /** @var ProductVariant $variant */
                    $variant = ProductVariant::where('id', $item->variant_id)->lockForUpdate()->first();
                    $variant->increment('reserved_qty', $item->quantity);
                    $variant->decrement('stock_qty', $item->quantity);

                    InventoryTransaction::create([
                        'variant_id' => $variant->id,
                        'type' => 'reserve',
                        'quantity' => -$item->quantity,
                        'stock_after' => $variant->stock_qty,
                        'reference_type' => 'order_pending',
                        'notes' => 'Tạm giữ kho cho đơn hàng',
                    ]);

                    $reservedVariants[] = [
                        'variant_id' => $variant->id,
                        'quantity' => $item->quantity,
                    ];
                }
            });

            $this->logSagaStep(0, 2, 'reserve_stock', 'success');

            // ── STEP 3: Create Order Record (Main DB) ──────────
            $this->logSagaStep(0, 3, 'create_order', 'pending');

            $createdOrder = DB::connection('main')->transaction(function () use ($userId, $orderCode, $orderType, $subtotal, $pickupNotes, $cart) {
                $order = Order::create([
                    'order_code' => $orderCode,
                    'user_id' => $userId,
                    'order_type' => $orderType,
                    'subtotal' => $subtotal,
                    'discount' => 0,
                    'total_amount' => $subtotal,
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'pickup_notes' => $pickupNotes,
                ]);

                foreach ($cart->items as $item) {
                    if ($item->item_type === 'product') {
                        $variant = ProductVariant::with('product')->find($item->variant_id);
                        OrderItem::create([
                            'order_id' => $order->id,
                            'item_type' => 'product',
                            'reference_id' => $variant->id,
                            'item_name' => $variant->product->name,
                            'item_sku' => $variant->sku,
                            'quantity' => $item->quantity,
                            'unit_price' => $variant->effective_price,
                            'total_price' => $variant->effective_price * $item->quantity,
                            'metadata' => [
                                'color' => $variant->color,
                                'weight' => $variant->weight,
                            ],
                        ]);
                    } elseif ($item->item_type === 'booking_slot') {
                        $slot = TimeSlot::with('court')->find($item->slot_id);
                        OrderItem::create([
                            'order_id' => $order->id,
                            'item_type' => 'booking_slot',
                            'reference_id' => $slot->id,
                            'item_name' => "Đặt sân {$slot->court->name} ({$slot->date->format('d/m/Y')} {$slot->start_time}-{$slot->end_time})",
                            'item_sku' => $slot->court->code,
                            'quantity' => 1,
                            'unit_price' => $slot->price,
                            'total_price' => $slot->price,
                            'metadata' => [
                                'court_name' => $slot->court->name,
                                'date' => $slot->date->format('Y-m-d'),
                                'start_time' => $slot->start_time,
                                'end_time' => $slot->end_time,
                            ],
                        ]);
                    }
                }

                return $order;
            });

            $this->logSagaStep($createdOrder->id, 3, 'create_order', 'success');

            // ── STEP 4: Convert Holds to Bookings (Booking DB) ─
            $this->logSagaStep($createdOrder->id, 4, 'convert_bookings', 'pending');

            if ($hasBooking) {
                DB::connection('booking')->transaction(function () use ($cart, $userId, $createdOrder, &$convertedBookings) {
                    $bookingCode = 'BK-'.date('Ymd').'-'.strtoupper(Str::random(5));
                    $qrToken = Str::uuid()->toString();

                    $bookingItemsData = [];
                    $totalBookingAmount = 0;

                    foreach ($cart->items->where('item_type', 'booking_slot') as $item) {
                        $slot = TimeSlot::with('court')->find($item->slot_id);
                        $totalBookingAmount += $slot->price;

                        $bookingItemsData[] = [
                            'slot_id' => $slot->id,
                            'court_id' => $slot->court_id,
                            'date' => $slot->date->format('Y-m-d'),
                            'start_time' => $slot->start_time,
                            'end_time' => $slot->end_time,
                            'price' => $slot->price,
                        ];

                        // Mark slot as booked & hold converted
                        $slot->update(['status' => 'booked']);
                        Hold::where('slot_id', $slot->id)->update(['status' => 'converted']);
                    }

                    $booking = Booking::create([
                        'booking_code' => $bookingCode,
                        'user_id' => $userId,
                        'unified_order_id' => $createdOrder->id,
                        'total_amount' => $totalBookingAmount,
                        'status' => 'pending',
                        'qr_token' => $qrToken,
                    ]);

                    foreach ($bookingItemsData as $bItem) {
                        BookingItem::create(array_merge($bItem, ['booking_id' => $booking->id]));
                    }

                    $convertedBookings[] = $booking->id;
                });
            }

            $this->logSagaStep($createdOrder->id, 4, 'convert_bookings', 'success');

            // ── STEP 5: Clear Cart & Initiate Payment Gateway ──
            $this->logSagaStep($createdOrder->id, 5, 'initiate_payment', 'pending');

            $paymentData = $this->paymentService->createPaymentPayload($createdOrder, $paymentGateway);

            Payment::create([
                'order_id' => $createdOrder->id,
                'gateway' => $paymentGateway,
                'amount' => $createdOrder->total_amount,
                'status' => 'pending',
                'gateway_response' => $paymentData,
            ]);

            // Clear Cart
            $cart->items()->delete();

            $this->logSagaStep($createdOrder->id, 5, 'initiate_payment', 'success');

            return [
                'order_code' => $createdOrder->order_code,
                'total_amount' => (float) $createdOrder->total_amount,
                'payment_gateway' => $paymentGateway,
                'payment_url' => $paymentData['payment_url'] ?? null,
                'qr_code_url' => $paymentData['qr_code_url'] ?? null,
                'bank_info' => $paymentData['bank_info'] ?? null,
            ];

        } catch (Exception $e) {
            // ── SAGA COMPENSATION LOGIC ────────────────────────
            $orderId = $createdOrder ? $createdOrder->id : 0;
            $this->logSagaStep($orderId, 99, 'compensation', 'pending', ['error' => $e->getMessage()]);

            // Compensate Step 2: Release reserved stock
            if (! empty($reservedVariants)) {
                DB::connection('shop')->transaction(function () use ($reservedVariants) {
                    foreach ($reservedVariants as $res) {
                        $variant = ProductVariant::find($res['variant_id']);
                        if ($variant) {
                            $variant->decrement('reserved_qty', $res['quantity']);
                            $variant->increment('stock_qty', $res['quantity']);
                        }
                    }
                });
            }

            // Compensate Step 4: Cancel bookings & reset slots
            if (! empty($convertedBookings)) {
                DB::connection('booking')->transaction(function () use ($convertedBookings) {
                    foreach ($convertedBookings as $bookingId) {
                        $booking = Booking::with('items')->find($bookingId);
                        if ($booking) {
                            $booking->update(['status' => 'cancelled']);
                            foreach ($booking->items as $item) {
                                TimeSlot::where('id', $item->slot_id)->update(['status' => 'available']);
                            }
                        }
                    }
                });
            }

            // Compensate Step 3: Cancel order record
            if ($createdOrder) {
                $createdOrder->update(['status' => 'cancelled']);
            }

            $this->logSagaStep($orderId, 99, 'compensation', 'compensated');

            throw $e;
        }
    }

    protected function logSagaStep(int $orderId, int $stepNumber, string $stepName, string $status, ?array $requestPayload = null): void
    {
        if ($orderId <= 0) {
            return;
        }

        OrderSagaLog::create([
            'order_id' => $orderId,
            'step_number' => $stepNumber,
            'step_name' => $stepName,
            'status' => $status,
            'request_payload' => $requestPayload,
            'started_at' => now(),
            'completed_at' => ($status === 'success' || $status === 'compensated') ? now() : null,
        ]);
    }
}
