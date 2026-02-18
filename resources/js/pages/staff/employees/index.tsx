import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Employee, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff',
        href: '/staff/employees',
    },
    {
        title: 'Employees',
        href: '/staff/employees',
    },
];

interface Props {
    employees: Employee[];
    restaurants: Restaurant[];
    filters: {
        restaurant_id?: string;
    };
}

export default function EmployeeIndex({ employees, restaurants, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const handleRestaurantFilter = (value: string) => {
        router.get('/staff/employees', { restaurant_id: value === 'all' ? '' : value }, { preserveState: true });
    };

    const deleteEmployee = (id: number) => {
        if (confirm('Are you sure you want to delete this employee? This will also delete their user account.')) {
            router.delete(`/staff/employees/${id}`);
        }
    };

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
                        <div className="flex items-center justify-between">
                            <CardTitle>All Employees</CardTitle>
                            {isSuperAdmin && (
                                <div className="flex items-center gap-2 w-full max-w-xs">
                                    <Select 
                                        defaultValue={filters.restaurant_id || 'all'} 
                                        onValueChange={handleRestaurantFilter}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by Restaurant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Restaurants</SelectItem>
                                            {restaurants.map((restaurant) => (
                                                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                                    {restaurant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
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
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {employee.designation}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="capitalize">
                                                        {employee.user?.role?.label || employee.user?.role?.name}
                                                    </Badge>
                                                </td>
                                                {isSuperAdmin && (
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {employee.restaurant?.name || 'N/A'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                                                        {employee.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild title="Edit">
                                                            <Link href={`/staff/employees/${employee.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => deleteEmployee(employee.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                                                No employees found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
