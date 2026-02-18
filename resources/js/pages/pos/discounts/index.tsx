import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Search, X, Plus, Pencil, Trash2, Ticket, Percent, DollarSign, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'POS', href: '/pos' },
    { title: 'Discounts', href: '/pos/discounts' },
];

interface Discount {
    id: number;
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
}

interface Props {
    discounts: Discount[];
    filters: { search?: string; status?: string };
}

type DiscountForm = {
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: string;
    min_order_amount: string;
    max_discount_amount: string;
    usage_limit: string;
    is_active: boolean;
    starts_at: string;
    expires_at: string;
};

const emptyForm: DiscountForm = {
    name: '', code: '', type: 'percentage', value: '',
    min_order_amount: '0', max_discount_amount: '', usage_limit: '',
    is_active: true, starts_at: '', expires_at: '',
};

function isExpired(d: Discount) {
    return d.expires_at && new Date(d.expires_at) < new Date();
}

function isNotStarted(d: Discount) {
    return d.starts_at && new Date(d.starts_at) > new Date();
}

function getStatusBadge(d: Discount) {
    if (!d.is_active) return { label: 'Inactive', cls: 'bg-gray-500/10 text-gray-600 border-gray-500/30' };
    if (isExpired(d)) return { label: 'Expired', cls: 'bg-red-500/10 text-red-600 border-red-500/30' };
    if (isNotStarted(d)) return { label: 'Scheduled', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' };
    if (d.usage_limit !== null && d.used_count >= d.usage_limit)
        return { label: 'Limit Reached', cls: 'bg-orange-500/10 text-orange-600 border-orange-500/30' };
    return { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
}

export default function DiscountsIndex({ discounts, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Discount | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm<DiscountForm>(emptyForm);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/pos/discounts', params, { preserveState: true, preserveScroll: true, replace: true });
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (status !== 'all') params.status = status;
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, status]);

    const openCreate = () => {
        setEditTarget(null);
        reset();
        clearErrors();
        setDialogOpen(true);
    };

    const openEdit = (d: Discount) => {
        setEditTarget(d);
        setData({
            name: d.name, code: d.code, type: d.type,
            value: String(d.value),
            min_order_amount: String(d.min_order_amount),
            max_discount_amount: d.max_discount_amount ? String(d.max_discount_amount) : '',
            usage_limit: d.usage_limit ? String(d.usage_limit) : '',
            is_active: d.is_active,
            starts_at: d.starts_at ?? '',
            expires_at: d.expires_at ?? '',
        });
        clearErrors();
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editTarget) {
            put(`/pos/discounts/${editTarget.id}`, { onSuccess: () => setDialogOpen(false) });
        } else {
            post('/pos/discounts', { onSuccess: () => { setDialogOpen(false); reset(); } });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/pos/discounts/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const hasFilters = search || status !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Discounts & Promotions" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Discounts & Promotions</h2>
                        <p className="text-muted-foreground">Create and manage discount codes for your POS.</p>
                    </div>
                    <Button onClick={openCreate} id="create-discount-btn">
                        <Plus className="mr-2 h-4 w-4" /> New Discount
                    </Button>
                </div>

                {/* Filters + Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>{discounts.length} Discount{discounts.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="discount-search" placeholder="Search name or code..."
                                        value={search} onChange={e => setSearch(e.target.value)}
                                        className="pl-9 pr-9 h-9" />
                                    {search && (
                                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="discount-status-filter" className="w-[130px] h-9">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {hasFilters && (
                                    <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus('all'); }} className="text-muted-foreground h-9">
                                        <X className="mr-1 h-3 w-3" /> Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-sidebar-border/70 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-sidebar-accent/50 font-medium border-b border-sidebar-border/70">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Name</th>
                                        <th className="px-4 py-3 text-left">Code</th>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-center">Value</th>
                                        <th className="px-4 py-3 text-center">Usage</th>
                                        <th className="px-4 py-3 text-left">Validity</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {discounts.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                                <Ticket className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                {hasFilters ? 'No discounts match your filters.' : 'No discounts yet. Create your first one!'}
                                            </td>
                                        </tr>
                                    ) : (
                                        discounts.map(d => {
                                            const { label, cls } = getStatusBadge(d);
                                            return (
                                                <tr key={d.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                                    <td className="px-4 py-3 font-medium">{d.name}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <code className="bg-sidebar-accent px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
                                                                {d.code}
                                                            </code>
                                                            <button onClick={() => copyCode(d.code)} title="Copy code"
                                                                className="text-muted-foreground hover:text-foreground transition-colors">
                                                                <Copy className="h-3 w-3" />
                                                            </button>
                                                            {copiedCode === d.code && <span className="text-xs text-emerald-600">Copied!</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            {d.type === 'percentage'
                                                                ? <><Percent className="h-3.5 w-3.5" /> Percentage</>
                                                                : <><DollarSign className="h-3.5 w-3.5" /> Fixed</>
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold">
                                                        {d.type === 'percentage' ? `${d.value}%` : `$${Number(d.value).toFixed(2)}`}
                                                        {d.max_discount_amount && (
                                                            <p className="text-xs text-muted-foreground font-normal">max ${d.max_discount_amount}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-medium">{d.used_count}</span>
                                                        {d.usage_limit && <span className="text-muted-foreground"> / {d.usage_limit}</span>}
                                                        {!d.usage_limit && <span className="text-muted-foreground"> / ∞</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {d.starts_at && <p>From: {d.starts_at}</p>}
                                                        {d.expires_at && <p>Until: {d.expires_at}</p>}
                                                        {!d.starts_at && !d.expires_at && <span>No limit</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge variant="outline" className={`text-xs ${cls}`}>{label}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => openEdit(d)} title="Edit">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(d)} title="Delete"
                                                                className="text-destructive hover:text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open: boolean) => { if (!open) setDialogOpen(false); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? 'Edit Discount' : 'Create Discount'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="d-name">Name</Label>
                                <Input id="d-name" placeholder="Summer Sale" value={data.name} onChange={e => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="d-code">Code</Label>
                                <Input id="d-code" placeholder="SAVE10" value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())} className="font-mono" />
                                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="d-type">Type</Label>
                                <Select value={data.type} onValueChange={v => setData('type', v as 'percentage' | 'fixed')}>
                                    <SelectTrigger id="d-type"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="d-value">Value {data.type === 'percentage' ? '(%)' : '($)'}</Label>
                                <Input id="d-value" type="number" min="0.01" step="0.01" placeholder={data.type === 'percentage' ? '10' : '5.00'}
                                    value={data.value} onChange={e => setData('value', e.target.value)} />
                                {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="d-min">Min Order Amount ($)</Label>
                                <Input id="d-min" type="number" min="0" step="0.01" placeholder="0"
                                    value={data.min_order_amount} onChange={e => setData('min_order_amount', e.target.value)} />
                            </div>

                            {data.type === 'percentage' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="d-max">Max Discount ($) <span className="text-muted-foreground font-normal">(optional cap)</span></Label>
                                    <Input id="d-max" type="number" min="0" step="0.01" placeholder="No cap"
                                        value={data.max_discount_amount} onChange={e => setData('max_discount_amount', e.target.value)} />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="d-limit">Usage Limit <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                <Input id="d-limit" type="number" min="1" placeholder="Unlimited"
                                    value={data.usage_limit} onChange={e => setData('usage_limit', e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="d-starts">Starts At <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                <Input id="d-starts" type="date" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="d-expires">Expires At <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                <Input id="d-expires" type="date" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)} />
                            </div>

                            <div className="col-span-2 flex items-center justify-between p-3 rounded-lg border border-sidebar-border/70">
                                <div>
                                    <p className="text-sm font-medium">Active</p>
                                    <p className="text-xs text-muted-foreground">Discount can be applied at checkout</p>
                                </div>
                                <Switch id="d-active" checked={data.is_active} onCheckedChange={v => setData('is_active', v)} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editTarget ? 'Update Discount' : 'Create Discount'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Discount</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong> (<code>{deleteTarget?.code}</code>)?
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
