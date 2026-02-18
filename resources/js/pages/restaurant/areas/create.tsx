import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Restaurant',
        href: '/restaurant/areas',
    },
    {
        title: 'Areas',
        href: '/restaurant/areas',
    },
    {
        title: 'Create',
        href: '/restaurant/areas/create',
    },
];

interface Props {
    restaurants: Restaurant[];
}

export default function AreaCreate({ restaurants }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const { data, setData, post, processing, errors } = useForm({
        restaurant_id: '',
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/restaurant/areas');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Area" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Area</h2>
                        <p className="text-muted-foreground">Add a new floor area to your restaurant.</p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Area Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_id">Restaurant</Label>
                                    <Select 
                                        value={data.restaurant_id} 
                                        onValueChange={(value) => setData('restaurant_id', value)}
                                    >
                                        <SelectTrigger className={errors.restaurant_id ? 'border-destructive' : ''}>
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
                                <Label htmlFor="name">Area Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Ground Floor, Rooftop, VIP Lounge"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of the area"
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" asChild>
                                    <Link href="/restaurant/areas">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Area
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
