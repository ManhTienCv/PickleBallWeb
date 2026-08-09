<?php

namespace App\Modules\Booking\Console\Commands;

use App\Modules\Booking\Services\SlotGenerationService;
use Illuminate\Console\Command;

class GenerateSlotsCommand extends Command
{
    protected $signature = 'slots:generate {--days=7 : Số ngày cần sinh slot (mặc định 7)}';
    protected $description = 'Tự động sinh time slots (khung giờ 1h) cho tất cả các sân Pickleball active.';

    public function handle(SlotGenerationService $service): int
    {
        $days = (int) $this->option('days');
        $this->info("Đang sinh time slots cho {$days} ngày tới...");

        $count = $service->generateForDays($days);

        $this->info("Hoàn tất! Đã sinh {$count} time slots mới.");

        return Command::SUCCESS;
    }
}
