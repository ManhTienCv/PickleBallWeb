<?php

use App\Providers\AppServiceProvider;

return [
    App\Providers\AppServiceProvider::class,
    Laravel\Sanctum\SanctumServiceProvider::class,
    Spatie\Permission\PermissionServiceProvider::class,
    App\Modules\User\UserServiceProvider::class,
    App\Modules\Shop\ShopServiceProvider::class,
    App\Modules\Booking\BookingServiceProvider::class,
    App\Modules\Order\OrderServiceProvider::class,
    App\Modules\Report\ReportServiceProvider::class,
];
