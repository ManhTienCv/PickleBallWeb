<?php

namespace App\Modules\Shared\Enums;

enum SlotStatus: string
{
    case AVAILABLE = 'available';
    case HELD = 'held';
    case BOOKED = 'booked';
    case LOCKED = 'locked';
}
