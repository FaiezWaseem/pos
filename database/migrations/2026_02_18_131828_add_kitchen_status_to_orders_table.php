<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // kitchen_status separate from main status (which might track payment)
            // pending: just created
            // preparing: kitchen acknowledged
            // ready: cooked, waiting for pickup/delivery
            // completed: served/delivered
            $table->string('kitchen_status')->default('pending')->after('status');
            $table->timestamp('completed_at')->nullable()->after('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['kitchen_status', 'completed_at']);
        });
    }
};
