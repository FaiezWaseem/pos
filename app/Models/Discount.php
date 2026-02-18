<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'name',
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'used_count',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'value'              => 'decimal:2',
        'min_order_amount'   => 'decimal:2',
        'max_discount_amount'=> 'decimal:2',
        'is_active'          => 'boolean',
        'starts_at'          => 'date',
        'expires_at'         => 'date',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Check if this discount is currently valid for a given subtotal.
     */
    public function isValidFor(float $subtotal): bool
    {
        if (!$this->is_active) return false;
        if ($subtotal < $this->min_order_amount) return false;
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) return false;
        if ($this->starts_at && now()->lt($this->starts_at)) return false;
        if ($this->expires_at && now()->gt($this->expires_at->endOfDay())) return false;
        return true;
    }

    /**
     * Calculate the discount amount for a given subtotal.
     */
    public function calculateAmount(float $subtotal): float
    {
        if ($this->type === 'percentage') {
            $amount = $subtotal * ($this->value / 100);
            if ($this->max_discount_amount) {
                $amount = min($amount, $this->max_discount_amount);
            }
            return round($amount, 2);
        }

        // Fixed
        return round(min($this->value, $subtotal), 2);
    }
}
