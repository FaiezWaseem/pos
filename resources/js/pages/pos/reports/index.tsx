import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ShoppingCart, DollarSign, BarChart2, Clock, Star } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'POS', href: '/pos' },
    { title: 'Reports', href: '/pos/reports' },
];

interface DayRevenue { label: string; revenue: number; orders: number; }
interface Summary { total_orders: number; total_revenue: number; avg_order_value: number; }
interface PaymentMethod { payment_method: string; revenue: number; count: number; }
interface OrderType { order_type: string; revenue: number; count: number; }
interface TopProduct { id: number; name: string; total_qty: number; total_revenue: number; }
interface HourData { hour: number; orders: number; revenue: number; }

interface Props {
    revenueByDay: DayRevenue[];
    summary: Summary;
    byPaymentMethod: PaymentMethod[];
    byOrderType: OrderType[];
    topProducts: TopProduct[];
    byHour: HourData[];
    filters: { period?: string; date_from?: string; date_to?: string };
}

const PERIODS = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom' },
];

const TYPE_LABELS: Record<string, string> = {
    dine_in: 'Dine In', takeaway: 'Takeaway', delivery: 'Delivery',
};

const METHOD_COLORS: Record<string, string> = {
    cash: 'bg-emerald-500',
    card: 'bg-blue-500',
    online: 'bg-purple-500',
};

const TYPE_COLORS: Record<string, string> = {
    dine_in: 'bg-orange-500',
    takeaway: 'bg-cyan-500',
    delivery: 'bg-pink-500',
};

function fmt(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n ?? 0);
}

