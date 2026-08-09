<?php

namespace App\Modules\Shared\Enums;

enum CourtStatus: string
{
    case ACTIVE = 'active';
    case MAINTENANCE = 'maintenance';
    case CLOSED = 'closed';
}
