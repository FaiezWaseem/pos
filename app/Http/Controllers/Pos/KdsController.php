<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KdsController extends Controller
{
    public function index()
    {
        $restaurantId = session('active_restaurant_id');

        $orders = Order::with([
            'items.product',
            'items.size',
            // 'items.addons' is a JSON column, not a relationship
            'table',
            'customer',
        ])
            ->where('restaurant_id', $restaurantId)
            ->whereIn('kitchen_status', ['pending', 'preparing', 'ready'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('kds/index', [
            'orders' => $orders
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed',
        ]);

        $order->kitchen_status = $request->status;

        if ($request->status === 'completed') {
            $order->completed_at = now();
        }

        $order->save();

        return back();
    }
}
