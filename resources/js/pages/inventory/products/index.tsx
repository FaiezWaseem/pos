import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Product, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
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
        title: 'Products',
        href: '/inventory/products',
    },
];

interface Props {
    products: Product[];
    restaurants: Restaurant[];
    filters: {
        restaurant_id?: string;
    };
}

export default function ProductIndex({ products, restaurants, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const handleRestaurantFilter = (value: string) => {
        router.get('/inventory/products', { restaurant_id: value === 'all' ? '' : value }, { preserveState: true });
    };

    const deleteProduct = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/inventory/products/${id}`);
        }
    };

    const formatCurrency = (amount: number, restaurant?: Restaurant) => {
        const symbol = restaurant?.currency_symbol || '$';
        return `${symbol}${Number(amount).toFixed(2)}`;
    };

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
                        <div className="flex items-center justify-between">
                            <CardTitle>All Products</CardTitle>
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
                                                            <img 
                                                                src={`/storage/${product.image}`} 
                                                                alt={product.name} 
                                                                className="h-10 w-10 rounded-md object-cover border border-sidebar-border/50" 
                                                            />
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
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {product.category?.name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {formatCurrency(product.price, product.restaurant)}
                                                </td>
                                                {isSuperAdmin && (
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {product.restaurant?.name || 'N/A'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={product.is_available ? 'default' : 'secondary'}>
                                                        {product.is_available ? 'Available' : 'Unavailable'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild title="Edit">
                                                            <Link href={`/inventory/products/${product.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => deleteProduct(product.id)}
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
                                                No products found.
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
