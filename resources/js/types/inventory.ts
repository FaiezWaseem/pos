import { Restaurant } from "./auth";

export type Category = {
    id: number;
    restaurant_id: number;
    name: string;
    description?: string;
    image?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    restaurant?: Restaurant;
};

export type ProductSize = {
    id?: number;
    product_id: number;
    name: string;
    price_adjustment: number;
    quantity?: number | null;
    is_available: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
};

export type ProductAddon = {
    id?: number;
    product_id: number;
    addon_product_id: number;
    price_override?: number | null;
    quantity_default?: number | null;
    is_required: boolean;
    sort_order: number;
    addon_product?: Product;
    created_at?: string;
    updated_at?: string;
};

export type Product = {
    id: number;
    restaurant_id: number;
    category_id: number;
    name: string;
    description?: string;
    price: number;
    cost: number;
    image?: string;
    is_available: boolean;
    has_variations: boolean;
    quantity?: number | null;
    track_quantity: boolean;
    created_at: string;
    updated_at: string;
    restaurant?: Restaurant;
    category?: Category;
    sizes?: ProductSize[];
    addons?: ProductAddon[];
};

export type SimpleProduct = {
    id: number;
    name: string;
    price: number;
};
