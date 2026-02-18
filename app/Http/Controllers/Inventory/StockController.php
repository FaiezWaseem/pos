<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockLog;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'restaurant'])
            ->where('track_quantity', true);

        if (!auth()->user()->isSuperAdmin()) {
            $query->where('restaurant_id', session('active_restaurant_id'));
        } elseif ($request->filled('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Stock status filter
        if ($request->filled('stock_status')) {
            match ($request->input('stock_status')) {
                'low'     => $query->whereColumn('quantity', '<=', 'stock_alert'),
                'out'     => $query->where('quantity', '<=', 0),
                'ok'      => $query->whereColumn('quantity', '>', 'stock_alert'),
                default   => null,
            };
        }

        $products = $query->orderBy('quantity')->get();

        // Summary counts
        $restaurantId = auth()->user()->isSuperAdmin()
            ? $request->input('restaurant_id')
            : session('active_restaurant_id');

        $baseQuery = Product::where('track_quantity', true);
        if ($restaurantId) $baseQuery->where('restaurant_id', $restaurantId);

        $summary = [
            'total'   => (clone $baseQuery)->count(),
            'low'     => (clone $baseQuery)->whereColumn('quantity', '<=', 'stock_alert')->where('quantity', '>', 0)->count(),
            'out'     => (clone $baseQuery)->where('quantity', '<=', 0)->count(),
            'ok'      => (clone $baseQuery)->whereColumn('quantity', '>', 'stock_alert')->count(),
        ];

        return Inertia::render('inventory/stock/index', [
            'products'    => $products,
            'summary'     => $summary,
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'filters'     => $request->only(['search', 'stock_status', 'restaurant_id']),
        ]);
    }

    public function adjust(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity_change' => 'required|integer|not_in:0',
            'note'            => 'nullable|string|max:255',
            'type'            => 'required|in:adjustment,restock',
        ]);

        $before = $product->quantity ?? 0;
        $after  = max(0, $before + $validated['quantity_change']);

        $product->update(['quantity' => $after]);

        StockLog::create([
            'product_id'     => $product->id,
            'user_id'        => auth()->id(),
            'quantity_before' => $before,
            'quantity_change' => $validated['quantity_change'],
            'quantity_after'  => $after,
            'type'           => $validated['type'],
            'note'           => $validated['note'],
        ]);

        return back()->with('success', 'Stock updated successfully.');
    }

    public function logs(Product $product)
    {
        $product->load(['stockLogs.user', 'stockLogs.order', 'category', 'restaurant']);

        return Inertia::render('inventory/stock/logs', [
            'product' => $product,
            'logs'    => $product->stockLogs()->with(['user', 'order'])->paginate(30),
        ]);
    }
}