// ── Tiny bar chart (SVG) ─────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = '#6366f1' }: {
    data: Record<string, number | string>[];
    valueKey: string;
    labelKey: string;
    color?: string;
}) {
    if (!data.length) return <p className="text-center text-muted-foreground py-8 text-sm">No data for this period.</p>;

    const values = data.map(d => Number(d[valueKey]));
    const max = Math.max(...values, 1);
    const W = 600, H = 180, PAD = 40, BAR_GAP = 4;
    const barW = Math.max(4, (W - PAD * 2) / data.length - BAR_GAP);

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ minWidth: 300 }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = PAD + (1 - frac) * (H - PAD);
                    return (
                        <g key={frac}>
                            <line x1={PAD} y1={y} x2={W - 10} y2={y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
                            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.4}>
                                {frac === 1 ? fmt(max) : frac === 0 ? '0' : ''}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {data.map((d, i) => {
                    const val = Number(d[valueKey]);
                    const barH = ((val / max) * (H - PAD)) || 2;
                    const x = PAD + i * ((W - PAD * 2) / data.length) + BAR_GAP / 2;
                    const y = H - barH;
                    return (
                        <g key={i}>
                            <rect x={x} y={y} width={barW} height={barH} fill={color} rx={3} opacity={0.85} />
                            {data.length <= 14 && (
                                <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.5}>
                                    {String(d[labelKey]).slice(-5)}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ── Donut chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ slices, colors }: { slices: { label: string; value: number }[]; colors: string[] }) {
    const total = slices.reduce((s, d) => s + d.value, 0) || 1;
    const R = 60, cx = 80, cy = 80;
    let cumAngle = -Math.PI / 2;

    const paths = slices.map((s, i) => {
        const angle = (s.value / total) * 2 * Math.PI;
        const x1 = cx + R * Math.cos(cumAngle);
        const y1 = cy + R * Math.sin(cumAngle);
        cumAngle += angle;
        const x2 = cx + R * Math.cos(cumAngle);
        const y2 = cy + R * Math.sin(cumAngle);
        const large = angle > Math.PI ? 1 : 0;
        return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`, color: colors[i % colors.length] };
    });

    if (!slices.length) return <p className="text-center text-muted-foreground py-8 text-sm">No data.</p>;

    return (
        <div className="flex items-center gap-4 flex-wrap">
            <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0">
                {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity={0.85} />)}
                <circle cx={cx} cy={cy} r={36} fill="var(--card)" />
            </svg>
            <div className="space-y-1.5 flex-1 min-w-0">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                        <span className="text-muted-foreground truncate">{s.label}</span>
                        <span className="ml-auto font-medium">{((s.value / total) * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ReportsIndex({ revenueByDay, summary, byPaymentMethod, byOrderType, topProducts, byHour, filters }: Props) {
    const [period, setPeriod] = useState(filters.period ?? '7days');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const applyFilters = (p: string, from?: string, to?: string) => {
        const params: Record<string, string> = { period: p };
        if (p === 'custom' && from) params.date_from = from;
        if (p === 'custom' && to) params.date_to = to;
        router.get('/pos/reports', params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handlePeriod = (p: string) => {
        setPeriod(p);
        if (p !== 'custom') applyFilters(p);
    };

    const handleCustomApply = () => applyFilters('custom', dateFrom, dateTo);

    const paymentSlices = byPaymentMethod.map(p => ({ label: p.payment_method.charAt(0).toUpperCase() + p.payment_method.slice(1), value: Number(p.revenue) }));
    const typeSlices = byOrderType.map(t => ({ label: TYPE_LABELS[t.order_type] ?? t.order_type, value: Number(t.revenue) }));

    // Build full 24h array for hourly chart
    const hourMap = Object.fromEntries(byHour.map(h => [h.hour, h]));
    const hourlyFull = Array.from({ length: 24 }, (_, i) => ({
        label: `${String(i).padStart(2, '0')}:00`,
        orders: hourMap[i]?.orders ?? 0,
        revenue: hourMap[i]?.revenue ?? 0,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Sales Reports</h2>
                        <p className="text-muted-foreground">Revenue, orders, and product performance.</p>
                    </div>

                    {/* Period selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        {PERIODS.map(p => (
                            <Button key={p.value} size="sm" variant={period === p.value ? 'default' : 'outline'}
                                onClick={() => handlePeriod(p.value)}>
                                {p.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Custom date range */}
                {period === 'custom' && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Input id="report-date-from" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40 h-9" />
                        <span className="text-muted-foreground text-sm">to</span>
                        <Input id="report-date-to" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40 h-9" />
                        <Button size="sm" onClick={handleCustomApply}>Apply</Button>
                    </div>
                )}

                {/* Summary KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm">Total Revenue</p>
                                    <p className="text-3xl font-bold mt-1">{fmt(summary?.total_revenue ?? 0)}</p>
                                </div>
                                <div className="bg-indigo-700/40 p-3 rounded-xl">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm">Total Orders</p>
                                    <p className="text-3xl font-bold mt-1">{summary?.total_orders ?? 0}</p>
                                </div>
                                <div className="bg-emerald-700/40 p-3 rounded-xl">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Avg Order Value</p>
                                    <p className="text-3xl font-bold mt-1">{fmt(summary?.avg_order_value ?? 0)}</p>
                                </div>
                                <div className="bg-purple-700/40 p-3 rounded-xl">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue over time */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-indigo-500" /> Revenue Over Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart data={revenueByDay as unknown as Record<string, number | string>[]} valueKey="revenue" labelKey="label" color="#6366f1" />
                    </CardContent>
                </Card>

                {/* Middle row: payment + order type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Revenue by Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                slices={paymentSlices}
                                colors={['#10b981', '#3b82f6', '#a855f7']}
                            />
                            <div className="mt-4 space-y-2">
                                {byPaymentMethod.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${METHOD_COLORS[m.payment_method] ?? 'bg-gray-400'}`} />
                                            <span className="capitalize text-muted-foreground">{m.payment_method}</span>
                                            <Badge variant="outline" className="text-xs">{m.count} orders</Badge>
                                        </div>
                                        <span className="font-semibold">{fmt(Number(m.revenue))}</span>
                                    </div>
                                ))}
                                {!byPaymentMethod.length && <p className="text-muted-foreground text-sm text-center py-4">No data.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Revenue by Order Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                slices={typeSlices}
                                colors={['#f97316', '#06b6d4', '#ec4899']}
                            />
                            <div className="mt-4 space-y-2">
                                {byOrderType.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[t.order_type] ?? 'bg-gray-400'}`} />
                                            <span className="text-muted-foreground">{TYPE_LABELS[t.order_type] ?? t.order_type}</span>
                                            <Badge variant="outline" className="text-xs">{t.count} orders</Badge>
                                        </div>
                                        <span className="font-semibold">{fmt(Number(t.revenue))}</span>
                                    </div>
                                ))}
                                {!byOrderType.length && <p className="text-muted-foreground text-sm text-center py-4">No data.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hourly distribution */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-cyan-500" /> Orders by Hour of Day
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart data={hourlyFull as unknown as Record<string, number | string>[]} valueKey="orders" labelKey="label" color="#06b6d4" />
                    </CardContent>
                </Card>

                {/* Top products */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" /> Top Selling Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8 text-sm">No sales data for this period.</p>
                        ) : (
                            <div className="space-y-3">
                                {topProducts.map((p, i) => {
                                    const maxQty = topProducts[0]?.total_qty ?? 1;
                                    const pct = (p.total_qty / maxQty) * 100;
                                    return (
                                        <div key={p.id} className="flex items-center gap-3">
                                            <span className="w-6 text-center text-sm font-bold text-muted-foreground shrink-0">#{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium truncate">{p.name}</span>
                                                    <div className="flex items-center gap-3 shrink-0 ml-2">
                                                        <span className="text-xs text-muted-foreground">{p.total_qty} sold</span>
                                                        <span className="text-sm font-semibold">{fmt(Number(p.total_revenue))}</span>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
