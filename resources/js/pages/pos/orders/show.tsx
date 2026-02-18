import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Printer, User, MapPin, CreditCard, Clock } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'POS', href: '/pos' },
    { title: 'Order History', href: '/pos/orders' },
    { title: 'Order Detail', href: '#' },
];

interface ProductSize { name: string; }
interface Product { name: string; image?: string; }
interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    total: number;
    notes?: string;
    product?: Product;
    size?: ProductSize;
    addons?: { id: number; name: string; price: number; quantity: number }[];
}
interface Payment { payment_method: string; status: string; amount: number; transaction_id?: string; }
interface Customer { id: number; name: string; email?: string; phone?: string; }
interface Table { table_number: string; area?: { name: string }; }
interface Restaurant { name: string; currency_symbol?: string; }
interface User { name: string; }

interface Order {
    id: number;
    order_number: string;
    status: string;
    order_type: string;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    table?: Table;
    payment?: Payment;
    restaurant?: Restaurant;
    user?: User;
    items: OrderItem[];
}

interface Props { order: Order; }

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    preparing: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    ready: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    served: 'bg-green-500/10 text-green-600 border-green-500/30',
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/30',
};

const typeLabels: Record<string, string> = {
    dine_in: 'Dine In', takeaway: 'Takeaway', delivery: 'Delivery',
};

const statusFlow = ['pending', 'preparing', 'ready', 'served', 'paid'];

export default function OrderShow({ order }: Props) {
    const [status, setStatus] = useState(order.status);
    const [updating, setUpdating] = useState(false);
    const currency = order.restaurant?.currency_symbol ?? '$';

    const handleStatusUpdate = (newStatus: string) => {
        setStatus(newStatus);
        setUpdating(true);
        router.patch(`/pos/orders/${order.id}/status`, { status: newStatus }, {
            preserveScroll: true,
            onFinish: () => setUpdating(false),
        });
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-5xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/pos/orders"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{order.order_number}</h2>
                            <p className="text-muted-foreground text-sm">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/pos/receipt/${order.id}`} target="_blank">
                                <Printer className="mr-2 h-4 w-4" /> Print Receipt
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Left — Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-start justify-between gap-4 py-3 border-b border-sidebar-border/50 last:border-0">
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {item.product?.name}
                                                    {item.size && <span className="text-muted-foreground font-normal"> ({item.size.name})</span>}
                                                </p>
                                                {item.addons && item.addons.length > 0 && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        + {item.addons.map(a => `${a.name} x${a.quantity}`).join(', ')}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-xs text-muted-foreground italic mt-0.5">Note: {item.notes}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm text-muted-foreground">{item.quantity} × {currency}{Number(item.price).toFixed(2)}</p>
                                                <p className="font-semibold">{currency}{Number(item.total).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>{currency}{Number(order.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Tax</span>
                                        <span>{currency}{Number(order.tax).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-sidebar-border/50">
                                        <span>Total</span>
                                        <span className="text-primary">{currency}{Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Notes */}
                        {order.notes && (
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right — Info */}
                    <div className="space-y-4">

                        {/* Status Card */}
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Badge variant="outline" className={`capitalize text-sm px-3 py-1 ${statusColors[status] ?? ''}`}>
                                    {status}
                                </Badge>

                                {/* Status progress */}
                                <div className="flex items-center gap-1">
                                    {statusFlow.map((s, i) => (
                                        <div key={s} className="flex items-center gap-1 flex-1">
                                            <div className={`h-2 flex-1 rounded-full transition-colors ${statusFlow.indexOf(status) >= i ? 'bg-primary' : 'bg-sidebar-accent'
                                                }`} />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {statusFlow.map(s => s).join(' → ')}
                                </p>

                                {order.status !== 'paid' && order.status !== 'cancelled' && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Update Status</p>
                                        <Select value={status} onValueChange={handleStatusUpdate} disabled={updating}>
                                            <SelectTrigger id="order-status-update" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="preparing">Preparing</SelectItem>
                                                <SelectItem value="ready">Ready</SelectItem>
                                                <SelectItem value="served">Served</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Info */}
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Details</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground capitalize">{typeLabels[order.order_type] ?? order.order_type}</p>
                                        <p className="text-xs">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>

                                {order.customer && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="font-medium text-foreground">{order.customer.name}</p>
                                            {order.customer.phone && <p className="text-xs">{order.customer.phone}</p>}
                                        </div>
                                    </div>
                                )}

                                {order.table && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="font-medium text-foreground">Table {order.table.table_number}</p>
                                            {order.table.area && <p className="text-xs">{order.table.area.name}</p>}
                                        </div>
                                    </div>
                                )}

                                {order.payment && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="font-medium text-foreground capitalize">{order.payment.payment_method}</p>
                                            <p className="text-xs capitalize">{order.payment.status}</p>
                                        </div>
                                    </div>
                                )}

                                {order.user && (
                                    <div className="pt-2 border-t border-sidebar-border/50 text-xs text-muted-foreground">
                                        Served by: <span className="font-medium text-foreground">{order.user.name}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
