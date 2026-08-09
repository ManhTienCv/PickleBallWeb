<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('main')->create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 30)->unique();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('idempotency_key', 64)->nullable()->unique();
            $table->enum('order_type', ['shop', 'booking', 'mixed'])->default('shop');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->text('pickup_notes')->nullable();
            $table->timestamps();
        });

        Schema::connection('main')->create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->enum('item_type', ['product', 'booking_slot']);
            $table->unsignedBigInteger('reference_id'); // variant_id or booking_item_id
            $table->string('item_name', 200);
            $table->string('item_sku', 50)->nullable();
            $table->integer('quantity')->unsigned();
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::connection('main')->create('order_saga_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->tinyInteger('step_number');
            $table->string('step_name', 50);
            $table->enum('status', ['pending', 'success', 'failed', 'compensated']);
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
        });

        Schema::connection('main')->create('order_outbox_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('event_type', 50);
            $table->json('payload');
            $table->enum('status', ['pending', 'published', 'failed'])->default('pending');
            $table->tinyInteger('retry_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::connection('main')->create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('transaction_id', 100)->nullable()->unique();
            $table->enum('gateway', ['momo', 'bank_transfer', 'cash']);
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'success', 'failed', 'refunded'])->default('pending');
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('main')->dropIfExists('payments');
        Schema::connection('main')->dropIfExists('order_outbox_events');
        Schema::connection('main')->dropIfExists('order_saga_logs');
        Schema::connection('main')->dropIfExists('order_items');
        Schema::connection('main')->dropIfExists('orders');
    }
};
