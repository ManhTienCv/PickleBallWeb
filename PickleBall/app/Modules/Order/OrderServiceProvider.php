<?php

namespace App\Modules\Order;

use Illuminate\Support\ServiceProvider;

class OrderServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/database/migrations');
    }
}
