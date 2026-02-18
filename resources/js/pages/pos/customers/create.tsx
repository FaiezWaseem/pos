import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function CreateCustomer() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pos/customers');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'POS', href: '/pos' }, { title: 'Customers', href: '/pos/customers' }, { title: 'Create', href: '#' }]}>
            <Head title="Create Customer" />
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Customer</CardTitle>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" value={data.address} onChange={e => setData('address', e.target.value)} />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Link href="/pos/customers">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>Save Customer</Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
