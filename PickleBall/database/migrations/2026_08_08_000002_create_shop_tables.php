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
        Schema::connection('shop')->create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::connection('shop')->create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->string('logo_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::connection('shop')->create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('slug', 220)->unique();
            $table->text('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->decimal('base_price', 15, 2);
            $table->enum('status', ['active', 'draft', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->json('images')->nullable();
            $table->json('specifications')->nullable();
            $table->timestamps();
        });

        Schema::connection('shop')->create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('sku', 50)->unique();
            $table->string('color', 50)->nullable();
            $table->string('weight', 30)->nullable();
            $table->string('grip_size', 20)->nullable();
            $table->decimal('price_override', 15, 2)->nullable();
            $table->integer('stock_qty')->unsigned()->default(0);
            $table->integer('reserved_qty')->unsigned()->default(0);
            $table->integer('low_stock_threshold')->unsigned()->default(5);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::connection('shop')->create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->enum('type', ['in', 'out', 'adjust', 'reserve', 'release']);
            $table->integer('quantity'); // Positive for in/release, negative for out/reserve
            $table->integer('stock_after')->unsigned();
            $table->string('reference_type', 30)->nullable(); // order, manual
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::connection('shop')->create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('session_id', 100)->nullable()->index();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::connection('shop')->create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained('carts')->cascadeOnDelete();
            $table->enum('item_type', ['product', 'booking_slot']);
            $table->unsignedBigInteger('variant_id')->nullable(); // For product
            $table->unsignedBigInteger('slot_id')->nullable(); // Reference to booking.time_slots
            $table->integer('quantity')->unsigned()->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->json('metadata')->nullable(); // snapshot details
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('shop')->dropIfExists('cart_items');
        Schema::connection('shop')->dropIfExists('carts');
        Schema::connection('shop')->dropIfExists('inventory_transactions');
        Schema::connection('shop')->dropIfExists('product_variants');
        Schema::connection('shop')->dropIfExists('products');
        Schema::connection('shop')->dropIfExists('brands');
        Schema::connection('shop')->dropIfExists('categories');
    }
};
