import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Product, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, Search, X } from 'lucide-react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/inventory/categories' },
    { title: 'Products', href: '/inventory/products' },
];

interface Props {
    products: Product[];
    restaurants: Restaurant[];
    filters: { restaurant_id?: string; search?: string; status?: string };
}

export default function ProductIndex({ products, restaurants, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [restaurantId, setRestaurantId] = useState(filters.restaurant_id ?? 'all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/inventory/products', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (status !== 'all') params.status = status;
            if (restaurantId !== 'all') params.restaurant_id = restaurantId;
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, status, restaurantId]);

    const deleteProduct = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/inventory/products/${id}`);
        }
    };

    const formatCurrency = (amount: number, restaurant?: Restaurant) => {
        const symbol = restaurant?.currency_symbol || '$';
        return `${symbol}${Number(amount).toFixed(2)}`;
    };

    const clearFilters = () => { setSearch(''); setStatus('all'); setRestaurantId('all'); };
    const hasFilters = search || status !== 'all' || restaurantId !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                        <p className="text-muted-foreground">Manage your menu items and prices.</p>
                    </div>
                    <Button asChild>
                        <Link href="/inventory/products/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>All Products</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="product-search"
                                        placeholder="Search products..."
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
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="product-status-filter" className="w-[150px] h-9">
                                        <SelectValue placeholder="Availability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="unavailable">Unavailable</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isSuperAdmin && (
                                    <Select value={restaurantId} onValueChange={setRestaurantId}>
                                        <SelectTrigger id="product-restaurant-filter" className="w-[180px] h-9">
                                            <SelectValue placeholder="All Restaurants" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Restaurants</SelectItem>
                                            {restaurants.map((r) => (
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
                                        <th className="px-4 py-3 text-left">Price</th>
                                        {isSuperAdmin && <th className="px-4 py-3 text-left">Restaurant</th>}
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {product.image ? (
                                                            <img src={`/storage/${product.image}`} alt={product.name} className="h-10 w-10 rounded-md object-cover border border-sidebar-border/50" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-sidebar-accent flex items-center justify-center border border-sidebar-border/50">
                                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{product.name}</span>
                                                            {product.has_variations && (
                                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Has Variations</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{product.category?.name || 'N/A'}</td>
                                                <td className="px-4 py-3 font-medium">{formatCurrency(product.price, product.restaurant)}</td>
                                                {isSuperAdmin && <td className="px-4 py-3 text-muted-foreground">{product.restaurant?.name || 'N/A'}</td>}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={product.is_available ? 'default' : 'secondary'}>
                                                        {product.is_available ? 'Available' : 'Unavailable'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/inventory/products/${product.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteProduct(product.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                                                {hasFilters ? 'No products match your search criteria.' : 'No products found.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {hasFilters && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                {products.length} result{products.length !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
