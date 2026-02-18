import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Order, OrderItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Flame, ChefHat, Bell } from 'lucide-react';

interface Props {
    orders: Order[];
}

function ElapsedTime({ startTime }: { startTime: string }) {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const update = () => {
            const start = new Date(startTime).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);

            if (diff < 60) setElapsed(`${diff}s`);
            else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}m ${diff % 60}s`);
            else setElapsed(`${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    return <span className="font-mono text-lg font-bold">{elapsed}</span>;
}

export default function KdsIndex({ orders }: Props) {
    useEffect(() => {
        // Auto-refresh every 10 seconds
        const interval = setInterval(() => {
            router.reload({ only: ['orders'] });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = (order: Order, status: string) => {
        router.patch(`/kds/${order.id}/status`, { status }, {
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            case 'preparing': return 'bg-orange-100 border-orange-300 text-orange-800';
            case 'ready': return 'bg-green-100 border-green-300 text-green-800';
            default: return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'KDS', href: '/kds' }]}>
            <Head title="Kitchen Display System" />
            <div className="flex flex-col h-full bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ChefHat className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Kitchen Display System</h1>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 bg-white">
                        {orders.length} Active Orders
                    </Badge>
                </div>

                {orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <ChefHat className="h-24 w-24 mb-4" />
                        <h2 className="text-xl font-semibold">No active orders</h2>
                        <p>Kitchen is clear!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                        {orders.map(order => (
                            <Card key={order.id} className={`border-2 flex flex-col ${getStatusColor(order.kitchen_status)}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                #{order.order_number.slice(-4)}
                                                {order.kitchen_status === 'pending' && <Badge variant="secondary" className="bg-yellow-200 text-yellow-900 border-yellow-400">New</Badge>}
                                                {order.kitchen_status === 'preparing' && <Badge variant="secondary" className="bg-orange-200 text-orange-900 border-orange-400 animate-pulse">Cooking</Badge>}
                                                {order.kitchen_status === 'ready' && <Badge variant="secondary" className="bg-green-200 text-green-900 border-green-400">Ready</Badge>}
                                            </CardTitle>
                                            <p className="text-sm font-medium mt-1">
                                                {order.order_type === 'dine_in' ? `Table ${order.table?.table_number ?? '?'}` : order.order_type.toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <ElapsedTime startTime={order.created_at} />
                                            <span className="text-xs opacity-70">
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto max-h-[400px] bg-white/50 p-3 mx-3 rounded-md mb-2">
                                    <ul className="space-y-3">
                                        {order.items?.map((item: any) => (
                                            <li key={item.id} className="border-b border-black/5 pb-2 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-lg">{item.quantity}x</span>
                                                    <div className="flex-1 ml-3">
                                                        <span className="font-bold block">{item.product?.name}</span>
                                                        {item.size && <span className="text-sm text-gray-600 block">Size: {item.size.name}</span>}
                                                        {item.addons && item.addons.length > 0 && (
                                                            <div className="text-sm text-gray-600 mt-1 pl-2 border-l-2 border-gray-300">
                                                                {item.addons.map((addon: any) => (
                                                                    <div key={addon.id}>+ {addon.name} (x{addon.quantity})</div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {item.notes && (
                                                            <div className="text-xs bg-red-100 text-red-700 p-1 mt-1 rounded border border-red-200 italic">
                                                                Note: {item.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    {order.notes && (
                                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                            <strong>Order Note:</strong> {order.notes}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0 flex gap-2">
                                    {order.kitchen_status === 'pending' && (
                                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => updateStatus(order, 'preparing')}>
                                            <Flame className="mr-2 h-4 w-4" /> Start Cooking
                                        </Button>
                                    )}
                                    {order.kitchen_status === 'preparing' && (
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(order, 'ready')}>
                                            <Bell className="mr-2 h-4 w-4" /> Mark Ready
                                        </Button>
                                    )}
                                    {order.kitchen_status === 'ready' && (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => updateStatus(order, 'completed')}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
