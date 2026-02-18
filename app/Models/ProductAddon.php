<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAddon extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'addon_product_id',
        'price_override',
        'quantity_default',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'price_override' => 'decimal:2',
        'is_required' => 'boolean',
    ];

    /**
     * The product that has this addon
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The linked addon product
     */
    public function addonProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'addon_product_id');
    }

    /**
     * Get the effective price for this addon
     * Returns price_override if set, otherwise the addon product's price
     */
    public function getEffectivePriceAttribute(): float
    {
        return $this->price_override ?? $this->addonProduct->price;
    }
}
