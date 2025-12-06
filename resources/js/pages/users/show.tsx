import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    has_pin: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowUserProps {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'User Details',
        href: '/users/show',
    },
];

export default function ShowUser({ user }: ShowUserProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${user.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit('/users');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/users">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                User Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                View user information
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/users/${user.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6">
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Name
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {user.name}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Email
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {user.email}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                PIN
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {user.has_pin ? '••••' : '-'}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Email Status
                            </dt>
                            <dd className="mt-1">
                                {user.email_verified_at ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        Unverified
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Created At
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {new Date(user.created_at).toLocaleString()}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Updated At
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {new Date(user.updated_at).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}

