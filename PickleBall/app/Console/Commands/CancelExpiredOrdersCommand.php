<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CancelExpiredOrdersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-expired-momo';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động hủy các đơn hàng MoMo quá hạn 15 phút chưa thanh toán và hoàn trả số lượng tồn kho.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $cutoffTime = now()->subMinutes(15);
        $cancelledCount = 0;

        $this->info("Bắt đầu quét đơn hàng MoMo hết hạn trước mốc: {$cutoffTime->toIso8601String()}");

        // 1. Quét đơn trong Cache demopick_orders_store
        $orders = Cache::get('demopick_orders_store', []);
        $cacheModified = false;

        foreach ($orders as $code => &$order) {
            $isMomo = strtolower($order['payment_method'] ?? '') === 'momo';
            $isUnpaid = strtolower($order['payment_status'] ?? '') === 'unpaid';
            $isPending = strtolower($order['status'] ?? '') === 'pending';

            if (!$isMomo || !$isUnpaid || !$isPending) {
                continue;
            }

            $createdAt = isset($order['created_at']) ? \Carbon\Carbon::parse($order['created_at']) : null;
            if ($createdAt && $createdAt->lte($cutoffTime)) {
                $order['status'] = 'cancelled';
                $order['cancel_reason'] = 'Hết hạn thời gian thanh toán MoMo (15 phút - Hệ thống tự động hủy).';
                $order['cancelled_at'] = now()->toIso8601String();

                // Hoàn trả số lượng tồn kho (Restock)
                $items = $order['items'] ?? [];
                $this->restockItems($items, $code);

                $cacheModified = true;
                $cancelledCount++;

                $this->line("-> Đã hủy đơn MoMo hết hạn #{$code} (Tạo lúc: {$createdAt->toDateTimeString()})");
            }
        }
        unset($order);

        if ($cacheModified) {
            Cache::put('demopick_orders_store', $orders, 86400 * 30);
        }

        // 2. Quét đơn trong Database orders
        try {
            $expiredDbOrders = DB::connection('main')->table('orders')
                ->where('payment_status', 'unpaid')
                ->where('status', 'pending')
                ->where('created_at', '<=', $cutoffTime)
                ->get();

            foreach ($expiredDbOrders as $dbOrder) {
                $notes = json_decode($dbOrder->pickup_notes ?? '{}', true);
                $method = strtolower($notes['paymentMethod'] ?? '');

                if ($method === 'momo') {
                    DB::connection('main')->table('orders')->where('id', $dbOrder->id)->update([
                        'status' => 'cancelled',
                        'updated_at' => now(),
                    ]);

                    DB::connection('main')->table('payments')->where('order_id', $dbOrder->id)->update([
                        'status' => 'expired',
                        'updated_at' => now(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('CancelExpiredOrdersCommand DB scan note: ' . $e->getMessage());
        }

        $this->info("Hoàn tất! Đã tự động hủy {$cancelledCount} đơn hàng MoMo treo và hoàn trả tồn kho an toàn.");
        Log::info("Command orders:cancel-expired-momo hoàn tất: {$cancelledCount} đơn bị hủy.");

        return Command::SUCCESS;
    }

    /**
     * Hoàn tồn kho sản phẩm khi hủy đơn tự động
     */
    protected function restockItems(array $items, string $orderCode): void
    {
        try {
            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? $item['qty'] ?? 0);
                if ($qty <= 0) continue;

                $productId = $item['product_id'] ?? null;
                $itemName = $item['item_name'] ?? $item['name'] ?? null;

                if ($productId) {
                    try {
                        DB::connection('shop')->table('products')->where('id', $productId)->increment('base_stock', $qty);
                    } catch (\Throwable $e) {
                        DB::connection('main')->table('products')->where('id', $productId)->increment('stock_quantity', $qty);
                    }
                } elseif ($itemName) {
                    DB::connection('main')->table('products')->where('name', $itemName)->increment('stock_quantity', $qty);
                }
            }
        } catch (\Throwable $e) {
            Log::warning("Restock failed for expired order #{$orderCode}: " . $e->getMessage());
        }
    }
}
