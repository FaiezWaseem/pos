<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('restaurant');

        if (!auth()->user()->isSuperAdmin()) {
            $query->where('restaurant_id', session('active_restaurant_id'));
        } elseif ($request->has('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }

        return Inertia::render('inventory/categories/index', [
            'categories' => $query->latest()->get(),
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'filters' => $request->only(['restaurant_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('inventory/categories/create', [
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'required|boolean',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        Category::create($validated);

        return redirect()->route('inventory.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(Category $category)
    {
        if (!auth()->user()->isSuperAdmin() && $category->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        return Inertia::render('inventory/categories/edit', [
            'category' => $category,
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
        ]);
    }

    public function update(Request $request, Category $category)
    {
        if (!auth()->user()->isSuperAdmin() && $category->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'required|boolean',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($validated);

        return redirect()->route('inventory.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if (!auth()->user()->isSuperAdmin() && $category->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return redirect()->route('inventory.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
