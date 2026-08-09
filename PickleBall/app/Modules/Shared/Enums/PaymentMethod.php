<?php

namespace App\Modules\Shared\Enums;

enum PaymentMethod: string
{
    case MOMO = 'momo';
    case BANK_TRANSFER = 'bank_transfer';
    case CASH = 'cash';
}
