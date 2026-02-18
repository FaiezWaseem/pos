<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = session('active_restaurant_id');

        $query = Order::with(['customer', 'table', 'payment', 'user', 'items'])
            ->where('restaurant_id', $restaurantId);

        // Search by order number or customer name
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by order type
        if ($request->filled('type')) {
            $query->where('order_type', $request->input('type'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('pos/orders/index', [
            'orders'  => $orders,
            'filters' => $request->only(['search', 'status', 'type', 'date_from', 'date_to']),
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['restaurant', 'customer', 'table.area', 'payment', 'user', 'items.product', 'items.size']);

        return Inertia::render('pos/orders/show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,paid,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return back()->with('success', 'Order status updated.');
    }
}
