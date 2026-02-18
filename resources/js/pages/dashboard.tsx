import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { 
    ShoppingCart, 
    Calendar, 
    DollarSign, 
    Package, 
    AlertTriangle,
    TrendingUp,
    CalendarDays,
    Boxes
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    todayOrders: number;
    weeklyOrders: number;
    totalOrders: number;
    todayRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    lowStockCount: number;
    totalProducts: number;
}

interface Props {
    stats: DashboardStats;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    iconBg: string;
    textColor: string;
    trend?: string;
}

function StatCard({ title, value, icon, bgColor, iconBg, textColor, trend }: StatCardProps) {
    return (
        <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-white/20 transition-transform hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
                    <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
                    {trend && (
                        <p className={`text-xs ${textColor} opacity-70 mt-1`}>{trend}</p>
                    )}
                </div>
                <div className={`${iconBg} p-3 rounded-lg shadow-sm`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ stats }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const orderStats: StatCardProps[] = [
        {
            title: 'Today Orders',
            value: stats.todayOrders,
            icon: <ShoppingCart className="h-6 w-6 text-white" />,
            bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
            iconBg: 'bg-blue-700/50',
            textColor: 'text-white',
            trend: 'Orders placed today',
        },
        {
            title: 'Weekly Orders',
            value: stats.weeklyOrders,
            icon: <Calendar className="h-6 w-6 text-white" />,
            bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            iconBg: 'bg-indigo-700/50',
            textColor: 'text-white',
            trend: 'This week total',
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: <TrendingUp className="h-6 w-6 text-white" />,
            bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
            iconBg: 'bg-purple-700/50',
            textColor: 'text-white',
            trend: 'All time orders',
        },
    ];

    const revenueStats: StatCardProps[] = [
        {
            title: 'Today Revenue',
            value: formatCurrency(stats.todayRevenue),
            icon: <DollarSign className="h-6 w-6 text-white" />,
            bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            iconBg: 'bg-emerald-700/50',
            textColor: 'text-white',
            trend: 'Revenue today',
        },
        {
            title: 'Weekly Revenue',
            value: formatCurrency(stats.weeklyRevenue),
            icon: <CalendarDays className="h-6 w-6 text-white" />,
            bgColor: 'bg-gradient-to-br from-teal-500 to-teal-600',
            iconBg: 'bg-teal-700/50',
            textColor: 'text-white',
            trend: 'This week total',
        },
        {
            title: 'Monthly Revenue',
            value: formatCurrency(stats.monthlyRevenue),
            icon: <DollarSign className="h-6 w-6 text-white" />,
            bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
            iconBg: 'bg-green-700/50',
            textColor: 'text-white',
            trend: 'This month total',
        },
    ];

    const alertStats: StatCardProps[] = [
        {
            title: 'Low Stock Alert',
            value: stats.lowStockCount,
            icon: <AlertTriangle className="h-6 w-6 text-white" />,
            bgColor: stats.lowStockCount > 0 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500',
            iconBg: stats.lowStockCount > 0 ? 'bg-red-700/50' : 'bg-gray-600/50',
            textColor: 'text-white',
            trend: stats.lowStockCount > 0 ? 'Needs attention!' : 'All products stocked',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: <Boxes className="h-6 w-6 text-white" />,
            bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
            iconBg: 'bg-orange-700/50',
            textColor: 'text-white',
            trend: 'Active products',
        },
        {
            title: 'Stock Status',
            value: stats.lowStockCount > 0 ? 'Action Needed' : 'All Good',
            icon: <Package className="h-6 w-6 text-white" />,
            bgColor: stats.lowStockCount > 0 
                ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                : 'bg-gradient-to-br from-cyan-500 to-cyan-600',
            iconBg: stats.lowStockCount > 0 ? 'bg-amber-700/50' : 'bg-cyan-700/50',
            textColor: 'text-white',
            trend: `${stats.totalProducts - stats.lowStockCount} in stock`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Page Header */}
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your restaurant today.</p>
                </div>

                {/* Orders Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                        Orders
                    </h2>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {orderStats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>
                </div>

                {/* Revenue Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        Revenue
                    </h2>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {revenueStats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>
                </div>

                {/* Alerts & Stock Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Inventory & Alerts
                    </h2>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {alertStats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>
                </div>

                {/* Quick Stats Summary */}
                <div className="mt-4 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:bg-gray-800 dark:border-sidebar-border">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.todayOrders}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Today's Orders</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.todayRevenue)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Today's Revenue</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalOrders}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalProducts}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
