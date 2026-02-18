<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Table;
use App\Models\Area;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PosController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = session('active_restaurant_id');

        if (!$restaurantId) {
            if (auth()->user()->isSuperAdmin()) {
                // For Super Admin without an active restaurant, show selection or first restaurant
                $firstRestaurant = \App\Models\Restaurant::first();
                if ($firstRestaurant) {
                    session(['active_restaurant_id' => $firstRestaurant->id]);
                    $restaurantId = $firstRestaurant->id;
                } else {
                    return redirect()->route('dashboard')->with('error', 'No restaurants found. Please create a restaurant first.');
                }
            } else {
                return redirect()->route('dashboard')->with('error', 'You must be assigned to a restaurant to access the POS.');
            }
        }

        $categories = Category::where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->with(['products' => function($query) {
                $query->where('is_available', true)
                    ->with(['sizes' => function($q) {
                        $q->where('is_available', true)->orderBy('sort_order');
                    }, 'addons.addonProduct' => function($q) {
                        $q->where('is_available', true);
                    }]);
            }])
            ->get();

        $tables = Table::where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->with('area')
            ->get();

        $areas = Area::where('restaurant_id', $restaurantId)->get();
        
        $customers = Customer::where('restaurant_id', $restaurantId)->latest()->limit(10)->get();

        return Inertia::render('pos/index', [
            'categories' => $categories,
            'tables' => $tables,
            'areas' => $areas,
            'customers' => $customers,
            'restaurant_id' => $restaurantId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'customer_id' => 'nullable|exists:customers,id',
            'table_id' => 'nullable|exists:tables,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
            'items.*.size_id' => 'nullable|exists:product_sizes,id',
            'items.*.addons' => 'nullable|array',
            'items.*.addons.*.id' => 'required_with:items.*.addons|exists:product_addons,id',
            'items.*.addons.*.quantity' => 'required_with:items.*.addons|integer|min:1',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,card,online',
            'order_type' => 'required|string|in:dine_in,takeaway,delivery',
        ]);

        $order = DB::transaction(function () use ($validated) {
            // 1. Create Order
            $order = Order::create([
                'restaurant_id' => $validated['restaurant_id'],
                'user_id' => auth()->id(),
                'customer_id' => $validated['customer_id'],
                'table_id' => $validated['table_id'],
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'subtotal' => $validated['subtotal'],
                'tax' => $validated['tax'],
                'total' => $validated['total'],
                'status' => 'pending',
                'order_type' => $validated['order_type'],
            ]);

            // 2. Create Order Items
            foreach ($validated['items'] as $item) {
                // Prepare addons data for storage
                $addonsData = null;
                if (!empty($item['addons'])) {
                    $addonsData = collect($item['addons'])->map(function ($addon) {
                        $addonModel = \App\Models\ProductAddon::with('addonProduct')->find($addon['id']);
                        return [
                            'id' => $addon['id'],
                            'name' => $addonModel->addonProduct->name ?? 'Unknown',
                            'price' => $addonModel->price_override ?? $addonModel->addonProduct->price ?? 0,
                            'quantity' => $addon['quantity'],
                        ];
                    })->toArray();
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'size_id' => $item['size_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['quantity'] * $item['price'],
                    'notes' => $item['notes'] ?? null,
                    'addons' => $addonsData,
                ]);
            }

            // 3. Create Payment
            Payment::create([
                'order_id' => $order->id,
                'amount' => $validated['total'],
                'payment_method' => $validated['payment_method'],
                'status' => 'completed',
                'transaction_id' => 'TXN-' . strtoupper(uniqid()),
            ]);

            // 4. Update Order Status to Paid
            $order->update(['status' => 'paid']);

            // 5. Update Table Status if it's dine-in
            if ($validated['table_id']) {
                Table::find($validated['table_id'])->update(['status' => 'occupied']);
            }

            return $order;
        });

        return redirect()->route('pos.receipt', $order->id);
    }

    public function receipt(Order $order)
    {
        $order->load(['restaurant', 'items.product', 'items.size', 'customer', 'table', 'payment']);
        
        return Inertia::render('pos/receipt', [
            'order' => $order
        ]);
    }
}
