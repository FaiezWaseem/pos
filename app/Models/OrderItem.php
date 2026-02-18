<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'size_id',
        'quantity',
        'price',
        'total',
        'notes',
        'addons',
    ];

    protected $casts = [
        'addons' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(ProductSize::class, 'size_id');
    }

    /**
     * Get the display name for this order item
     */
    public function getDisplayNameAttribute(): string
    {
        $name = $this->product->name;
        
        if ($this->size) {
            $name .= ' (' . $this->size->name . ')';
        }
        
        return $name;
    }

    /**
     * Get formatted addons string
     */
    public function getAddonsStringAttribute(): ?string
    {
        if (!$this->addons || empty($this->addons)) {
            return null;
        }
        
        return collect($this->addons)
            ->map(fn($addon) => $addon['name'] . ' x' . $addon['quantity'])
            ->join(', ');
    }
}
