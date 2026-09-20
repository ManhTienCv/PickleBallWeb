<?php

namespace App\Modules\User\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    use HasStandardResponse;

    public function index(Request $request): JsonResponse
    {
        $users = User::with('roles')->latest()->get();

        $formatted = $users->map(function ($u) {
            $roles = $u->roles->pluck('name')->toArray();
            $primaryRole = 'customer';
            if (in_array('super_admin', $roles) || in_array('admin', $roles)) {
                $primaryRole = 'admin';
            } elseif (in_array('staff', $roles)) {
                $primaryRole = 'staff';
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone ?? '0901 234 567',
                'role' => $primaryRole,
                'status' => 'active',
                'createdAt' => $u->created_at ? $u->created_at->format('d/m/Y H:i') : date('d/m/Y H:i'),
                'ordersCount' => 0,
                'totalSpent' => 0,
                'courtBookingsCount' => 0,
                'avatarColor' => $primaryRole === 'admin' ? 'from-rose-500 to-pink-600' : ($primaryRole === 'staff' ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'),
                'recentOrders' => [],
            ];
        });

        return $this->success($formatted, 'Danh sách thành viên quản trị.');
    }
}
