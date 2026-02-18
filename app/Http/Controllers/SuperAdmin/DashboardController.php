<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('super-admin/dashboard', [
            'stats' => [
                'companies' => Company::count(),
                'users' => User::count(),
                'revenue' => 0.00, // Placeholder for now
            ]
        ]);
    }
}
