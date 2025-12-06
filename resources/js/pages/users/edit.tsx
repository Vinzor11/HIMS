import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    has_pin: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface EditUserProps {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Edit User',
        href: '/users/edit',
    },
];

export default function EditUser({ user }: EditUserProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/users">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Edit User</h1>
                        <p className="text-sm text-muted-foreground">
                            Update user information
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6">
                    <Form
                        method="patch"
                        action={`/users/${user.id}`}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                        defaultValue={user.name}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="email"
                                        placeholder="Email address"
                                        defaultValue={user.email}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pin">PIN</Label>
                                    <Input
                                        id="pin"
                                        type="password"
                                        name="pin"
                                        placeholder={user.has_pin ? "Enter new PIN to change" : "PIN (optional)"}
                                        autoComplete="off"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.pin}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {user.has_pin ? "Leave blank to keep current PIN" : "Leave blank if no PIN needed"}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        autoComplete="new-password"
                                        placeholder="Leave blank to keep current password"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.password}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank to keep current password
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing ? 'Updating...' : 'Update User'}
                                    </Button>
                                    <Link href="/users">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}

