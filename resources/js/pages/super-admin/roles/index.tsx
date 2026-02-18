import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X } from 'lucide-react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/super-admin/roles' },
];

interface Props {
    roles: Role[];
    filters: { search?: string; type?: string };
}

export default function RoleIndex({ roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? 'all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/super-admin/roles', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (type !== 'all') params.type = type;
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, type]);

    const clearFilters = () => { setSearch(''); setType('all'); };
    const hasFilters = search || type !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Roles</h1>
                    <Button asChild>
                        <Link href="/super-admin/roles/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Role
                        </Link>
                    </Button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="role-search"
                            placeholder="Search by label or key..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger id="role-type-filter" className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                            <X className="mr-1 h-3 w-3" /> Clear
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-sidebar-accent/50 text-sidebar-foreground font-medium border-b border-sidebar-border/70">
                                <tr>
                                    <th className="px-4 py-3">Label</th>
                                    <th className="px-4 py-3">Key (name)</th>
                                    <th className="px-4 py-3">Permissions</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{role.label}</td>
                                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{role.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {Array.isArray(role.permissions) ? role.permissions.length : 0} permissions
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={role.is_system ? 'default' : 'secondary'}>
                                                    {role.is_system ? 'System' : 'Custom'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/super-admin/roles/${role.id}/edit`}>Edit</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            {hasFilters ? 'No roles match your search criteria.' : 'No roles found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {hasFilters && (
                    <p className="text-xs text-muted-foreground">
                        {roles.length} result{roles.length !== 1 ? 's' : ''} found
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
