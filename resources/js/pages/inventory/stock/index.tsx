import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Search, X, AlertTriangle, CheckCircle2, XCircle,
    PackageMinus, PackagePlus, History, Warehouse,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/inventory/products' },
    { title: 'Stock Management', href: '/inventory/stock' },
];

interface Category { name: string; }
interface Restaurant { id: number; name: string; }

interface Product {
    id: number;
    name: string;
    quantity: number | null;
    stock_alert: number;
    track_quantity: boolean;
    is_available: boolean;
    category?: Category;
    restaurant?: Restaurant;
}

interface Summary { total: number; low: number; out: number; ok: number; }

interface Props {
    products: Product[];
    summary: Summary;
    restaurants: Restaurant[];
    filters: { search?: string; stock_status?: string; restaurant_id?: string };
}

type StockStatus = 'ok' | 'low' | 'out';

function getStockStatus(p: Product): StockStatus {
    if (p.quantity === null || p.quantity === undefined) return 'ok';
    if (p.quantity <= 0) return 'out';
    if (p.quantity <= p.stock_alert) return 'low';
    return 'ok';
}

const statusConfig = {
    ok: { label: 'In Stock', icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' },
    low: { label: 'Low Stock', icon: AlertTriangle, cls: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30' },
    out: { label: 'Out of Stock', icon: XCircle, cls: 'text-red-600 bg-red-500/10 border-red-500/30' },
};

interface AdjustForm {
    quantity_change: string;
    note: string;
    type: 'adjustment' | 'restock';
}

export default function StockIndex({ products, summary, restaurants, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status ?? 'all');
    const [restaurantId, setRestaurantId] = useState(filters.restaurant_id ?? 'all');
    const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm<AdjustForm>({
        quantity_change: '',
        note: '',
        type: 'adjustment',
    });

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/inventory/stock', params, { preserveState: true, preserveScroll: true, replace: true });
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (stockStatus !== 'all') params.stock_status = stockStatus;
            if (restaurantId !== 'all') params.restaurant_id = restaurantId;
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, stockStatus, restaurantId]);

    const clearFilters = () => { setSearch(''); setStockStatus('all'); setRestaurantId('all'); };
    const hasFilters = search || stockStatus !== 'all' || restaurantId !== 'all';

    const openAdjust = (product: Product) => {
        setAdjustProduct(product);
        reset();
    };

    const submitAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustProduct) return;
        post(`/inventory/stock/${adjustProduct.id}/adjust`, {
            onSuccess: () => { setAdjustProduct(null); reset(); },
        });
    };

    const summaryCards = [
        { label: 'Tracked Products', value: summary.total, icon: Warehouse, color: 'from-indigo-500 to-indigo-600' },
        { label: 'In Stock', value: summary.ok, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Low Stock', value: summary.low, icon: AlertTriangle, color: 'from-yellow-500 to-yellow-600' },
        { label: 'Out of Stock', value: summary.out, icon: XCircle, color: 'from-red-500 to-red-600' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Stock Management</h2>
                        <p className="text-muted-foreground">Monitor and adjust inventory levels.</p>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {summaryCards.map((c) => (
                        <Card key={c.label} className={`bg-gradient-to-br ${c.color} text-white border-0`}>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/80 text-xs">{c.label}</p>
                                        <p className="text-3xl font-bold mt-0.5">{c.value}</p>
                                    </div>
                                    <c.icon className="h-8 w-8 opacity-60" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>{products.length} Product{products.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="stock-search" placeholder="Search products..." value={search}
                                        onChange={e => setSearch(e.target.value)} className="pl-9 pr-9 h-9" />
                                    {search && (
                                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                <Select value={stockStatus} onValueChange={setStockStatus}>
                                    <SelectTrigger id="stock-status-filter" className="w-[140px] h-9">
                                        <SelectValue placeholder="Stock Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="ok">In Stock</SelectItem>
                                        <SelectItem value="low">Low Stock</SelectItem>
                                        <SelectItem value="out">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>

                                {restaurants.length > 0 && (
                                    <Select value={restaurantId} onValueChange={setRestaurantId}>
                                        <SelectTrigger id="stock-restaurant-filter" className="w-[160px] h-9">
                                            <SelectValue placeholder="Restaurant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Restaurants</SelectItem>
                                            {restaurants.map(r => (
                                                <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

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
                                        <th className="px-4 py-3 text-left">Product</th>
                                        <th className="px-4 py-3 text-left">Category</th>
                                        {restaurants.length > 0 && <th className="px-4 py-3 text-left">Restaurant</th>}
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-4 py-3 text-center">Alert At</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                                {hasFilters ? 'No products match your filters.' : 'No tracked products found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map(product => {
                                            const status = getStockStatus(product);
                                            const { label, icon: Icon, cls } = statusConfig[status];
                                            const qty = product.quantity ?? 0;
                                            const pct = Math.min(100, (qty / Math.max(product.stock_alert * 3, 1)) * 100);

                                            return (
                                                <tr key={product.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">{product.name}</p>
                                                        {/* mini stock bar */}
                                                        <div className="mt-1 h-1 w-24 bg-sidebar-accent rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all ${status === 'out' ? 'bg-red-500' :
                                                                    status === 'low' ? 'bg-yellow-500' : 'bg-emerald-500'
                                                                }`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? '—'}</td>
                                                    {restaurants.length > 0 && (
                                                        <td className="px-4 py-3 text-muted-foreground">{product.restaurant?.name ?? '—'}</td>
                                                    )}
                                                    <td className="px-4 py-3 text-center font-bold text-lg">{qty}</td>
                                                    <td className="px-4 py-3 text-center text-muted-foreground">{product.stock_alert}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge variant="outline" className={`text-xs ${cls}`}>
                                                            <Icon className="h-3 w-3 mr-1" />{label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="icon" title="Adjust Stock"
                                                                onClick={() => openAdjust(product)}>
                                                                <PackagePlus className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" title="View History" asChild>
                                                                <Link href={`/inventory/stock/${product.id}/logs`}>
                                                                    <History className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Adjust Stock Dialog */}
            <Dialog open={!!adjustProduct} onOpenChange={open => !open && setAdjustProduct(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Stock — {adjustProduct?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAdjust} className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">Current</p>
                                <p className="text-2xl font-bold">{adjustProduct?.quantity ?? 0}</p>
                            </div>
                            <div className="flex-1 text-center text-muted-foreground">→</div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">After</p>
                                <p className="text-2xl font-bold text-primary">
                                    {Math.max(0, (adjustProduct?.quantity ?? 0) + (parseInt(data.quantity_change) || 0))}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjust-type">Type</Label>
                            <Select value={data.type} onValueChange={v => setData('type', v as AdjustForm['type'])}>
                                <SelectTrigger id="adjust-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restock">
                                        <span className="flex items-center gap-2"><PackagePlus className="h-4 w-4 text-emerald-500" /> Restock (Add)</span>
                                    </SelectItem>
                                    <SelectItem value="adjustment">
                                        <span className="flex items-center gap-2"><PackageMinus className="h-4 w-4 text-orange-500" /> Manual Adjustment</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjust-qty">
                                Quantity Change
                                <span className="text-muted-foreground font-normal ml-1">(use negative to reduce)</span>
                            </Label>
                            <Input id="adjust-qty" type="number" placeholder="e.g. 50 or -5"
                                value={data.quantity_change}
                                onChange={e => setData('quantity_change', e.target.value)} />
                            {errors.quantity_change && <p className="text-xs text-red-500">{errors.quantity_change}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjust-note">Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
                            <Textarea id="adjust-note" placeholder="Reason for adjustment..."
                                value={data.note} onChange={e => setData('note', e.target.value)} rows={2} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAdjustProduct(null)}>Cancel</Button>
                            <Button type="submit" disabled={processing || !data.quantity_change}>
                                {processing ? 'Saving...' : 'Apply Adjustment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
