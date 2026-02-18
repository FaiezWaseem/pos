import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Restaurant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X } from 'lucide-react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Restaurants', href: '/super-admin/restaurants' },
];

interface Props {
    restaurants: Restaurant[];
    filters: { search?: string; status?: string };
}

export default function RestaurantIndex({ restaurants, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/super-admin/restaurants', params, {
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
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, status]);

    const clearFilters = () => { setSearch(''); setStatus('all'); };
    const hasFilters = search || status !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurants Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Restaurants</h1>
                    <Button asChild>
                        <Link href="/super-admin/restaurants/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Restaurant
                        </Link>
                    </Button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="restaurant-search"
                            placeholder="Search by name, company, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="restaurant-status-filter" className="w-[160px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                            <X className="mr-1 h-3 w-3" /> Clear
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-sidebar-accent/50 text-sidebar-foreground font-medium border-b border-sidebar-border/70">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Company</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {restaurants.length > 0 ? (
                                    restaurants.map((restaurant) => (
                                        <tr key={restaurant.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{restaurant.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{restaurant.company?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{restaurant.address || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                                                    {restaurant.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/super-admin/restaurants/${restaurant.id}/edit`}>Edit</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            {hasFilters ? 'No restaurants match your search criteria.' : 'No restaurants found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {hasFilters && (
                    <p className="text-xs text-muted-foreground">
                        {restaurants.length} result{restaurants.length !== 1 ? 's' : ''} found
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
