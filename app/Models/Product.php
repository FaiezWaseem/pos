<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'category_id',
        'name',
        'description',
        'price',
        'cost',
        'image',
        'is_available',
        'has_variations',
        'quantity',
        'track_quantity',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'is_available' => 'boolean',
        'has_variations' => 'boolean',
        'track_quantity' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Sizes available for this product (e.g., Small, Medium, Large)
     */
    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class)->orderBy('sort_order');
    }

    /**
     * Addons linked to this product
     */
    public function addons(): HasMany
    {
        return $this->hasMany(ProductAddon::class)->orderBy('sort_order');
    }

    /**
     * Products that this product is an addon for
     */
    public function parentProducts(): HasMany
    {
        return $this->hasMany(ProductAddon::class, 'addon_product_id');
    }

    /**
     * Check if product is in stock
     */
    public function isInStock(): bool
    {
        if (!$this->track_quantity) {
            return true;
        }
        return $this->quantity > 0;
    }

    /**
     * Get available sizes
     */
    public function availableSizes(): HasMany
    {
        return $this->sizes()->where('is_available', true);
    }

    /**
     * Get available addons
     */
    public function availableAddons(): HasMany
    {
        return $this->addons()->whereHas('addonProduct', function ($query) {
            $query->where('is_available', true);
        });
    }
}
