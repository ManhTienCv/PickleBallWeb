<?php

namespace Database\Seeders;

use App\Modules\Shared\Enums\UserRole;
use App\Modules\User\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        if (class_exists(PermissionRegistrar::class)) {
            app()[PermissionRegistrar::class]->forgetCachedPermissions();
        }

        $roles = [
            UserRole::CUSTOMER->value,
            UserRole::STAFF->value,
            UserRole::ADMIN->value,
            UserRole::SUPER_ADMIN->value,
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }
    }
}
