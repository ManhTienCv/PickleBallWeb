<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Modules\Shared\Enums\UserRole;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@demopick.vn'],
            [
                'name' => 'Quản Trị Viên DemoPick',
                'phone' => '0900000001',
                'password' => Hash::make('12345678'),
                'status' => 'active',
            ]
        );
        $admin->assignRole(UserRole::SUPER_ADMIN->value);
        $admin->assignRole(UserRole::ADMIN->value);

        // 2. Staff
        $staff = User::firstOrCreate(
            ['email' => 'staff@demopick.vn'],
            [
                'name' => 'Nhân Viên Sân 01',
                'phone' => '0900000002',
                'password' => Hash::make('12345678'),
                'status' => 'active',
            ]
        );
        $staff->assignRole(UserRole::STAFF->value);

        // 3. Demo Customer
        $customer = User::firstOrCreate(
            ['email' => 'customer@demopick.vn'],
            [
                'name' => 'Nguyễn Văn Phục',
                'phone' => '0909123456',
                'password' => Hash::make('12345678'),
                'status' => 'active',
            ]
        );
        $customer->assignRole(UserRole::CUSTOMER->value);
    }
}
