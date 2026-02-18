import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Restaurant } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Restaurants',
        href: '/super-admin/restaurants',
    },
];

interface Props {
    restaurants: Restaurant[];
}

export default function RestaurantIndex({ restaurants }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurants Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Restaurants</h1>
                    <Button asChild>
                        <Link href="/super-admin/restaurants/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Restaurant
                        </Link>
                    </Button>
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
                                            <td className="px-4 py-3 font-medium">
                                                <div>
                                                    {restaurant.name}
                                                    <div className="text-xs text-muted-foreground">{restaurant.email}</div>
                                                </div>
                                            </td>
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
                                            No restaurants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
