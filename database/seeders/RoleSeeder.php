<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // System Level Role
        Role::updateOrCreate(
            ['name' => 'super_admin'],
            [
                'label' => 'Super Admin',
                'is_system' => true,
                'permissions' => ['*'], // Full access
            ]
        );

        // Company/Restaurant Level Roles (Templates)
        Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'label' => 'Restaurant Admin',
                'is_system' => true,
                'permissions' => [
                    'manage_users',
                    'manage_menu',
                    'manage_tables',
                    'view_reports',
                    'manage_settings'
                ],
            ]
        );

        Role::updateOrCreate(
            ['name' => 'manager'],
            [
                'label' => 'Manager',
                'is_system' => true,
                'permissions' => [
                    'manage_menu',
                    'manage_tables',
                    'manage_orders',
                    'view_reports',
                ],
            ]
        );

        Role::updateOrCreate(
            ['name' => 'waiter'],
            [
                'label' => 'Waiter',
                'is_system' => true,
                'permissions' => [
                    'create_orders',
                    'manage_tables',
                ],
            ]
        );

        Role::updateOrCreate(
            ['name' => 'chef'],
            [
                'label' => 'Chef',
                'is_system' => true,
                'permissions' => [
                    'view_orders',
                    'update_order_status',
                ],
            ]
        );
    }
}
