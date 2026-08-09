<?php

namespace App\Modules\Shared\Enums;

enum UserRole: string
{
    case CUSTOMER = 'customer';
    case STAFF = 'staff';
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super_admin';
}
