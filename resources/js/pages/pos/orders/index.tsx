import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'POS', href: '/pos' },
    { title: 'Order History', href: '/pos/orders' },
];

interface Customer { id: number; name: string; }
interface Payment { payment_method: string; status: string; }
interface OrderItem { id: number; }

interface Order {
    id: number;
    order_number: string;
    status: string;
    order_type: string;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
    created_at: string;
    customer?: Customer;
    payment?: Payment;
    items: OrderItem[];
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    orders: PaginatedOrders;
    filters: { search?: string; status?: string; type?: string; date_from?: string; date_to?: string };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    preparing: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    ready: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    served: 'bg-green-500/10 text-green-600 border-green-500/30',
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/30',
};

const typeLabels: Record<string, string> = {
    dine_in: 'Dine In',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
};

export default function OrderIndex({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [type, setType] = useState(filters.type ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/pos/orders', params, { preserveState: true, preserveScroll: true, replace: true });
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (status !== 'all') params.status = status;
            if (type !== 'all') params.type = type;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, status, type, dateFrom, dateTo]);

    const clearFilters = () => {
        setSearch(''); setStatus('all'); setType('all'); setDateFrom(''); setDateTo('');
    };
    const hasFilters = search || status !== 'all' || type !== 'all' || dateFrom || dateTo;

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order History" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
                        <p className="text-muted-foreground">View and manage all restaurant orders.</p>
                    </div>
                    <Button asChild>
                        <Link href="/pos">New Order</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>
                                {orders.total} Order{orders.total !== 1 ? 's' : ''}
                                {hasFilters ? ' (filtered)' : ''}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Search */}
                                <div className="relative min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="order-search"
                                        placeholder="Order # or customer..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 pr-9 h-9"
                                    />
                                    {search && (
                                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Status filter */}
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="order-status-filter" className="w-[140px] h-9">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="ready">Ready</SelectItem>
                                        <SelectItem value="served">Served</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Type filter */}
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger id="order-type-filter" className="w-[130px] h-9">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="dine_in">Dine In</SelectItem>
                                        <SelectItem value="takeaway">Takeaway</SelectItem>
                                        <SelectItem value="delivery">Delivery</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Date range */}
                                <Input
                                    id="order-date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-[140px] h-9"
                                    title="From date"
                                />
                                <Input
                                    id="order-date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-[140px] h-9"
                                    title="To date"
                                />

                                {hasFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-9">
                                        <X className="mr-1 h-3 w-3" /> Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-sidebar-border/70 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-sidebar-accent/50 text-sidebar-foreground font-medium border-b border-sidebar-border/70">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Order #</th>
                                        <th className="px-4 py-3 text-left">Customer</th>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-left">Items</th>
                                        <th className="px-4 py-3 text-left">Total</th>
                                        <th className="px-4 py-3 text-left">Payment</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {orders.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                                                {hasFilters ? 'No orders match your filters.' : 'No orders yet.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                <td className="px-4 py-3 font-mono font-medium text-xs">{order.order_number}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{order.customer?.name ?? 'Walk-in'}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="capitalize text-xs">
                                                        {typeLabels[order.order_type] ?? order.order_type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                                                <td className="px-4 py-3 font-semibold">${Number(order.total).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-muted-foreground capitalize">{order.payment?.payment_method ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className={`capitalize text-xs ${statusColors[order.status] ?? ''}`}>
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{formatDate(order.created_at)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/pos/orders/${order.id}`}><Eye className="h-4 w-4" /></Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {orders.from}–{orders.to} of {orders.total}
                                </p>
                                <div className="flex items-center gap-1">
                                    {orders.links.map((link, i) => {
                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Button key={i} variant="outline" size="icon" className="h-8 w-8" disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        if (link.label === 'Next &raquo;') {
                                            return (
                                                <Button key={i} variant="outline" size="icon" className="h-8 w-8" disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" className="h-8 min-w-8"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}>
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
