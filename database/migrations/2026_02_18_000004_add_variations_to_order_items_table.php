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
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('size_id')->nullable()->after('product_id')->constrained('product_sizes')->onDelete('set null');
            $table->json('addons')->nullable()->after('notes'); // Store addons as JSON: [{"id": 1, "name": "Extra Cheese", "price": 1.50, "quantity": 1}]
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['size_id']);
            $table->dropColumn(['size_id', 'addons']);
        });
    }
};
