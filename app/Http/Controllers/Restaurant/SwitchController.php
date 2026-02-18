<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SwitchController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
        ]);

        $user = auth()->user();

        // Check if user is actually assigned to this restaurant
        if (!$user->isSuperAdmin() && !$user->restaurants->contains($request->restaurant_id)) {
            abort(403, 'You are not assigned to this restaurant.');
        }

        session(['active_restaurant_id' => $request->restaurant_id]);

        return back()->with('success', 'Restaurant switched successfully.');
    }
}
