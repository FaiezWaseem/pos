<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Restaurant;
use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $query = Table::with(['restaurant', 'area']);

        if (!auth()->user()->isSuperAdmin()) {
            $query->where('restaurant_id', session('active_restaurant_id'));
        }

        if ($search = $request->input('search')) {
            $query->where('table_number', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('area_id')) {
            $query->where('area_id', $request->input('area_id'));
        }

        // Pass areas for the filter dropdown (scoped to restaurant)
        $areasQuery = Area::query();
        if (!auth()->user()->isSuperAdmin()) {
            $areasQuery->where('restaurant_id', session('active_restaurant_id'));
        }

        return Inertia::render('restaurant/tables/index', [
            'tables'  => $query->latest()->get(),
            'areas'   => $areasQuery->orderBy('name')->get(),
            'filters' => $request->only(['search', 'status', 'area_id']),
        ]);
    }

    public function create()
    {
        $restaurants = auth()->user()->isSuperAdmin() ? Restaurant::all() : [];
        
        $areasQuery = Area::query();
        if (!auth()->user()->isSuperAdmin()) {
            $areasQuery->where('restaurant_id', session('active_restaurant_id'));
        }
        $areas = $areasQuery->get();

        return Inertia::render('restaurant/tables/create', [
            'restaurants' => $restaurants,
            'areas' => $areas
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'area_id' => 'required|exists:areas,id',
            'table_number' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,reserved,maintenance',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        Table::create($validated);

        return redirect()->route('restaurant.tables.index')
            ->with('success', 'Table created successfully.');
    }

    public function edit(Table $table)
    {
        if (!auth()->user()->isSuperAdmin() && $table->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $restaurants = auth()->user()->isSuperAdmin() ? Restaurant::all() : [];
        
        $areasQuery = Area::query();
        if (!auth()->user()->isSuperAdmin()) {
            $areasQuery->where('restaurant_id', session('active_restaurant_id'));
        } else {
            $areasQuery->where('restaurant_id', $table->restaurant_id);
        }
        $areas = $areasQuery->get();

        return Inertia::render('restaurant/tables/edit', [
            'table' => $table,
            'restaurants' => $restaurants,
            'areas' => $areas
        ]);
    }

    public function update(Request $request, Table $table)
    {
        if (!auth()->user()->isSuperAdmin() && $table->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'area_id' => 'required|exists:areas,id',
            'table_number' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,reserved,maintenance',
        ]);

        if (!auth()->user()->isSuperAdmin()) {
            $validated['restaurant_id'] = session('active_restaurant_id');
        }

        $table->update($validated);

        return redirect()->route('restaurant.tables.index')
            ->with('success', 'Table updated successfully.');
    }

    public function destroy(Table $table)
    {
        if (!auth()->user()->isSuperAdmin() && $table->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $table->delete();

        return redirect()->route('restaurant.tables.index')
            ->with('success', 'Table deleted successfully.');
    }
}
