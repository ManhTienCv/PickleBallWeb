<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('booking')->create('court_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('court_id')->constrained('courts')->cascadeOnDelete();
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('expected_duration_minutes')->nullable();
            $table->decimal('hourly_rate', 15, 2)->default(140000);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->enum('status', ['in_progress', 'completed', 'cancelled'])->default('in_progress');
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('booking')->dropIfExists('court_sessions');
    }
};
