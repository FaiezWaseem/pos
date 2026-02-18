import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Replaced Table import with standard HTML table structure due to missing component
import { Search, Plus, User, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    loyalty_points: number;
    created_at: string;
}

export default function CustomerIndex({ customers, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: any) => {
        const value = e.target.value;
        setSearch(value);
        router.get('/pos/customers', { search: value }, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(`/pos/customers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'POS', href: '/pos' }, { title: 'Customers', href: '/pos/customers' }]}>
            <Head title="Customers" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <Link href="/pos/customers/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers by name, email or phone..."
                        value={search}
                        onChange={handleSearch}
                        className="max-w-sm"
                    />
                </div>

                <div className="border rounded-md bg-white overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Loyalty Points</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center h-24 text-muted-foreground">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                customers.data.map((customer: Customer) => (
                                    <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 font-medium">
                                            <Link href={`/pos/customers/${customer.id}`} className="hover:underline text-primary">
                                                {customer.name}
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col text-sm">
                                                <span>{customer.email}</span>
                                                <span className="text-muted-foreground">{customer.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-orange-600">{customer.loyalty_points} pts</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/pos/customers/${customer.id}/edit`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
