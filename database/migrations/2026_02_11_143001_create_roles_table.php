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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->onDelete('cascade'); // Null for system roles (Super Admin)
            $table->string('name'); // e.g., 'admin', 'manager', 'waiter', 'chef'
            $table->string('label')->nullable(); // Readable name e.g., "Restaurant Manager"
            $table->json('permissions')->nullable(); // Simple permission storage for now
            $table->boolean('is_system')->default(false); // If true, cannot be deleted by user
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
