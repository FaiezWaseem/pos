import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/super-admin/users' },
];

interface Props {
    users: User[];
    roles: Role[];
    filters: { search?: string; role_id?: string };
}

export default function UserIndex({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [roleId, setRoleId] = useState(filters.role_id ?? 'all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/super-admin/users', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    // Debounce search; role filter fires immediately
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (roleId !== 'all') params.role_id = roleId;
            applyFilters(params);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, roleId]);

    const handleRoleChange = (val: string) => setRoleId(val);

    const clearFilters = () => { setSearch(''); setRoleId('all'); };
    const hasFilters = search || roleId !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <Button asChild>
                        <Link href="/super-admin/users/create">
                            <Plus className="mr-2 h-4 w-4" /> Add User
                        </Link>
                    </Button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="user-search"
                            placeholder="Search by name or email..."
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
                    <Select value={roleId} onValueChange={handleRoleChange}>
                        <SelectTrigger id="user-role-filter" className="w-[180px]">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>{role.label}</SelectItem>
                            ))}
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
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Company/Restaurant</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{user.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{user.role?.label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.restaurants && user.restaurants.length > 0 ? (
                                                    <div className="flex flex-col">
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.restaurants.map((r, i) => (
                                                                <Badge key={r.id} variant={i === 0 ? 'secondary' : 'outline'} className="text-[10px] px-1 py-0 h-4">
                                                                    {r.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground mt-1">({user.company?.name})</span>
                                                    </div>
                                                ) : (
                                                    user.company?.name || 'System Admin'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/super-admin/users/${user.id}/edit`}>Edit</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            {hasFilters ? 'No users match your search criteria.' : 'No users found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {hasFilters && (
                    <p className="text-xs text-muted-foreground">
                        {users.length} result{users.length !== 1 ? 's' : ''} found
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
