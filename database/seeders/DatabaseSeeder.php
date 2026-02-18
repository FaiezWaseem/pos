<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\Category;
use App\Models\Product;
use App\Models\Area;
use App\Models\Table;
use App\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
        ]);

        // Create a sample company
        $company = \App\Models\Company::create([
            'name' => 'Pizza Corp',
            'email' => 'corp@pizza.com',
            'phone' => '987654321',
            'address' => 'Corporate Blvd',
            'is_active' => true,
        ]);

        // Create a sample restaurant
        $restaurant = Restaurant::create([
            'company_id' => $company->id,
            'name' => 'Delicious Pizza',
            'email' => 'contact@deliciouspizza.com',
            'phone' => '123456789',
            'address' => '123 Pizza St',
            'is_active' => true,
        ]);

        // Assign the super admin to this restaurant (optional, usually super admin is not assigned)
        // But for testing POS, we need a user with a restaurant_id
        $adminRole = Role::where('name', 'admin')->first();
        $restaurantAdmin = User::create([
            'name' => 'Restaurant Admin',
            'email' => 'admin@pizza.com',
            'password' => bcrypt('12345678'),
            'role_id' => $adminRole->id,
            'restaurant_id' => $restaurant->id,
            'is_active' => true,
        ]);

        // Create Areas
        $groundFloor = Area::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Ground Floor',
            'description' => 'Main dining area',
        ]);

        // Create Tables
        for ($i = 1; $i <= 5; $i++) {
            Table::create([
                'restaurant_id' => $restaurant->id,
                'area_id' => $groundFloor->id,
                'table_number' => "T-{$i}",
                'capacity' => 4,
                'status' => 'available',
            ]);
        }

        // Create Categories
        $pizzaCat = Category::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Pizzas',
            'description' => 'Authentic Italian Pizzas',
            'is_active' => true,
        ]);

        $drinkCat = Category::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Drinks',
            'description' => 'Refreshing Beverages',
            'is_active' => true,
        ]);

        // Create Products
        Product::create([
            'restaurant_id' => $restaurant->id,
            'category_id' => $pizzaCat->id,
            'name' => 'Margherita',
            'description' => 'Tomato, mozzarella, and basil',
            'price' => 12.99,
            'is_available' => true,
        ]);

        Product::create([
            'restaurant_id' => $restaurant->id,
            'category_id' => $pizzaCat->id,
            'name' => 'Pepperoni',
            'description' => 'Tomato, mozzarella, and pepperoni',
            'price' => 14.99,
            'is_available' => true,
        ]);

        Product::create([
            'restaurant_id' => $restaurant->id,
            'category_id' => $drinkCat->id,
            'name' => 'Coke',
            'description' => '500ml bottle',
            'price' => 2.50,
            'is_available' => true,
        ]);
    }
}
