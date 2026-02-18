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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->constrained()->onDelete('set null'); // Owner/Staff belongs to company
            $table->foreignId('restaurant_id')->nullable()->constrained()->onDelete('set null'); // Staff belongs to specific branch
            $table->foreignId('role_id')->nullable()->constrained()->onDelete('set null'); // Dynamic role
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['restaurant_id']);
            $table->dropForeign(['role_id']);
            $table->dropColumn(['company_id', 'restaurant_id', 'role_id', 'is_active']);
        });
    }
};
