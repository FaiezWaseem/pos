<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveRestaurant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !session()->has('active_restaurant_id')) {
            $primaryRestaurant = $user->primaryRestaurant() ?: $user->restaurants()->first();
            
            if ($primaryRestaurant) {
                session(['active_restaurant_id' => $primaryRestaurant->id]);
            } elseif ($user->isSuperAdmin()) {
                // For super admin, if not assigned to any restaurant, pick the first one from DB
                $firstRestaurant = \App\Models\Restaurant::first();
                if ($firstRestaurant) {
                    session(['active_restaurant_id' => $firstRestaurant->id]);
                }
            }
        }

        return $next($request);
    }
}
