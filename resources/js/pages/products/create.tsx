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
}

interface CreateProductProps {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
    {
        title: 'Create Product',
        href: '/products/create',
    },
];

export default function CreateProduct({ categories }: CreateProductProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/products">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Create Product</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new product to the system
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6">
                    <Form
                        method="post"
                        action="/products"
                        className="space-y-6"
                    >
                        {({ processing, errors, data = {}, setData }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="product_code">Product Code</Label>
                                    <Input
                                        id="product_code"
                                        name="product_code"
                                        required
                                        placeholder="SKU or internal code"
                                        value={data?.product_code || ''}
                                        onChange={(e) => setData('product_code', e.target.value)}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.product_code}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="product_name">Product Name</Label>
                                    <Input
                                        id="product_name"
                                        name="product_name"
                                        required
                                        placeholder="Product name"
                                        value={data?.product_name || ''}
                                        onChange={(e) => setData('product_name', e.target.value)}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.product_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <input
                                        type="hidden"
                                        name="category_id"
                                        value={data?.category_id || ''}
                                    />
                                    <Select
                                        value={data?.category_id?.toString() || ''}
                                        onValueChange={(value) => setData('category_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.category_id}
                                                    value={category.category_id.toString()}
                                                >
                                                    {category.category_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        className="mt-2"
                                        message={errors.category_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unit</Label>
                                    <Input
                                        id="unit"
                                        name="unit"
                                        required
                                        placeholder="pcs, box, kg, meter, etc."
                                        value={data?.unit || ''}
                                        onChange={(e) => setData('unit', e.target.value)}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.unit}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cost_price">Cost Price</Label>
                                        <Input
                                            id="cost_price"
                                            name="cost_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                            placeholder="0.00"
                                            value={data?.cost_price || ''}
                                            onChange={(e) => setData('cost_price', e.target.value)}
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.cost_price}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="selling_price">Selling Price</Label>
                                        <Input
                                            id="selling_price"
                                            name="selling_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                            placeholder="0.00"
                                            value={data?.selling_price || ''}
                                            onChange={(e) => setData('selling_price', e.target.value)}
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.selling_price}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="stock_qty">Stock Quantity</Label>
                                    <Input
                                        id="stock_qty"
                                        name="stock_qty"
                                        type="number"
                                        min="0"
                                        required
                                        placeholder="0"
                                        value={data?.stock_qty || ''}
                                        onChange={(e) => setData('stock_qty', parseInt(e.target.value) || 0)}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.stock_qty}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <input
                                        type="hidden"
                                        name="status"
                                        value={data?.status || 'active'}
                                    />
                                    <Select
                                        value={data?.status || 'active'}
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
                                        {processing ? 'Creating...' : 'Create Product'}
                                    </Button>
                                    <Link href="/products">
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

