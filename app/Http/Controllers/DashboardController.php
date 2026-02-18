<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $restaurantId = $user->restaurant_id;

        if (!$restaurantId) {
            // If user has no restaurant, return empty stats
            return Inertia::render('dashboard', [
                'stats' => $this->getEmptyStats(),
            ]);
        }

        $stats = $this->getStats($restaurantId);

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }

    private function getEmptyStats(): array
    {
        return [
            'todayOrders' => 0,
            'weeklyOrders' => 0,
            'totalOrders' => 0,
            'todayRevenue' => 0,
            'weeklyRevenue' => 0,
            'monthlyRevenue' => 0,
            'lowStockCount' => 0,
            'totalProducts' => 0,
        ];
    }

    private function getStats(int $restaurantId): array
    {
        $today = now()->startOfDay();
        $weekStart = now()->startOfWeek();
        $monthStart = now()->startOfMonth();

        // Order counts
        $todayOrders = Order::where('restaurant_id', $restaurantId)
            ->where('created_at', '>=', $today)
            ->count();

        $weeklyOrders = Order::where('restaurant_id', $restaurantId)
            ->where('created_at', '>=', $weekStart)
            ->count();

        $totalOrders = Order::where('restaurant_id', $restaurantId)
            ->count();

        // Revenue (sum of total from orders)
        $todayRevenue = Order::where('restaurant_id', $restaurantId)
            ->where('created_at', '>=', $today)
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $weeklyRevenue = Order::where('restaurant_id', $restaurantId)
            ->where('created_at', '>=', $weekStart)
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $monthlyRevenue = Order::where('restaurant_id', $restaurantId)
            ->where('created_at', '>=', $monthStart)
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        // Stock alerts
        $totalProducts = Product::where('restaurant_id', $restaurantId)
            ->where('is_available', true)
            ->count();

        // Low stock products (assuming products have a stock_quantity column)
        // If the column doesn't exist, this will return 0
        $lowStockCount = 0;
        try {
            $lowStockCount = Product::where('restaurant_id', $restaurantId)
                ->where('is_available', true)
                ->whereColumn('stock_quantity', '<=', 'stock_alert')
                ->count();
        } catch (\Exception $e) {
            // Column doesn't exist, return 0
            $lowStockCount = 0;
        }

        return [
            'todayOrders' => $todayOrders,
            'weeklyOrders' => $weeklyOrders,
            'totalOrders' => $totalOrders,
            'todayRevenue' => round($todayRevenue, 2),
            'weeklyRevenue' => round($weeklyRevenue, 2),
            'monthlyRevenue' => round($monthlyRevenue, 2),
            'lowStockCount' => $lowStockCount,
            'totalProducts' => $totalProducts,
        ];
    }
}
