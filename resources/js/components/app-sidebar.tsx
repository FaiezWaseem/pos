import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Building2, Users, ShieldCheck, Store, Package, Layers, UserCircle, Calculator, MapPin, Tablet, ClipboardList } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';
import { RestaurantSwitcher } from './restaurant-switcher';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'POS',
            href: '/pos',
            icon: Calculator,
        },
        {
            title: 'Order History',
            href: '/pos/orders',
            icon: ClipboardList,
        },
    ];

    const superAdminNavItems: NavItem[] = [
        {
            title: 'Companies',
            href: '/super-admin/companies',
            icon: Building2,
        },
        {
            title: 'Restaurants',
            href: '/super-admin/restaurants',
            icon: Store,
        },
        {
            title: 'Roles',
            href: '/super-admin/roles',
            icon: ShieldCheck,
        },
        {
            title: 'All Users',
            href: '/super-admin/users',
            icon: Users,
        },
    ];

    const inventoryNavItems: NavItem[] = [
        {
            title: 'Categories',
            href: '/inventory/categories',
            icon: Layers,
        },
        {
            title: 'Products',
            href: '/inventory/products',
            icon: Package,
        },
    ];

    const staffNavItems: NavItem[] = [
        {
            title: 'Employees',
            href: '/staff/employees',
            icon: UserCircle,
        },
    ];

    const restaurantNavItems: NavItem[] = [
        {
            title: 'Areas',
            href: '/restaurant/areas',
            icon: MapPin,
        },
        {
            title: 'Tables',
            href: '/restaurant/tables',
            icon: Tablet,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <RestaurantSwitcher />
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain items={inventoryNavItems} label="Inventory" />
                <NavMain items={restaurantNavItems} label="Restaurant" />
                <NavMain items={staffNavItems} label="Staff" />
                {isSuperAdmin && (
                    <NavMain items={superAdminNavItems} label="Super Admin" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
