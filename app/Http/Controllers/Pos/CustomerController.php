<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = session('active_restaurant_id');
        $query = Customer::where('restaurant_id', $restaurantId);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $customers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('pos/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('pos/customers/create');
    }

    public function store(Request $request)
    {
        $restaurantId = session('active_restaurant_id');
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $validated['restaurant_id'] = $restaurantId;

        Customer::create($validated);

        return redirect()->route('pos.customers.index')
            ->with('success', 'Customer created successfully.');
    }

    public function show(Customer $customer)
    {
        $customer->load(['orders' => function($q) {
            $q->latest()->take(10);
        }, 'loyaltyTransactions']);

        return Inertia::render('pos/customers/show', [
            'customer' => $customer,
        ]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('pos/customers/edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $customer->update($validated);

        return redirect()->route('pos.customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('pos.customers.index')
            ->with('success', 'Customer deleted successfully.');
    }
}
