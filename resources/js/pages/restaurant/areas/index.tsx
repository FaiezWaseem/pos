import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Restaurant',
        href: '/restaurant/areas',
    },
    {
        title: 'Areas',
        href: '/restaurant/areas',
    },
];

interface Area {
    id: number;
    restaurant_id: number;
    name: string;
    description: string;
    restaurant?: {
        name: string;
    };
}

interface Props {
    areas: Area[];
}

export default function AreaIndex({ areas }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const deleteArea = (id: number) => {
        if (confirm('Are you sure you want to delete this area? This will also delete all tables in this area.')) {
            router.delete(`/restaurant/areas/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurant Areas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Areas</h2>
                        <p className="text-muted-foreground">Manage your restaurant floor areas.</p>
                    </div>
                    <Button asChild>
                        <Link href="/restaurant/areas/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Area
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>All Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-sidebar-border/70 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-sidebar-accent/50 text-sidebar-foreground font-medium border-b border-sidebar-border/70">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Area Name</th>
                                        <th className="px-4 py-3 text-left">Description</th>
                                        {isSuperAdmin && <th className="px-4 py-3 text-left">Restaurant</th>}
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {areas.length === 0 ? (
                                        <tr>
                                            <td colSpan={isSuperAdmin ? 4 : 3} className="px-4 py-8 text-center text-muted-foreground">
                                                No areas found.
                                            </td>
                                        </tr>
                                    ) : (
                                        areas.map((area) => (
                                            <tr key={area.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{area.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{area.description || '-'}</td>
                                                {isSuperAdmin && (
                                                    <td className="px-4 py-3">
                                                        {area.restaurant?.name || 'Unknown'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/restaurant/areas/${area.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => deleteArea(area.id)}
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
