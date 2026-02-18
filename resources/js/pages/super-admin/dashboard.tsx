import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

// Define breadcrumbs inside component or lazily to avoid module-level issues with route helpers
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Super Admin Dashboard',
        href: '/dashboard', // Hardcoded for now to avoid dependency issues
    },
];

interface Props {
    stats: {
        companies: number;
        users: number;
        revenue: number;
    };
}

export default function SuperAdminDashboard({ stats }: Props) {
    const { auth } = usePage<SharedData>().props;

    console.log('Super Admin Dashboard Mounted', auth);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="p-6 bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <h3 className="text-lg font-medium">Companies</h3>
                        <p className="text-3xl font-bold mt-2">{stats.companies}</p>
                        <p className="text-sm text-muted-foreground mt-1">Active Tenants</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <h3 className="text-lg font-medium">Total Users</h3>
                        <p className="text-3xl font-bold mt-2">{stats.users}</p>
                        <p className="text-sm text-muted-foreground mt-1">System Wide</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <h3 className="text-lg font-medium">Revenue</h3>
                        <p className="text-3xl font-bold mt-2">${stats.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Earnings</p>
                    </div>
                </div>
                
                <div className="relative min-h-[50vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar dark:border-sidebar-border p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                    <p className="text-muted-foreground">No recent activities to show.</p>
                </div>
            </div>
        </AppLayout>
    );
}
