<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('super-admin/roles/index', [
            'roles' => Role::with('company')->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('super-admin/roles/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'label' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        Role::create($validated + ['is_system' => true]);

        return redirect()->route('super-admin.roles.index')
            ->with('success', 'Role created successfully.');
    }

    public function edit(Role $role)
    {
        return Inertia::render('super-admin/roles/edit', [
            'role' => $role,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'label' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $role->update($validated);

        return redirect()->route('super-admin.roles.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return back()->with('error', 'System roles cannot be deleted.');
        }

        $role->delete();

        return redirect()->route('super-admin.roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
