<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('main')->create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64)->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('sender_name', 100)->default('Khách hàng');
            $table->enum('sender_type', ['user', 'admin'])->default('user');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::connection('main')->dropIfExists('messages');
    }
};
