import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Category {
    category_id: number;
    category_name: string;
}

interface Product {
    product_id: number;
    product_code: string;
    product_name: string;
    category: Category;
    unit: string;
    cost_price: string;
    selling_price: string;
    stock_qty: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

interface ShowProductProps {
    product: Product;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
    {
        title: 'Product Details',
        href: '/products/show',
    },
];

export default function ShowProduct({ product }: ShowProductProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${product.product_id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit('/products');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/products">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Product Details
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                View product information
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/products/${product.product_id}/edit`}>
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
                                Product Code
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {product.product_code}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Product Name
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {product.product_name}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Category
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {product.category?.category_name || '-'}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Unit
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {product.unit}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Cost Price
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                ${parseFloat(product.cost_price).toFixed(2)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Selling Price
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                ${parseFloat(product.selling_price).toFixed(2)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Stock Quantity
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {product.stock_qty}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Status
                            </dt>
                            <dd className="mt-1">
                                {product.status === 'active' ? (
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

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Created At
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {new Date(product.created_at).toLocaleString()}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                Updated At
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">
                                {new Date(product.updated_at).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}

