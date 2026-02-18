<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Shift;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;

class HrController extends Controller
{
    public function index()
    {
        $restaurantId = session('active_restaurant_id');
        $user = auth()->user();

        // Check if user is clocked in
        $currentSession = Attendance::where('user_id', $user->id)
            ->where('restaurant_id', $restaurantId)
            ->whereNull('clock_out')
            ->first();

        // Recent activity (for admin/manager or self)
        // For now, show personal recent attendance
        $recentActivity = Attendance::where('user_id', $user->id)
            ->where('restaurant_id', $restaurantId)
            ->latest()
            ->take(5)
            ->get();

        // Upcoming shifts
        $upcomingShifts = Shift::where('user_id', $user->id)
            ->where('restaurant_id', $restaurantId)
            ->where('start_time', '>=', now())
            ->orderBy('start_time')
            ->take(5)
            ->get();

        return Inertia::render('hr/index', [
            'isClockedIn' => !!$currentSession,
            'currentSession' => $currentSession,
            'recentActivity' => $recentActivity,
            'upcomingShifts' => $upcomingShifts,
        ]);
    }

    public function clockIn(Request $request)
    {
        $restaurantId = session('active_restaurant_id');
        $user = auth()->user();

        // Check if already clocked in
        $existing = Attendance::where('user_id', $user->id)
            ->where('restaurant_id', $restaurantId)
            ->whereNull('clock_out')
            ->first();

        if ($existing) {
            return back()->with('error', 'You are already clocked in.');
        }

        Attendance::create([
            'restaurant_id' => $restaurantId,
            'user_id' => $user->id,
            'clock_in' => now(),
            'status' => 'present',
        ]);

        return back()->with('success', 'Clocked in successfully.');
    }

    public function clockOut(Request $request)
    {
        $restaurantId = session('active_restaurant_id');
        $user = auth()->user();

        $session = Attendance::where('user_id', $user->id)
            ->where('restaurant_id', $restaurantId)
            ->whereNull('clock_out')
            ->first();

        if (!$session) {
            return back()->with('error', 'You are not clocked in.');
        }

        $now = now();
        $duration = $session->clock_in->diffInHours($now);

        $session->update([
            'clock_out' => $now,
            'total_hours' => $duration,
        ]);

        return back()->with('success', 'Clocked out successfully.');
    }
    
    // Admin methods for Shifts/Attendance management would go here...
}
