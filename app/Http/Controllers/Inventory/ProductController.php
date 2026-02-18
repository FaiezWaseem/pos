<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\ProductAddon;
use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['restaurant', 'category', 'sizes', 'addons.addonProduct']);

        if (!auth()->user()->isSuperAdmin()) {
            $query->where('restaurant_id', session('active_restaurant_id'));
        } elseif ($request->has('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }

        return Inertia::render('inventory/products/index', [
            'products' => $query->latest()->get(),
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'filters' => $request->only(['restaurant_id']),
        ]);
    }

    public function create(Request $request)
    {
        $restaurantId = auth()->user()->isSuperAdmin() ? $request->restaurant_id : session('active_restaurant_id');

        return Inertia::render('inventory/products/create', [
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'categories' => $restaurantId ? Category::where('restaurant_id', $restaurantId)->get() : [],
            'products' => $restaurantId ? Product::where('restaurant_id', $restaurantId)->where('is_available', true)->get(['id', 'name', 'price']) : [],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
            'is_available' => 'required|boolean',
            'has_variations' => 'required|boolean',
            'quantity' => 'nullable|integer|min:0',
            'track_quantity' => 'required|boolean',
            'sizes' => 'nullable|array',
            'sizes.*.name' => 'required_with:sizes|string|max:255',
            'sizes.*.price_adjustment' => 'required_with:sizes|numeric',
            'sizes.*.quantity' => 'nullable|integer|min:0',
            'sizes.*.is_available' => 'boolean',
            'addons' => 'nullable|array',
            'addons.*.addon_product_id' => 'required_with:addons|exists:products,id',
            'addons.*.price_override' => 'nullable|numeric|min:0',
            'addons.*.quantity_default' => 'nullable|integer|min:0',
            'addons.*.is_required' => 'boolean',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($validated, $request) {
            $sizes = $validated['sizes'] ?? [];
            $addons = $validated['addons'] ?? [];
            
            unset($validated['sizes'], $validated['addons']);
            
            $product = Product::create($validated);

            // Create sizes
            foreach ($sizes as $index => $sizeData) {
                $product->sizes()->create([
                    'name' => $sizeData['name'],
                    'price_adjustment' => $sizeData['price_adjustment'] ?? 0,
                    'quantity' => $sizeData['quantity'] ?? null,
                    'is_available' => $sizeData['is_available'] ?? true,
                    'sort_order' => $index,
                ]);
            }

            // Create addons
            foreach ($addons as $index => $addonData) {
                $product->addons()->create([
                    'addon_product_id' => $addonData['addon_product_id'],
                    'price_override' => $addonData['price_override'] ?? null,
                    'quantity_default' => $addonData['quantity_default'] ?? null,
                    'is_required' => $addonData['is_required'] ?? false,
                    'sort_order' => $index,
                ]);
            }
        });

        return redirect()->route('inventory.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        if (!auth()->user()->isSuperAdmin() && $product->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $product->load(['sizes', 'addons.addonProduct']);

        return Inertia::render('inventory/products/edit', [
            'product' => $product,
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'categories' => Category::where('restaurant_id', $product->restaurant_id)->get(),
            'products' => Product::where('restaurant_id', $product->restaurant_id)
                ->where('id', '!=', $product->id)
                ->where('is_available', true)
                ->get(['id', 'name', 'price']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        if (!auth()->user()->isSuperAdmin() && $product->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
            'is_available' => 'required|boolean',
            'has_variations' => 'required|boolean',
            'quantity' => 'nullable|integer|min:0',
            'track_quantity' => 'required|boolean',
            'sizes' => 'nullable|array',
            'sizes.*.id' => 'nullable|exists:product_sizes,id',
            'sizes.*.name' => 'required_with:sizes|string|max:255',
            'sizes.*.price_adjustment' => 'required_with:sizes|numeric',
            'sizes.*.quantity' => 'nullable|integer|min:0',
            'sizes.*.is_available' => 'boolean',
            'addons' => 'nullable|array',
            'addons.*.id' => 'nullable|exists:product_addons,id',
            'addons.*.addon_product_id' => 'required_with:addons|exists:products,id',
            'addons.*.price_override' => 'nullable|numeric|min:0',
            'addons.*.quantity_default' => 'nullable|integer|min:0',
            'addons.*.is_required' => 'boolean',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($validated, $product) {
            $sizes = $validated['sizes'] ?? [];
            $addons = $validated['addons'] ?? [];
            
            unset($validated['sizes'], $validated['addons']);
            
            $product->update($validated);

            // Handle sizes - delete removed ones, update existing, create new
            $existingSizeIds = collect($sizes)->whereNotNull('id')->pluck('id')->toArray();
            $product->sizes()->whereNotIn('id', $existingSizeIds)->delete();

            foreach ($sizes as $index => $sizeData) {
                if (isset($sizeData['id'])) {
                    $product->sizes()->where('id', $sizeData['id'])->update([
                        'name' => $sizeData['name'],
                        'price_adjustment' => $sizeData['price_adjustment'] ?? 0,
                        'quantity' => $sizeData['quantity'] ?? null,
                        'is_available' => $sizeData['is_available'] ?? true,
                        'sort_order' => $index,
                    ]);
                } else {
                    $product->sizes()->create([
                        'name' => $sizeData['name'],
                        'price_adjustment' => $sizeData['price_adjustment'] ?? 0,
                        'quantity' => $sizeData['quantity'] ?? null,
                        'is_available' => $sizeData['is_available'] ?? true,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Handle addons - delete removed ones, update existing, create new
            $existingAddonIds = collect($addons)->whereNotNull('id')->pluck('id')->toArray();
            $product->addons()->whereNotIn('id', $existingAddonIds)->delete();

            foreach ($addons as $index => $addonData) {
                if (isset($addonData['id'])) {
                    $product->addons()->where('id', $addonData['id'])->update([
                        'addon_product_id' => $addonData['addon_product_id'],
                        'price_override' => $addonData['price_override'] ?? null,
                        'quantity_default' => $addonData['quantity_default'] ?? null,
                        'is_required' => $addonData['is_required'] ?? false,
                        'sort_order' => $index,
                    ]);
                } else {
                    $product->addons()->create([
                        'addon_product_id' => $addonData['addon_product_id'],
                        'price_override' => $addonData['price_override'] ?? null,
                        'quantity_default' => $addonData['quantity_default'] ?? null,
                        'is_required' => $addonData['is_required'] ?? false,
                        'sort_order' => $index,
                    ]);
                }
            }
        });

        return redirect()->route('inventory.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        if (!auth()->user()->isSuperAdmin() && $product->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('inventory.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
