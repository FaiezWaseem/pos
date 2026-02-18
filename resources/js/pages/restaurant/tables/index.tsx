import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, LayoutGrid, Users, Search, X } from 'lucide-react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Restaurant', href: '/restaurant/tables' },
    { title: 'Tables', href: '/restaurant/tables' },
];

interface Area {
    id: number;
    name: string;
}

interface Table {
    id: number;
    restaurant_id: number;
    area_id: number;
    table_number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    restaurant?: { name: string };
    area?: { name: string };
}

interface Props {
    tables: Table[];
    areas: Area[];
    filters: { search?: string; status?: string; area_id?: string };
}

const statusColors: Record<string, string> = {
    available: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    occupied: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    reserved: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    maintenance: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
};

export default function TableIndex({ tables, areas, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [areaId, setAreaId] = useState(filters.area_id ?? 'all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/restaurant/tables', params, {
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
            if (areaId !== 'all') params.area_id = areaId;
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, status, areaId]);

    const deleteTable = (id: number) => {
        if (confirm('Are you sure you want to delete this table?')) {
            router.delete(`/restaurant/tables/${id}`);
        }
    };

    const clearFilters = () => { setSearch(''); setStatus('all'); setAreaId('all'); };
    const hasFilters = search || status !== 'all' || areaId !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurant Tables" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Tables</h2>
                        <p className="text-muted-foreground">Manage your restaurant tables and seating.</p>
                    </div>
                    <Button asChild>
                        <Link href="/restaurant/tables/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Table
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>All Tables</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[180px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="table-search"
                                        placeholder="Search by table #..."
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
                                {areas.length > 0 && (
                                    <Select value={areaId} onValueChange={setAreaId}>
                                        <SelectTrigger id="table-area-filter" className="w-[140px] h-9">
                                            <SelectValue placeholder="Area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Areas</SelectItem>
                                            {areas.map((area) => (
                                                <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="table-status-filter" className="w-[140px] h-9">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="reserved">Reserved</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        <th className="px-4 py-3 text-left">Table #</th>
                                        <th className="px-4 py-3 text-left">Area</th>
                                        <th className="px-4 py-3 text-left">Capacity</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        {isSuperAdmin && <th className="px-4 py-3 text-left">Restaurant</th>}
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {tables.length === 0 ? (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                                                {hasFilters ? 'No tables match your search criteria.' : 'No tables found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        tables.map((table) => (
                                            <tr key={table.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{table.table_number}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{table.area?.name || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Users className="h-3 w-3" />
                                                        <span>{table.capacity} Seats</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className={statusColors[table.status]}>
                                                        {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                {isSuperAdmin && <td className="px-4 py-3">{table.restaurant?.name || 'Unknown'}</td>}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/restaurant/tables/${table.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteTable(table.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {hasFilters && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                {tables.length} result{tables.length !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
