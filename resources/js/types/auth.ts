export type Role = {
    id: number;
    name: string;
    label: string;
    permissions: string[];
    is_system: boolean;
    created_at: string;
    updated_at: string;
};

export type Company = {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo?: string;
    created_at: string;
    updated_at: string;
};

export type Restaurant = {
    id: number;
    company_id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    currency_symbol: string;
    tax_rate: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    company?: Company;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role?: Role;
    company?: Company;
    restaurant?: Restaurant;
    restaurants?: Restaurant[];
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    active_restaurant_id: number | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
