import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Category, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Layers, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
        title: 'Inventory',
        href: '/inventory/categories',
    },
    {
        title: 'Categories',
        href: '/inventory/categories',
    },
];

interface Props {
    categories: Category[];
    restaurants: Restaurant[];
    filters: {
        restaurant_id?: string;
    };
}

export default function CategoryIndex({ categories, restaurants, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const handleRestaurantFilter = (value: string) => {
        router.get('/inventory/categories', { restaurant_id: value === 'all' ? '' : value }, { preserveState: true });
    };

    const deleteCategory = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/inventory/categories/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Categories" />
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
                        <div className="flex items-center justify-between">
                            <CardTitle>All Categories</CardTitle>
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
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {category.image ? (
                                                            <img 
                                                                src={`/storage/${category.image}`} 
                                                                alt={category.name} 
                                                                className="h-10 w-10 rounded-md object-cover border border-sidebar-border/50" 
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-sidebar-accent flex items-center justify-center border border-sidebar-border/50">
                                                                <Layers className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium">{category.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                                                    {category.description || '-'}
                                                </td>
                                                {isSuperAdmin && (
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {category.restaurant?.name || 'N/A'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                        {category.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild title="Edit">
                                                            <Link href={`/inventory/categories/${category.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => deleteCategory(category.id)}
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
                                            <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                                                No categories found.
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
