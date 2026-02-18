import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        href: '/restaurant/tables',
    },
    {
        title: 'Tables',
        href: '/restaurant/tables',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface Table {
    id: number;
    restaurant_id: number;
    area_id: number;
    table_number: string;
    capacity: number;
    status: string;
}

interface Area {
    id: number;
    name: string;
    restaurant_id: number;
}

interface Props {
    table: Table;
    restaurants: Restaurant[];
    areas: Area[];
}

export default function TableEdit({ table, restaurants, areas }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const { data, setData, put, processing, errors } = useForm({
        restaurant_id: table.restaurant_id.toString(),
        area_id: table.area_id.toString(),
        table_number: table.table_number,
        capacity: table.capacity.toString(),
        status: table.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/restaurant/tables/${table.id}`);
    };

    const filteredAreas = isSuperAdmin && data.restaurant_id
        ? areas.filter(area => area.restaurant_id.toString() === data.restaurant_id)
        : areas;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Table" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Edit Table</h2>
                        <p className="text-muted-foreground">Update table details.</p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Table Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_id">Restaurant</Label>
                                    <Select 
                                        value={data.restaurant_id} 
                                        onValueChange={(value) => {
                                            setData('restaurant_id', value);
                                            setData('area_id', '');
                                        }}
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
                                <Label htmlFor="area_id">Area</Label>
                                <Select 
                                    value={data.area_id} 
                                    onValueChange={(value) => setData('area_id', value)}
                                    disabled={isSuperAdmin && !data.restaurant_id}
                                >
                                    <SelectTrigger className={errors.area_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={isSuperAdmin && !data.restaurant_id ? "Select restaurant first" : "Select an area"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredAreas.map((area) => (
                                            <SelectItem key={area.id} value={area.id.toString()}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.area_id && <p className="text-sm text-destructive">{errors.area_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="table_number">Table Number / Name</Label>
                                    <Input
                                        id="table_number"
                                        value={data.table_number}
                                        onChange={(e) => setData('table_number', e.target.value)}
                                        placeholder="e.g. T-1, Window 4"
                                        className={errors.table_number ? 'border-destructive' : ''}
                                    />
                                    {errors.table_number && <p className="text-sm text-destructive">{errors.table_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity (Seats)</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', e.target.value)}
                                        className={errors.capacity ? 'border-destructive' : ''}
                                    />
                                    {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={data.status} 
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="reserved">Reserved</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" asChild>
                                    <Link href="/restaurant/tables">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Update Table
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
