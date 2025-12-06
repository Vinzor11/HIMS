import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { type PaginatedData } from '@/types';

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

interface ProductsIndexProps {
    products: PaginatedData<Product>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

export default function ProductsIndex({ products }: ProductsIndexProps) {
    const handleDelete = (productId: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${productId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Products</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage products inventory
                        </p>
                    </div>
                    <Link href="/products/create">
                        <Button>
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-sidebar-border/70 bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-sidebar-border/70 bg-muted/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Unit
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Cost Price
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Selling Price
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-6 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product) => (
                                        <tr
                                            key={product.product_id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                                {product.product_code}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                {product.product_name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                                {product.category?.category_name || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                                {product.unit}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-muted-foreground">
                                                ${parseFloat(product.cost_price).toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-foreground">
                                                ${parseFloat(product.selling_price).toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-muted-foreground">
                                                {product.stock_qty}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {product.status === 'active' ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-foreground">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/products/${product.product_id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        href={`/products/${product.product_id}/edit`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                product.product_id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {products.links && products.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-sidebar-border/70 px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {products.from} to {products.to} of{' '}
                                {products.total} results
                            </div>
                            <div className="flex gap-2">
                                {products.links.map((link, index) => {
                                    const label = link.label
                                        .replace(/&laquo;/g, '«')
                                        .replace(/&raquo;/g, '»');
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded-md px-3 py-2 text-sm font-medium ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background text-foreground hover:bg-muted'
                                            } ${
                                                !link.url
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

