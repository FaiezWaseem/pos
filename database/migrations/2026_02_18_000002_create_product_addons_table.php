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
        Schema::create('product_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade'); // The product that has addons
            $table->foreignId('addon_product_id')->constrained('products')->onDelete('cascade'); // The linked addon product
            $table->decimal('price_override', 10, 2)->nullable(); // Optional price override for the addon
            $table->integer('quantity_default')->nullable(); // Default quantity for this addon
            $table->boolean('is_required')->default(false); // Whether this addon is mandatory
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Prevent duplicate addon links
            $table->unique(['product_id', 'addon_product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_addons');
    }
};
