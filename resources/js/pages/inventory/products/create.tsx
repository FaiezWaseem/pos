import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Category, SimpleProduct, Restaurant, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventory/categories',
    },
    {
        title: 'Products',
        href: '/inventory/products',
    },
    {
        title: 'Create',
        href: '/inventory/products/create',
    },
];

interface Props {
    restaurants: Restaurant[];
    categories: Category[];
    products: SimpleProduct[];
}

export default function ProductCreate({ restaurants, categories, products }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role?.name === 'super_admin';

    const { data, setData, post, processing, errors } = useForm({
        restaurant_id: '',
        category_id: '',
        name: '',
        description: '',
        price: '',
        cost: '',
        image: null as File | null,
        is_available: true,
        has_variations: false,
        quantity: '',
        track_quantity: false,
        sizes: [] as { name: string; price_adjustment: string; quantity: string; is_available: boolean }[],
        addons: [] as { addon_product_id: string; price_override: string; quantity_default: string; is_required: boolean }[],
    });

    const handleRestaurantChange = (value: string) => {
        setData('restaurant_id', value);
        // Reload categories and products for the selected restaurant
        router.get('/inventory/products/create', { restaurant_id: value }, { preserveState: true, only: ['categories', 'products'] });
    };

    const addSize = () => {
        setData('sizes', [...data.sizes, {
            name: '',
            price_adjustment: '0',
            quantity: '',
            is_available: true,
        }]);
    };

    const removeSize = (index: number) => {
        const newSizes = [...data.sizes];
        newSizes.splice(index, 1);
        setData('sizes', newSizes);
    };

    const updateSize = (index: number, field: string, value: string | boolean) => {
        const newSizes = [...data.sizes];
        newSizes[index] = { ...newSizes[index], [field]: value };
        setData('sizes', newSizes);
    };

    const addAddon = () => {
        setData('addons', [...data.addons, {
            addon_product_id: '',
            price_override: '',
            quantity_default: '',
            is_required: false,
        }]);
    };

    const removeAddon = (index: number) => {
        const newAddons = [...data.addons];
        newAddons.splice(index, 1);
        setData('addons', newAddons);
    };

    const updateAddon = (index: number, field: string, value: string | boolean) => {
        const newAddons = [...data.addons];
        newAddons[index] = { ...newAddons[index], [field]: value };
        setData('addons', newAddons);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory/products');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-4xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Product</CardTitle>
                            <CardDescription>
                                Add a new menu item to your restaurant.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {isSuperAdmin && (
                                        <div className="space-y-2">
                                            <Label htmlFor="restaurant">Restaurant</Label>
                                            <Select onValueChange={handleRestaurantChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a restaurant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {restaurants.map((restaurant) => (
                                                        <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                                            {restaurant.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.restaurant_id && <p className="text-sm text-destructive">{errors.restaurant_id}</p>}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select onValueChange={(value) => setData('category_id', value)} disabled={!data.restaurant_id && isSuperAdmin}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={!data.restaurant_id && isSuperAdmin ? "Select restaurant first" : "Select a category"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Classic Burger"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter product description..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Selling Price</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cost">Cost Price</Label>
                                        <Input
                                            id="cost"
                                            type="number"
                                            step="0.01"
                                            value={data.cost}
                                            onChange={(e) => setData('cost', e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.cost && <p className="text-sm text-destructive">{errors.cost}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Product Image (Optional)</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    />
                                    {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                                </div>

                                <div className="flex flex-col gap-4 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_available"
                                            checked={data.is_available}
                                            onCheckedChange={(checked) => setData('is_available', checked)}
                                        />
                                        <Label htmlFor="is_available">Available for order</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="track_quantity"
                                            checked={data.track_quantity}
                                            onCheckedChange={(checked) => setData('track_quantity', checked)}
                                        />
                                        <Label htmlFor="track_quantity">Track quantity/stock</Label>
                                    </div>

                                    {data.track_quantity && (
                                        <div className="space-y-2 pl-6">
                                            <Label htmlFor="quantity">Quantity in Stock</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                value={data.quantity}
                                                onChange={(e) => setData('quantity', e.target.value)}
                                                placeholder="Enter quantity"
                                            />
                                            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="has_variations"
                                            checked={data.has_variations}
                                            onCheckedChange={(checked) => setData('has_variations', checked)}
                                        />
                                        <Label htmlFor="has_variations">Has variations (sizes, addons, etc.)</Label>
                                    </div>
                                </div>

                                {data.has_variations && (
                                    <>
                                        {/* Sizes Section */}
                                        <div className="space-y-4 border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium">Sizes</h3>
                                                    <p className="text-sm text-muted-foreground">Add different sizes with price adjustments</p>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={addSize}>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Size
                                                </Button>
                                            </div>

                                            {data.sizes.length > 0 ? (
                                                <div className="space-y-3">
                                                    {data.sizes.map((size, index) => (
                                                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md bg-muted/50">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Size Name</Label>
                                                                <Input
                                                                    value={size.name}
                                                                    onChange={(e) => updateSize(index, 'name', e.target.value)}
                                                                    placeholder="e.g. Small"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Price Adjustment</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={size.price_adjustment}
                                                                    onChange={(e) => updateSize(index, 'price_adjustment', e.target.value)}
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Qty (Optional)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={size.quantity}
                                                                    onChange={(e) => updateSize(index, 'quantity', e.target.value)}
                                                                    placeholder="Optional"
                                                                />
                                                            </div>
                                                            <div className="space-y-1 flex items-end">
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch
                                                                        checked={size.is_available}
                                                                        onCheckedChange={(checked) => updateSize(index, 'is_available', checked)}
                                                                    />
                                                                    <Label className="text-xs">Available</Label>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-end justify-end">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeSize(index)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">No sizes added yet</p>
                                            )}
                                            {errors.sizes && <p className="text-sm text-destructive">{errors.sizes}</p>}
                                        </div>

                                        {/* Addons Section */}
                                        <div className="space-y-4 border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium">Addons</h3>
                                                    <p className="text-sm text-muted-foreground">Link other products as addons</p>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={addAddon}>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Addon
                                                </Button>
                                            </div>

                                            {data.addons.length > 0 ? (
                                                <div className="space-y-3">
                                                    {data.addons.map((addon, index) => (
                                                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md bg-muted/50">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Addon Product</Label>
                                                                <Select
                                                                    value={addon.addon_product_id}
                                                                    onValueChange={(value) => updateAddon(index, 'addon_product_id', value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {products.map((p) => (
                                                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                                                {p.name} (${p.price})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Price Override</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={addon.price_override}
                                                                    onChange={(e) => updateAddon(index, 'price_override', e.target.value)}
                                                                    placeholder="Leave empty for default"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Default Qty</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={addon.quantity_default}
                                                                    onChange={(e) => updateAddon(index, 'quantity_default', e.target.value)}
                                                                    placeholder="Optional"
                                                                />
                                                            </div>
                                                            <div className="space-y-1 flex items-end">
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch
                                                                        checked={addon.is_required}
                                                                        onCheckedChange={(checked) => updateAddon(index, 'is_required', checked)}
                                                                    />
                                                                    <Label className="text-xs">Required</Label>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-end justify-end">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeAddon(index)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">No addons added yet</p>
                                            )}
                                            {errors.addons && <p className="text-sm text-destructive">{errors.addons}</p>}
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/inventory/products">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create Product
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
