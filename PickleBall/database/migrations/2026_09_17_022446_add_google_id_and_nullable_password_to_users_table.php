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
        Schema::connection('main')->table('users', function (Blueprint $table) {
            if (!Schema::connection('main')->hasColumn('users', 'google_id')) {
                $table->string('google_id', 100)->nullable()->unique()->after('email');
            }
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('main')->table('users', function (Blueprint $table) {
            if (Schema::connection('main')->hasColumn('users', 'google_id')) {
                $table->dropColumn('google_id');
            }
            $table->string('password')->nullable(false)->change();
        });
    }
};
