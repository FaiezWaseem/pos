import { Head, Link } from '@inertiajs/react';
import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';

interface Props {
    order: Order;
}

export default function PosReceipt({ order }: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
            <Head title={`Receipt - ${order.order_number}`} />

            <div className="max-w-md w-full space-y-6">
                <div className="flex flex-col items-center text-center space-y-2 mb-4 no-print">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Order Successful!</h1>
                    <p className="text-muted-foreground">Order #{order.order_number} has been processed.</p>
                </div>

                <Card className="bg-white shadow-lg overflow-hidden border-none print:shadow-none print:border print:m-0">
                    <CardContent className="p-0">
                        {/* Receipt Header */}
                        <div className="p-6 text-center border-b border-dashed">
                            <h2 className="text-xl font-bold uppercase tracking-wider">{order.restaurant?.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">{order.restaurant?.address || 'Restaurant Address'}</p>
                            <p className="text-sm text-gray-500">{order.restaurant?.phone || 'Phone Number'}</p>
                        </div>

                        {/* Receipt Info */}
                        <div className="px-6 py-4 border-b border-dashed text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order #:</span>
                                <span className="font-medium">{order.order_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span>{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Type:</span>
                                <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
                            </div>
                            {order.table && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Table:</span>
                                    <span>{order.table.table_number}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cashier:</span>
                                <span>{order.user?.name}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="p-6">
                            <table className="w-full text-sm">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="py-2 font-semibold">Item</th>
                                        <th className="py-2 font-semibold text-center">Qty</th>
                                        <th className="py-2 font-semibold text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed">
                                    {order.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3">
                                                <div className="font-medium">{item.product?.name}</div>
                                                {item.size && (
                                                    <div className="text-xs text-gray-600">Size: {item.size.name}</div>
                                                )}
                                                {item.addons && item.addons.length > 0 && (
                                                    <div className="text-xs text-gray-600">
                                                        Addons: {item.addons.map((a: { name: string; quantity: number }) => `${a.name} x${a.quantity}`).join(', ')}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500">${item.price} each</div>
                                            </td>
                                            <td className="py-3 text-center">{item.quantity}</td>
                                            <td className="py-3 text-right">${item.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="px-6 py-4 bg-gray-50 space-y-2 border-t border-dashed">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal:</span>
                                <span>${Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            {Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>
                                        Discount
                                        {order.discount?.code && (
                                            <span className="ml-1 font-mono text-xs bg-emerald-100 px-1 rounded">
                                                {order.discount.code}
                                            </span>
                                        )}
                                        :
                                    </span>
                                    <span>-${Number(order.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax:</span>
                                <span>${Number(order.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-dashed pt-2 mt-2">
                                <span>Total:</span>
                                <span>${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 text-center text-xs text-gray-500 space-y-1">
                            <p className="font-medium text-gray-800">Thank you for your visit!</p>
                            <p>Payment via {order.payment?.payment_method.toUpperCase()}</p>
                            <p>Transaction ID: {order.payment?.transaction_id}</p>
                            <p className="mt-4 pt-4 border-t border-dashed">Powered by Multi-POS System</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3 no-print">
                    <Button onClick={handlePrint} className="w-full h-12 text-lg">
                        <Printer className="mr-2 h-5 w-5" /> Print Receipt
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/pos">
                                <ArrowLeft className="mr-2 h-4 w-4" /> New Order
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" /> Save PDF
                        </Button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; padding: 0; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border { border: 1px solid #eee !important; }
                    .print\\:m-0 { margin: 0 !important; }
                }
            `}} />
        </div>
    );
}
