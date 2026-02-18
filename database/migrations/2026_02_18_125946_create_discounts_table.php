<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();                          // e.g. SAVE10
            $table->enum('type', ['percentage', 'fixed']);             // % or flat amount
            $table->decimal('value', 10, 2);                          // 10 = 10% or $10
            $table->decimal('min_order_amount', 10, 2)->default(0);   // minimum cart subtotal
            $table->decimal('max_discount_amount', 10, 2)->nullable(); // cap for % discounts
            $table->integer('usage_limit')->nullable();                // null = unlimited
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->date('starts_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
