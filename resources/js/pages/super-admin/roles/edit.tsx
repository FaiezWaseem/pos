import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface Props {
    role: Role;
}

export default function RoleEdit({ role }: Props) {
    const [newPermission, setNewPermission] = useState('');
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        label: role.label || '',
        permissions: role.permissions || [],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/super-admin/roles',
        },
        {
            title: 'Edit',
            href: `/super-admin/roles/${role.id}/edit`,
        },
    ];

    const addPermission = () => {
        if (newPermission && !data.permissions.includes(newPermission)) {
            setData('permissions', [...data.permissions, newPermission]);
            setNewPermission('');
        }
    };

    const removePermission = (perm: string) => {
        setData('permissions', data.permissions.filter(p => p !== perm));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/super-admin/roles/${role.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role: ${role.label}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Role</CardTitle>
                            <CardDescription>
                                Update the role and its associated permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="label">Display Name</Label>
                                        <Input
                                            id="label"
                                            value={data.label}
                                            onChange={(e) => setData('label', e.target.value)}
                                            placeholder="e.g. Branch Manager"
                                            required
                                        />
                                        {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">System Name (Slug)</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. branch_manager"
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <Label>Permissions</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newPermission}
                                            onChange={(e) => setNewPermission(e.target.value)}
                                            placeholder="e.g. orders.view"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPermission())}
                                        />
                                        <Button type="button" variant="outline" size="icon" onClick={addPermission}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-muted/20">
                                        {data.permissions.length > 0 ? (
                                            data.permissions.map((perm) => (
                                                <Badge key={perm} className="gap-1 px-2 py-1">
                                                    {perm}
                                                    <X 
                                                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                                        onClick={() => removePermission(perm)}
                                                    />
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">No permissions added. Leaving empty implies full access for system roles.</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/super-admin/roles">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Update Role
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
