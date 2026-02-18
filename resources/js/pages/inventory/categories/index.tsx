import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Category, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/inventory/categories' },
    { title: 'Categories', href: '/inventory/categories' },
];

interface Props {
    categories: Category[];
    restaurants: Restaurant[];
    filters: { restaurant_id?: string; search?: string; status?: string };
}

export default function CategoryIndex({ categories, restaurants, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [restaurantId, setRestaurantId] = useState(filters.restaurant_id ?? 'all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/inventory/categories', params, {
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

    const deleteCategory = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/inventory/categories/${id}`);
        }
    };

    const clearFilters = () => { setSearch(''); setStatus('all'); setRestaurantId('all'); };
    const hasFilters = search || status !== 'all' || restaurantId !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                        <p className="text-muted-foreground">Manage your product categories.</p>
                    </div>
                    <Button asChild>
                        <Link href="/inventory/categories/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>All Categories</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="category-search"
                                        placeholder="Search categories..."
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
                                    <SelectTrigger id="category-status-filter" className="w-[140px] h-9">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isSuperAdmin && (
                                    <Select value={restaurantId} onValueChange={setRestaurantId}>
                                        <SelectTrigger id="category-restaurant-filter" className="w-[180px] h-9">
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
                                        <th className="px-4 py-3 text-left">Category</th>
                                        <th className="px-4 py-3 text-left">Description</th>
                                        {isSuperAdmin && <th className="px-4 py-3 text-left">Restaurant</th>}
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                <td className="px-4 py-3 font-medium">{category.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{category.description || '-'}</td>
                                                {isSuperAdmin && <td className="px-4 py-3 text-muted-foreground">{category.restaurant?.name || 'N/A'}</td>}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                        {category.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/inventory/categories/${category.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteCategory(category.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                                                {hasFilters ? 'No categories match your search criteria.' : 'No categories found.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {hasFilters && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                {categories.length} result{categories.length !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
