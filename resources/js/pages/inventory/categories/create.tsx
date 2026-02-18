import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventory/categories',
    },
    {
        title: 'Categories',
        href: '/inventory/categories',
    },
    {
        title: 'Create',
        href: '/inventory/categories/create',
    },
];

interface Props {
    restaurants: Restaurant[];
}

export default function CategoryCreate({ restaurants }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const { data, setData, post, processing, errors } = useForm({
        restaurant_id: '',
        name: '',
        description: '',
        image: null as File | null,
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory/categories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Category</CardTitle>
                            <CardDescription>
                                Add a new product category to your menu.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {isSuperAdmin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="restaurant">Restaurant</Label>
                                        <Select onValueChange={(value) => setData('restaurant_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a restaurant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {restaurants.map((restaurant) => (
                                                    <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                                        {restaurant.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.restaurant_id && <p className="text-sm text-destructive">{errors.restaurant_id}</p>}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Beverages, Main Course"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter category description..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Category Image (Optional)</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    />
                                    {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Active and visible on menu</Label>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/inventory/categories">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create Category
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
