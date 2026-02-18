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
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'last_visit_at')) {
                $table->timestamp('last_visit_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('customers', 'loyalty_points')) {
                $table->integer('loyalty_points')->default(0)->after('updated_at'); // Fallback position if last_visit_at exists but I don't want to check complex logic
            }
        });

        if (!Schema::hasTable('loyalty_transactions')) {
            Schema::create('loyalty_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained()->onDelete('cascade');
                $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
                $table->string('type'); // 'earned', 'redeemed', 'adjustment', 'refund'
                $table->integer('points'); // Positive or negative
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
        
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('loyalty_points');
        });
    }
};
