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
        // 1. Connection: shop
        if (Schema::connection('shop')->hasTable('products')) {
            Schema::connection('shop')->table('products', function (Blueprint $table) {
                if (!Schema::connection('shop')->hasColumn('products', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        if (Schema::connection('shop')->hasTable('product_variants')) {
            Schema::connection('shop')->table('product_variants', function (Blueprint $table) {
                if (!Schema::connection('shop')->hasColumn('product_variants', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        if (Schema::connection('shop')->hasTable('categories')) {
            Schema::connection('shop')->table('categories', function (Blueprint $table) {
                if (!Schema::connection('shop')->hasColumn('categories', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        if (Schema::connection('shop')->hasTable('brands')) {
            Schema::connection('shop')->table('brands', function (Blueprint $table) {
                if (!Schema::connection('shop')->hasColumn('brands', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        // 2. Connection: booking
        if (Schema::connection('booking')->hasTable('courts')) {
            Schema::connection('booking')->table('courts', function (Blueprint $table) {
                if (!Schema::connection('booking')->hasColumn('courts', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        // 3. Connection: main
        if (Schema::connection('main')->hasTable('orders')) {
            Schema::connection('main')->table('orders', function (Blueprint $table) {
                if (!Schema::connection('main')->hasColumn('orders', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::connection('shop')->hasTable('products')) {
            Schema::connection('shop')->table('products', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::connection('shop')->hasTable('product_variants')) {
            Schema::connection('shop')->table('product_variants', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::connection('shop')->hasTable('categories')) {
            Schema::connection('shop')->table('categories', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::connection('shop')->hasTable('brands')) {
            Schema::connection('shop')->table('brands', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::connection('booking')->hasTable('courts')) {
            Schema::connection('booking')->table('courts', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::connection('main')->hasTable('orders')) {
            Schema::connection('main')->table('orders', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
