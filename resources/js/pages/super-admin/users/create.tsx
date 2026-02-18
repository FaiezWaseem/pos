import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Role, Company, Restaurant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/super-admin/users',
    },
    {
        title: 'Create',
        href: '/super-admin/users/create',
    },
];

interface Props {
    roles: Role[];
    companies: Company[];
    restaurants: Restaurant[];
}

export default function UserCreate({ roles, companies, restaurants }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        company_id: '',
        restaurant_ids: [] as string[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/super-admin/users');
    };

    const toggleRestaurant = (id: string) => {
        const current = [...data.restaurant_ids];
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
        setData('restaurant_ids', current);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New User</CardTitle>
                            <CardDescription>
                                Add a new user to the system and assign a role.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        required
                                    />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select onValueChange={(value) => setData('role_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role_id && <p className="text-sm text-destructive">{errors.role_id}</p>}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company (Optional)</Label>
                                        <Select onValueChange={(value) => {
                                            setData('company_id', value === 'none' ? '' : value);
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a company" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (System Admin)</SelectItem>
                                                {companies.map((company) => (
                                                    <SelectItem key={company.id} value={company.id.toString()}>
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.company_id && <p className="text-sm text-destructive">{errors.company_id}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Restaurants (Optional)</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-4 max-h-60 overflow-y-auto">
                                            {restaurants
                                                .filter(r => !data.company_id || r.company_id.toString() === data.company_id)
                                                .map((restaurant) => (
                                                    <div key={restaurant.id} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`restaurant-${restaurant.id}`} 
                                                            checked={data.restaurant_ids.includes(restaurant.id.toString())}
                                                            onCheckedChange={() => toggleRestaurant(restaurant.id.toString())}
                                                        />
                                                        <label 
                                                            htmlFor={`restaurant-${restaurant.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {restaurant.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            {restaurants.filter(r => !data.company_id || r.company_id.toString() === data.company_id).length === 0 && (
                                                <p className="text-sm text-muted-foreground col-span-2 text-center py-2">
                                                    No restaurants found for this company.
                                                </p>
                                            )}
                                        </div>
                                        {errors.restaurant_ids && <p className="text-sm text-destructive">{errors['restaurant_ids'] as string}</p>}
                                        <p className="text-xs text-muted-foreground">
                                            The first selected restaurant will be set as the primary restaurant.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/super-admin/users">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create User
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
