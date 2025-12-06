import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Category {
    category_id: number;
    category_name: string;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

interface EditCategoryProps {
    category: Category;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Edit Category',
        href: '/categories/edit',
    },
];

export default function EditCategory({ category }: EditCategoryProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Category" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/categories">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Edit Category</h1>
                        <p className="text-sm text-muted-foreground">
                            Update category information
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6">
                    <Form
                        method="patch"
                        action={`/categories/${category.category_id}`}
                        className="space-y-6"
                    >
                        {({ processing, errors, data = {}, setData }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="category_name">Category Name</Label>
                                    <Input
                                        id="category_name"
                                        name="category_name"
                                        required
                                        placeholder="Category name"
                                        defaultValue={category.category_name}
                                        value={data.category_name ?? category.category_name}
                                        onChange={(e) => setData('category_name', e.target.value)}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.category_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        placeholder="Optional description"
                                        defaultValue={category.description || ''}
                                        value={data.description ?? category.description ?? ''}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.description}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <input
                                        type="hidden"
                                        name="status"
                                        value={data.status ?? category.status}
                                    />
                                    <Select
                                        value={data.status ?? category.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        className="mt-2"
                                        message={errors.status}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing ? 'Updating...' : 'Update Category'}
                                    </Button>
                                    <Link href="/categories">
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

