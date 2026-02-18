import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Companies', href: '/super-admin/companies' },
];

interface Props {
    companies: Company[];
    filters: { search?: string };
}

export default function CompanyIndex({ companies, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get('/super-admin/companies', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters({ ...(search ? { search } : {}) });
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    const clearFilters = () => setSearch('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Companies Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Companies</h1>
                    <Button asChild>
                        <Link href="/super-admin/companies/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Company
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="company-search"
                            placeholder="Search by name, email, or phone..."
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
                    {search && (
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
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {companies.length > 0 ? (
                                    companies.map((company) => (
                                        <tr key={company.id} className="hover:bg-sidebar-accent/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{company.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{company.email || 'N/A'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{company.phone || 'N/A'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/super-admin/companies/${company.id}/edit`}>Edit</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            {search ? `No companies matching "${search}".` : 'No companies found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {search && (
                    <p className="text-xs text-muted-foreground">
                        {companies.length} result{companies.length !== 1 ? 's' : ''} for "{search}"
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
