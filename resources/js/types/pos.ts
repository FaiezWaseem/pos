import { Restaurant, User } from "./auth";
import { Product, Category, ProductSize } from "./inventory";

export type Area = {
    id: number;
    restaurant_id: number;
    name: string;
    created_at: string;
    updated_at: string;
};

export type Table = {
    id: number;
    restaurant_id: number;
    area_id: number;
    table_number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    area?: Area;
};

export type Customer = {
    id: number;
    restaurant_id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
};

export type Discount = {
    id: number;
    restaurant_id: number;
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Order = {
    id: number;
    restaurant_id: number;
    user_id: number;
    customer_id?: number;
    table_id?: number;
    discount_id?: number | null;
    order_number: string;
    subtotal: number;
    tax: number;
    discount_amount: number;
    total: number;
    status: 'pending' | 'paid' | 'cancelled' | 'refunded';
    order_type: 'dine_in' | 'takeaway' | 'delivery';
    created_at: string;
    updated_at: string;
    restaurant?: Restaurant;
    user?: User;
    customer?: Customer;
    table?: Table;
    discount?: Discount;
    items?: OrderItem[];
    payment?: Payment;
};

export type OrderItemAddon = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

export type OrderItem = {
    id: number;
    order_id: number;
    product_id: number;
    size_id?: number | null;
    quantity: number;
    price: number;
    total: number;
    notes?: string;
    addons?: OrderItemAddon[];
    created_at: string;
    updated_at: string;
    product?: Product;
    size?: ProductSize;
};

export type Payment = {
    id: number;
    order_id: number;
    amount: number;
    payment_method: string;
    status: string;
    transaction_id?: string;
    created_at: string;
    updated_at: string;
};
