<?php

namespace App\Modules\Booking;

use Illuminate\Support\ServiceProvider;

class BookingServiceProvider extends ServiceProvider
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
