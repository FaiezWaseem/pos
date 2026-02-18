<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['restaurant', 'user.role']);

        if (!auth()->user()->isSuperAdmin()) {
            $query->where('restaurant_id', session('active_restaurant_id'));
        } elseif ($request->has('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }

        return Inertia::render('staff/employees/index', [
            'employees' => $query->latest()->get(),
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'filters' => $request->only(['restaurant_id']),
        ]);
    }

    public function create()
    {
        // For staff, we usually assign roles like manager, waiter, chef
        $roles = Role::whereIn('name', ['manager', 'waiter', 'chef'])->get();
        
        return Inertia::render('staff/employees/create', [
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'employee_id' => 'required|string|max:50|unique:employees',
            'designation' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'salary' => 'nullable|numeric|min:0',
            'joining_date' => 'nullable|date',
            'is_active' => 'required|boolean',
        ]);

        $restaurant_id = auth()->user()->isSuperAdmin() ? $validated['restaurant_id'] : session('active_restaurant_id');

        DB::transaction(function () use ($validated, $restaurant_id) {
            // Create user account for the employee
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role_id' => $validated['role_id'],
                'restaurant_id' => $restaurant_id, // Keep for backward compatibility if needed, but we'll use pivot
            ]);

            // Sync with pivot table
            $user->restaurants()->sync([
                $restaurant_id => ['is_primary' => true]
            ]);

            // Create employee record
            Employee::create([
                'restaurant_id' => $restaurant_id,
                'user_id' => $user->id,
                'employee_id' => $validated['employee_id'],
                'designation' => $validated['designation'],
                'phone' => $validated['phone'],
                'salary' => $validated['salary'],
                'joining_date' => $validated['joining_date'],
                'is_active' => $validated['is_active'],
            ]);
        });

        return redirect()->route('staff.employees.index')
            ->with('success', 'Employee created successfully.');
    }

    public function edit(Employee $employee)
    {
        if (!auth()->user()->isSuperAdmin() && $employee->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $employee->load(['user', 'restaurant']);
        $roles = Role::whereIn('name', ['manager', 'waiter', 'chef'])->get();

        return Inertia::render('staff/employees/edit', [
            'employee' => $employee,
            'restaurants' => auth()->user()->isSuperAdmin() ? Restaurant::all() : [],
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        if (!auth()->user()->isSuperAdmin() && $employee->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        $validated = $request->validate([
            'restaurant_id' => auth()->user()->isSuperAdmin() ? 'required|exists:restaurants,id' : 'nullable',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $employee->user_id,
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'employee_id' => 'required|string|max:50|unique:employees,employee_id,' . $employee->id,
            'designation' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'salary' => 'nullable|numeric|min:0',
            'joining_date' => 'nullable|date',
            'is_active' => 'required|boolean',
        ]);

        $restaurant_id = auth()->user()->isSuperAdmin() ? $validated['restaurant_id'] : session('active_restaurant_id');

        DB::transaction(function () use ($validated, $employee, $restaurant_id) {
            // Update user account
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role_id' => $validated['role_id'],
                'restaurant_id' => $restaurant_id,
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $employee->user->update($userData);

            // Sync with pivot table
            $employee->user->restaurants()->sync([
                $restaurant_id => ['is_primary' => true]
            ]);

            // Update employee record
            $employee->update([
                'restaurant_id' => $restaurant_id,
                'employee_id' => $validated['employee_id'],
                'designation' => $validated['designation'],
                'phone' => $validated['phone'],
                'salary' => $validated['salary'],
                'joining_date' => $validated['joining_date'],
                'is_active' => $validated['is_active'],
            ]);
        });

        return redirect()->route('staff.employees.index')
            ->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        if (!auth()->user()->isSuperAdmin() && $employee->restaurant_id != session('active_restaurant_id')) {
            abort(403);
        }

        DB::transaction(function () use ($employee) {
            $user = $employee->user;
            $employee->delete();
            $user->delete();
        });

        return redirect()->route('staff.employees.index')
            ->with('success', 'Employee deleted successfully.');
    }
}
