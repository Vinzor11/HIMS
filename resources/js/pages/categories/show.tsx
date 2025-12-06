import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Category {
    category_id: number;
    category_name: string;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    products?: Array<{
        product_id: number;
        product_name: string;
    }>;
}

interface ShowCategoryProps {
    category: Category;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Category Details',
        href: '/categories/show',
    },
];

export default function ShowCategory({ category }: ShowCategoryProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/categories/${category.category_id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit('/categories');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/categories">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Category Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                View category information
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/categories/${category.category_id}/edit`}>
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
                                Category Name
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {category.category_name}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Status
                            </dt>
                            <dd className="mt-1">
                                {category.status === 'active' ? (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                        Inactive
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-muted-foreground">
                                Description
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {category.description || '-'}
                            </dd>
                        </div>

                        {category.products && category.products.length > 0 && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-muted-foreground mb-2">
                                    Products ({category.products.length})
                                </dt>
                                <dd className="mt-1">
                                    <div className="flex flex-wrap gap-2">
                                        {category.products.map((product) => (
                                            <Link
                                                key={product.product_id}
                                                href={`/products/${product.product_id}`}
                                                className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground hover:bg-muted/80"
                                            >
                                                {product.product_name}
                                            </Link>
                                        ))}
                                    </div>
                                </dd>
                            </div>
                        )}

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Created At
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {new Date(category.created_at).toLocaleString()}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Updated At
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {new Date(category.updated_at).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}

