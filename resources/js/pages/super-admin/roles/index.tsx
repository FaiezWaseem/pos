import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/super-admin/roles',
    },
];

interface Props {
    roles: Role[];
}

export default function RoleIndex({ roles }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Roles</h1>
                    <Button asChild>
                        <Link href="/super-admin/roles/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Role
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-sidebar-accent/50 text-sidebar-foreground font-medium border-b border-sidebar-border/70">
                                <tr>
                                    <th className="px-4 py-3">Label</th>
                                    <th className="px-4 py-3">Name (Key)</th>
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
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <code>{role.name}</code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions && role.permissions.length > 0 ? (
                                                        role.permissions.slice(0, 3).map((p, i) => (
                                                            <Badge key={i} variant="outline" className="text-[10px]">
                                                                {p}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Full Access</span>
                                                    )}
                                                    {role.permissions && role.permissions.length > 3 && (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            +{role.permissions.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {role.is_system ? (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        System
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Custom</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild disabled={role.is_system}>
                                                    <Link href={`/super-admin/roles/${role.id}/edit`}>Edit</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            No roles found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
