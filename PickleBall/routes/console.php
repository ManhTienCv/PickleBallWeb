<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Tự động quét và hủy các đơn hàng MoMo treo quá hạn 15 phút, hoàn tồn kho định kỳ mỗi 5 phút
Schedule::command('orders:cancel-expired-momo')->everyFiveMinutes();
