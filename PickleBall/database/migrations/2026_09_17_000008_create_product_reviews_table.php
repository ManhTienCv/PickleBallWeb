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
        Schema::connection('shop')->create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('order_id')->nullable()->index();
            $table->string('user_name', 100)->nullable();
            $table->string('user_avatar', 500)->nullable();
            $table->tinyInteger('rating')->unsigned(); // 1 to 5
            $table->text('comment');
            $table->json('images')->nullable();
            $table->string('variant_purchased', 150)->nullable();
            $table->boolean('is_verified_purchase')->default(true);
            $table->integer('likes')->unsigned()->default(0);
            $table->enum('status', ['approved', 'pending', 'hidden'])->default('approved');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('shop')->dropIfExists('product_reviews');
    }
};
