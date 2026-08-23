<?php

use App\Modules\Booking\BookingServiceProvider;
use App\Modules\Order\OrderServiceProvider;
use App\Modules\Report\ReportServiceProvider;
use App\Modules\Shop\ShopServiceProvider;
use App\Modules\User\UserServiceProvider;
use App\Providers\AppServiceProvider;
use Laravel\Sanctum\SanctumServiceProvider;
use Spatie\Permission\PermissionServiceProvider;

return [
    AppServiceProvider::class,
    SanctumServiceProvider::class,
    PermissionServiceProvider::class,
    UserServiceProvider::class,
    ShopServiceProvider::class,
    BookingServiceProvider::class,
    OrderServiceProvider::class,
    ReportServiceProvider::class,
];
