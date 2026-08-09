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
        Schema::connection('booking')->create('courts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('code', 20)->unique();
            $table->text('description')->nullable();
            $table->string('location', 100)->nullable();
            $table->string('surface_type', 50)->default('concrete');
            $table->enum('status', ['active', 'maintenance', 'closed'])->default('active');
            $table->json('amenities')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->timestamps();
        });

        Schema::connection('booking')->create('court_pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('court_id')->constrained('courts')->cascadeOnDelete();
            $table->enum('day_type', ['weekday', 'weekend', 'holiday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('price', 15, 2);
            $table->string('label', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::connection('booking')->create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('court_id')->constrained('courts')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('price', 15, 2);
            $table->enum('status', ['available', 'held', 'booked', 'locked'])->default('available');
            $table->timestamps();

            $table->unique(['court_id', 'date', 'start_time'], 'idx_unique_court_date_time');
        });

        Schema::connection('booking')->create('holds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slot_id')->unique()->constrained('time_slots')->cascadeOnDelete();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('session_id', 100)->nullable()->index();
            $table->timestamp('expires_at');
            $table->enum('status', ['active', 'expired', 'converted'])->default('active');
            $table->timestamps();
        });

        Schema::connection('booking')->create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 30)->unique();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('unified_order_id')->nullable()->index();
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('qr_token', 64)->unique();
            $table->decimal('cancellation_fee', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::connection('booking')->create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('slot_id')->constrained('time_slots');
            $table->unsignedBigInteger('court_id'); // Denormalized for query speed
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('price', 15, 2);
            $table->timestamps();
        });

        Schema::connection('booking')->create('booking_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20);
            $table->string('changed_by', 50)->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        Schema::connection('booking')->create('checkin_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('booking_code', 30);
            $table->unsignedBigInteger('staff_id');
            $table->enum('checkin_type', ['court', 'equipment', 'beverage'])->default('court');
            $table->json('items_served')->nullable();
            $table->timestamp('checked_in_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('booking')->dropIfExists('checkin_logs');
        Schema::connection('booking')->dropIfExists('booking_status_history');
        Schema::connection('booking')->dropIfExists('booking_items');
        Schema::connection('booking')->dropIfExists('bookings');
        Schema::connection('booking')->dropIfExists('holds');
        Schema::connection('booking')->dropIfExists('time_slots');
        Schema::connection('booking')->dropIfExists('court_pricing_rules');
        Schema::connection('booking')->dropIfExists('courts');
    }
};
