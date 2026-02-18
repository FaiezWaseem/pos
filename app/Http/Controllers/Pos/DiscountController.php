<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = session('active_restaurant_id');

        $query = Discount::where('restaurant_id', $restaurantId);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $discounts = $query->latest()->get();

        return Inertia::render('pos/discounts/index', [
            'discounts' => $discounts,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $restaurantId = session('active_restaurant_id');

        $validated = $request->validate([
            'name'               => 'required|string|max:100',
            'code'               => 'required|string|max:30|unique:discounts,code',
            'type'               => 'required|in:percentage,fixed',
            'value'              => 'required|numeric|min:0.01',
            'min_order_amount'   => 'nullable|numeric|min:0',
            'max_discount_amount'=> 'nullable|numeric|min:0',
            'usage_limit'        => 'nullable|integer|min:1',
            'is_active'          => 'boolean',
            'starts_at'          => 'nullable|date',
            'expires_at'         => 'nullable|date|after_or_equal:starts_at',
        ]);

        $validated['restaurant_id'] = $restaurantId;
        $validated['code'] = strtoupper($validated['code']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        Discount::create($validated);

        return back()->with('success', 'Discount created successfully.');
    }

    public function update(Request $request, Discount $discount)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:100',
            'code'               => 'required|string|max:30|unique:discounts,code,' . $discount->id,
            'type'               => 'required|in:percentage,fixed',
            'value'              => 'required|numeric|min:0.01',
            'min_order_amount'   => 'nullable|numeric|min:0',
            'max_discount_amount'=> 'nullable|numeric|min:0',
            'usage_limit'        => 'nullable|integer|min:1',
            'is_active'          => 'boolean',
            'starts_at'          => 'nullable|date',
            'expires_at'         => 'nullable|date|after_or_equal:starts_at',
        ]);

        $validated['code'] = strtoupper($validated['code']);
        $discount->update($validated);

        return back()->with('success', 'Discount updated successfully.');
    }

    public function destroy(Discount $discount)
    {
        $discount->delete();
        return back()->with('success', 'Discount deleted.');
    }

    /**
     * Validate a discount code and return the discount amount (called from POS via fetch).
     */
    public function apply(Request $request)
    {
        $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $restaurantId = session('active_restaurant_id');
        $code = strtoupper(trim($request->input('code')));

        $discount = Discount::where('restaurant_id', $restaurantId)
            ->where('code', $code)
            ->first();

        if (!$discount) {
            return response()->json(['error' => 'Invalid discount code.'], 422);
        }

        $subtotal = (float) $request->input('subtotal');

        if (!$discount->isValidFor($subtotal)) {
            $reason = !$discount->is_active ? 'This discount is inactive.'
                : ($subtotal < $discount->min_order_amount ? "Minimum order amount is \${$discount->min_order_amount}."
                : ($discount->usage_limit !== null && $discount->used_count >= $discount->usage_limit ? 'Usage limit reached.'
                : 'This discount has expired.'));
            return response()->json(['error' => $reason], 422);
        }

        $amount = $discount->calculateAmount($subtotal);

        return response()->json([
            'discount_id'     => $discount->id,
            'discount_amount' => $amount,
            'code'            => $discount->code,
            'name'            => $discount->name,
            'type'            => $discount->type,
            'value'           => $discount->value,
        ]);
    }
}
