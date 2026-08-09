<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\User\Models\Role;
use App\Modules\Shared\Enums\UserRole;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        if (class_exists(\Spatie\Permission\PermissionRegistrar::class)) {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
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
