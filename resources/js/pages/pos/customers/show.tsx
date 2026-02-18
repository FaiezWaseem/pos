import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';

export default function ShowCustomer({ customer }: any) {
    return (
        <AppLayout breadcrumbs={[{ title: 'POS', href: '/pos' }, { title: 'Customers', href: '/pos/customers' }, { title: customer.name, href: '#' }]}>
            <Head title={customer.name} />
            <div className="p-4 grid gap-6 md:grid-cols-2">
                {/* Profile */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Profile</CardTitle>
                        <Link href={`/pos/customers/${customer.id}/edit`}>
                            <Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">Name</span>
                            <span>{customer.name}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">Email</span>
                            <span>{customer.email || '-'}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">Phone</span>
                            <span>{customer.phone || '-'}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">Address</span>
                            <span>{customer.address || '-'}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">Loyalty Points</span>
                            <span className="text-2xl font-bold text-orange-600">{customer.loyalty_points}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {customer.orders && customer.orders.length > 0 ? (
                            <div className="space-y-4">
                                {customer.orders.map((order: any) => (
                                    <div key={order.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <div className="font-medium">Order #{order.order_number}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">${Number(order.total).toFixed(2)}</div>
                                            <Badge variant="outline" className="mt-1">{order.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No recent orders.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Loyalty History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Loyalty Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {customer.loyalty_transactions && customer.loyalty_transactions.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-2 font-medium text-muted-foreground">Date</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Type</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Description</th>
                                        <th className="pb-2 text-right font-medium text-muted-foreground">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.loyalty_transactions.map((tx: any) => (
                                        <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-2">{new Date(tx.created_at).toLocaleDateString()}</td>
                                            <td className="py-2">
                                                <Badge variant={tx.type === 'earned' ? 'secondary' : 'destructive'} className={tx.type === 'earned' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                                                    {tx.type}
                                                </Badge>
                                            </td>
                                            <td className="py-2">{tx.description}</td>
                                            <td className={`py-2 text-right font-medium ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.points > 0 ? '+' : ''}{tx.points}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-muted-foreground text-sm">No loyalty history.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
