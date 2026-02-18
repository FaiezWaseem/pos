<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminRole = Role::where('name', 'super_admin')->first();

        if ($superAdminRole) {
            // Check if user exists to decide whether to update password
            // updateOrCreate will trigger the 'hashed' cast on the password attribute
            // So we must pass the PLAIN TEXT password, not Hash::make()
            
            User::updateOrCreate(
                ['email' => 'admin@pos.com'],
                [
                    'name' => 'Super Admin',
                    'password' => Hash::make('password12345678'),
                    'role_id' => $superAdminRole->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
