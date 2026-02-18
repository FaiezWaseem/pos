import { User, Restaurant } from "./auth";

export type Employee = {
    id: number;
    restaurant_id: number;
    user_id: number;
    employee_id: string;
    designation: string;
    phone?: string;
    salary?: number;
    joining_date?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user?: User;
    restaurant?: Restaurant;
};
