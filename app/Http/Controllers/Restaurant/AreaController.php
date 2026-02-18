<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $query = Area::with(['restaurant']);

        if (!auth()->user()->isSuperAdmin()) {
            $query->where('restaurant_id', session('active_restaurant_id'));
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return Inertia::render('restaurant/areas/index', [
            'areas'   => $query->latest()->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('restaurant/areas/create', [
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : []
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        Area::create($validated);

        return redirect()->route('restaurant.areas.index')
            ->with('success', 'Area created successfully.');
    }

    public function edit(Area $area)
    {
        if (!auth()->user()->isSuperAdmin() && $area->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        return Inertia::render('restaurant/areas/edit', [
            'area' => $area,
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : []
        ]);
    }

    public function update(Request $request, Area $area)
    {
        if (!auth()->user()->isSuperAdmin() && $area->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        $area->update($validated);

        return redirect()->route('restaurant.areas.index')
            ->with('success', 'Area updated successfully.');
    }

    public function destroy(Area $area)
    {
        if (!auth()->user()->isSuperAdmin() && $area->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $area->delete();

        return redirect()->route('restaurant.areas.index')
            ->with('success', 'Area deleted successfully.');
    }
}
