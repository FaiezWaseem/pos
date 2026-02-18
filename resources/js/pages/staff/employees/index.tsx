import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Employee, Restaurant, SharedData } from '@/types';
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
    { title: 'Staff', href: '/staff/employees' },
    { title: 'Employees', href: '/staff/employees' },
];

interface Props {
    employees: Employee[];
    restaurants: Restaurant[];
    filters: { restaurant_id?: string; search?: string; status?: string };
}

export default function EmployeeIndex({ employees, restaurants, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [restaurantId, setRestaurantId] = useState(filters.restaurant_id ?? 'all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/staff/employees', params, {
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

    const deleteEmployee = (id: number) => {
        if (confirm('Are you sure you want to delete this employee? This will also delete their user account.')) {
            router.delete(`/staff/employees/${id}`);
        }
    };

    const clearFilters = () => { setSearch(''); setStatus('all'); setRestaurantId('all'); };
    const hasFilters = search || status !== 'all' || restaurantId !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
                        <p className="text-muted-foreground">Manage your restaurant staff and permissions.</p>
                    </div>
                    <Button asChild>
                        <Link href="/staff/employees/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Employee
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>All Employees</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="employee-search"
                                        placeholder="Search employees..."
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
                                    <SelectTrigger id="employee-status-filter" className="w-[140px] h-9">
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
                                        <SelectTrigger id="employee-restaurant-filter" className="w-[180px] h-9">
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
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-left">Designation</th>
                                        <th className="px-4 py-3 text-left">Role</th>
                                        {isSuperAdmin && <th className="px-4 py-3 text-left">Restaurant</th>}
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {employees.length > 0 ? (
                                        employees.map((employee) => (
                                            <tr key={employee.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{employee.user?.name}</span>
                                                        <span className="text-xs text-muted-foreground">{employee.employee_id} • {employee.user?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{employee.designation}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="capitalize">
                                                        {employee.user?.role?.label || employee.user?.role?.name}
                                                    </Badge>
                                                </td>
                                                {isSuperAdmin && <td className="px-4 py-3 text-muted-foreground">{employee.restaurant?.name || 'N/A'}</td>}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                                                        {employee.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/staff/employees/${employee.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteEmployee(employee.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                                                {hasFilters ? 'No employees match your search criteria.' : 'No employees found.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {hasFilters && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                {employees.length} result{employees.length !== 1 ? 's' : ''} found
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
