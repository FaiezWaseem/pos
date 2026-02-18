<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Company;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role', 'company', 'restaurants']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleId = $request->input('role_id')) {
            $query->where('role_id', $roleId);
        }

        return Inertia::render('super-admin/users/index', [
            'users'   => $query->latest()->get(),
            'roles'   => Role::orderBy('label')->get(),
            'filters' => $request->only(['search', 'role_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('super-admin/users/create', [
            'roles' => Role::all(),
            'companies' => Company::all(),
            'restaurants' => Restaurant::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'company_id' => 'nullable|exists:companies,id',
            'restaurant_ids' => 'nullable|array',
            'restaurant_ids.*' => 'exists:restaurants,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        if (!empty($validated['restaurant_ids'])) {
            $syncData = [];
            foreach ($validated['restaurant_ids'] as $index => $id) {
                $syncData[$id] = ['is_primary' => $index === 0];
            }
            $user->restaurants()->sync($syncData);
        }

        return redirect()->route('super-admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('super-admin/users/edit', [
            'user' => $user->load(['role', 'company', 'restaurants']),
            'roles' => Role::all(),
            'companies' => Company::all(),
            'restaurants' => Restaurant::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'company_id' => 'nullable|exists:companies,id',
            'restaurant_ids' => 'nullable|array',
            'restaurant_ids.*' => 'exists:restaurants,id',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        if (isset($validated['restaurant_ids'])) {
            $syncData = [];
            foreach ($validated['restaurant_ids'] as $index => $id) {
                $syncData[$id] = ['is_primary' => $index === 0];
            }
            $user->restaurants()->sync($syncData);
        }

        return redirect()->route('super-admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return redirect()->route('super-admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
