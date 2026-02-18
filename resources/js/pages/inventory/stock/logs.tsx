import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, Package } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/inventory/products' },
    { title: 'Stock', href: '/inventory/stock' },
    { title: 'Stock History', href: '#' },
];

interface User { name: string; }
interface Order { order_number: string; }

interface StockLog {
    id: number;
    quantity_before: number;
    quantity_change: number;
    quantity_after: number;
    type: string;
    note?: string;
    created_at: string;
    user?: User;
    order?: Order;
}

interface Category { name: string; }
interface Restaurant { name: string; }

interface Product {
    id: number;
    name: string;
    quantity: number | null;
    stock_alert: number;
    category?: Category;
    restaurant?: Restaurant;
}

interface PaginatedLogs {
    data: StockLog[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props { product: Product; logs: PaginatedLogs; }

const typeConfig: Record<string, { label: string; cls: string }> = {
    sale: { label: 'Sale', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    restock: { label: 'Restock', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    adjustment: { label: 'Adjustment', cls: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
    initial: { label: 'Initial', cls: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function StockLogs({ product, logs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Stock History — ${product.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inventory/stock"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
                        <p className="text-muted-foreground text-sm">
                            {product.category?.name} {product.restaurant ? `· ${product.restaurant.name}` : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Current Stock</p>
                        <p className="text-3xl font-bold">{product.quantity ?? 0}</p>
                        {(product.quantity ?? 0) <= product.stock_alert && (
                            <p className="text-xs text-yellow-600">⚠ Low stock alert at {product.stock_alert}</p>
                        )}
                    </div>
                </div>

                {/* Log table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Stock History
                            <span className="text-muted-foreground font-normal text-sm ml-1">({logs.total} entries)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-sidebar-border/70 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-sidebar-accent/50 font-medium border-b border-sidebar-border/70">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-center">Before</th>
                                        <th className="px-4 py-3 text-center">Change</th>
                                        <th className="px-4 py-3 text-center">After</th>
                                        <th className="px-4 py-3 text-left">Note / Reference</th>
                                        <th className="px-4 py-3 text-left">By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                                No stock history yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map(log => {
                                            const isPositive = log.quantity_change > 0;
                                            const cfg = typeConfig[log.type] ?? { label: log.type, cls: '' };
                                            return (
                                                <tr key={log.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                                        {formatDate(log.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={`text-xs ${cfg.cls}`}>{cfg.label}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-muted-foreground">{log.quantity_before}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`flex items-center justify-center gap-1 font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {isPositive
                                                                ? <TrendingUp className="h-3.5 w-3.5" />
                                                                : <TrendingDown className="h-3.5 w-3.5" />
                                                            }
                                                            {isPositive ? '+' : ''}{log.quantity_change}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-semibold">{log.quantity_after}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {log.order && (
                                                            <Link href={`/pos/orders/${log.order.order_number}`}
                                                                className="text-primary hover:underline text-xs font-mono">
                                                                {log.order.order_number}
                                                            </Link>
                                                        )}
                                                        {log.note && <span className="text-xs">{log.note}</span>}
                                                        {!log.order && !log.note && <span className="text-xs">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-xs">{log.user?.name ?? 'System'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {logs.last_page > 1 && (
                            <p className="text-sm text-muted-foreground mt-3 text-center">
                                Showing {logs.from}–{logs.to} of {logs.total}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
