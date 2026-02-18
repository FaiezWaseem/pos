import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Restaurants',
        href: '/super-admin/restaurants',
    },
    {
        title: 'Create',
        href: '/super-admin/restaurants/create',
    },
];

interface Props {
    companies: Company[];
}

export default function RestaurantCreate({ companies }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        company_id: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        currency_symbol: '$',
        tax_rate: '0',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/super-admin/restaurants');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Restaurant" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Restaurant</CardTitle>
                            <CardDescription>
                                Create a new restaurant branch and assign it to a company.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Select onValueChange={(value) => setData('company_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map((company) => (
                                                <SelectItem key={company.id} value={company.id.toString()}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.company_id && <p className="text-sm text-destructive">{errors.company_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Restaurant Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Downtown Bistro"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="branch@example.com"
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+1 234 567 890"
                                        />
                                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="123 Main St, City"
                                    />
                                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency Symbol</Label>
                                        <Input
                                            id="currency"
                                            value={data.currency_symbol}
                                            onChange={(e) => setData('currency_symbol', e.target.value)}
                                            placeholder="$"
                                            required
                                        />
                                        {errors.currency_symbol && <p className="text-sm text-destructive">{errors.currency_symbol}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax">Tax Rate (%)</Label>
                                        <Input
                                            id="tax"
                                            type="number"
                                            step="0.01"
                                            value={data.tax_rate}
                                            onChange={(e) => setData('tax_rate', e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.tax_rate && <p className="text-sm text-destructive">{errors.tax_rate}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="active">Active Status</Label>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/super-admin/restaurants">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create Restaurant
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
