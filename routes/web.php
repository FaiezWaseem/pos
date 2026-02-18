<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SuperAdmin\CompanyController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\RestaurantController;
use App\Http\Controllers\SuperAdmin\RoleController;
use App\Http\Controllers\SuperAdmin\UserController;
use App\Http\Controllers\Inventory\CategoryController;
use App\Http\Controllers\Inventory\ProductController;
use App\Http\Controllers\Inventory\StockController;
use App\Http\Controllers\Staff\EmployeeController;
use App\Http\Controllers\Restaurant\AreaController;
use App\Http\Controllers\Restaurant\TableController;
use App\Http\Controllers\Restaurant\SwitchController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Pos\OrderController;
use App\Http\Controllers\Pos\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        if (auth()->user()->isSuperAdmin()) {
            return app(SuperAdminDashboardController::class)->index();
        }
        return app(DashboardController::class)->index();
    })->name('dashboard');

    // Super Admin Routes
    Route::middleware(['can:super-admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
        Route::resource('companies', CompanyController::class);
        Route::resource('restaurants', RestaurantController::class);
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
    });

    // Inventory Routes (Shared between Super Admin and Restaurant Admin)
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::resource('categories', CategoryController::class);
        Route::resource('products', ProductController::class);

        // Stock Management
        Route::get('stock', [StockController::class, 'index'])->name('stock.index');
        Route::post('stock/{product}/adjust', [StockController::class, 'adjust'])->name('stock.adjust');
        Route::get('stock/{product}/logs', [StockController::class, 'logs'])->name('stock.logs');
    });

    // Staff Management Routes
    Route::prefix('staff')->name('staff.')->group(function () {
        Route::resource('employees', EmployeeController::class);
    });

    // Restaurant Management (Areas & Tables)
    Route::prefix('restaurant')->name('restaurant.')->group(function () {
        Route::post('switch', SwitchController::class)->name('switch');
        Route::resource('areas', AreaController::class);
        Route::resource('tables', TableController::class);
    });

    // POS Routes
    Route::prefix('pos')->name('pos.')->group(function () {
        Route::get('/', [PosController::class, 'index'])->name('index');
        Route::post('/order', [PosController::class, 'store'])->name('store');
        Route::get('/receipt/{order}', [PosController::class, 'receipt'])->name('receipt');

        // Order History
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');

        // Reports
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    });
});

require __DIR__.'/settings.php';
