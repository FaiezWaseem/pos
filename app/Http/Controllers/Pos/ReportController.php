<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = session('active_restaurant_id');
        $period = $request->input('period', '7days');

        [$startDate, $endDate, $groupFormat, $labelFormat] = $this->resolvePeriod($period, $request);

        // ── Revenue over time ──────────────────────────────────────────────
        $revenueByDay = Order::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$groupFormat}') as label"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        // ── Summary stats ──────────────────────────────────────────────────
        $summary = Order::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total) as total_revenue'),
                DB::raw('AVG(total) as avg_order_value')
            )
            ->first();

        // ── Revenue by payment method ──────────────────────────────────────
        $byPaymentMethod = DB::table('payments')
            ->join('orders', 'orders.id', '=', 'payments.order_id')
            ->where('orders.restaurant_id', $restaurantId)
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select('payments.payment_method', DB::raw('SUM(orders.total) as revenue'), DB::raw('COUNT(*) as count'))
            ->groupBy('payments.payment_method')
            ->get();

        // ── Revenue by order type ──────────────────────────────────────────
        $byOrderType = Order::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('order_type', DB::raw('SUM(total) as revenue'), DB::raw('COUNT(*) as count'))
            ->groupBy('order_type')
            ->get();

        // ── Top selling products ───────────────────────────────────────────
        $topProducts = OrderItem::join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.restaurant_id', $restaurantId)
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.total) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        // ── Hourly distribution (orders by hour of day) ────────────────────
        $byHour = Order::where('restaurant_id', $restaurantId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return Inertia::render('pos/reports/index', [
            'revenueByDay'    => $revenueByDay,
            'summary'         => $summary,
            'byPaymentMethod' => $byPaymentMethod,
            'byOrderType'     => $byOrderType,
            'topProducts'     => $topProducts,
            'byHour'          => $byHour,
            'filters'         => $request->only(['period', 'date_from', 'date_to']),
        ]);
    }

    private function resolvePeriod(string $period, Request $request): array
    {
        $now = now();

        return match ($period) {
            'today'   => [$now->copy()->startOfDay(),  $now->copy()->endOfDay(),  '%H:00', 'H:i'],
            '7days'   => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay(), '%Y-%m-%d', 'M d'],
            '30days'  => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay(), '%Y-%m-%d', 'M d'],
            'month'   => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth(), '%Y-%m-%d', 'M d'],
            'year'    => [$now->copy()->startOfYear(), $now->copy()->endOfYear(), '%Y-%m', 'M Y'],
            'custom'  => [
                $request->input('date_from', $now->copy()->subDays(6)->toDateString()),
                $request->input('date_to', $now->toDateString()),
                '%Y-%m-%d',
                'M d',
            ],
            default   => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay(), '%Y-%m-%d', 'M d'],
        };
    }
}
