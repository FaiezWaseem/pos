import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, LayoutGrid, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Restaurant',
        href: '/restaurant/tables',
    },
    {
        title: 'Tables',
        href: '/restaurant/tables',
    },
];

interface Table {
    id: number;
    restaurant_id: number;
    area_id: number;
    table_number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    restaurant?: {
        name: string;
    };
    area?: {
        name: string;
    };
}

interface Props {
    tables: Table[];
}

const statusColors = {
    available: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    occupied: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    reserved: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    maintenance: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
};

export default function TableIndex({ tables }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const deleteTable = (id: number) => {
        if (confirm('Are you sure you want to delete this table?')) {
            router.delete(`/restaurant/tables/${id}`);
        }
    };

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
                        <CardTitle>All Tables</CardTitle>
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
                                                No tables found.
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
                                                {isSuperAdmin && (
                                                    <td className="px-4 py-3">
                                                        {table.restaurant?.name || 'Unknown'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/restaurant/tables/${table.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => deleteTable(table.id)}
                                                        >
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
