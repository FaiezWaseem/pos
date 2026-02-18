import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Restaurant, Role, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        title: 'Staff',
        href: '/staff/employees',
    },
    {
        title: 'Employees',
        href: '/staff/employees',
    },
    {
        title: 'Create',
        href: '/staff/employees/create',
    },
];

interface Props {
    restaurants: Restaurant[];
    roles: Role[];
}

export default function EmployeeCreate({ restaurants, roles }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const { data, setData, post, processing, errors } = useForm({
        restaurant_id: '',
        name: '',
        email: '',
        password: '',
        role_id: '',
        employee_id: '',
        designation: '',
        phone: '',
        salary: '',
        joining_date: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/staff/employees');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-3xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Employee</CardTitle>
                            <CardDescription>
                                Create a staff account and employee record.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-medium border-b pb-2">Account Information</h3>
                                        
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
                                            <Label htmlFor="role">System Role</Label>
                                            <Select onValueChange={(value) => setData('role_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id.toString()}>
                                                            {role.label || role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.role_id && <p className="text-sm text-destructive">{errors.role_id}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-medium border-b pb-2">Employee Details</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_id">Employee ID / Code</Label>
                                            <Input
                                                id="employee_id"
                                                value={data.employee_id}
                                                onChange={(e) => setData('employee_id', e.target.value)}
                                                placeholder="EMP-001"
                                                required
                                            />
                                            {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="designation">Designation</Label>
                                            <Input
                                                id="designation"
                                                value={data.designation}
                                                onChange={(e) => setData('designation', e.target.value)}
                                                placeholder="e.g. Senior Waiter"
                                                required
                                            />
                                            {errors.designation && <p className="text-sm text-destructive">{errors.designation}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="+1 234 567 890"
                                            />
                                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="salary">Monthly Salary</Label>
                                            <Input
                                                id="salary"
                                                type="number"
                                                step="0.01"
                                                value={data.salary}
                                                onChange={(e) => setData('salary', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            {errors.salary && <p className="text-sm text-destructive">{errors.salary}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="joining_date">Joining Date</Label>
                                            <Input
                                                id="joining_date"
                                                type="date"
                                                value={data.joining_date}
                                                onChange={(e) => setData('joining_date', e.target.value)}
                                            />
                                            {errors.joining_date && <p className="text-sm text-destructive">{errors.joining_date}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-4 border-t">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Employee is currently active</Label>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/staff/employees">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create Employee
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
