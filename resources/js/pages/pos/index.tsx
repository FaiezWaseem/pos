import { useState, useMemo } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Category, Product, ProductSize, ProductAddon, Table, Area, Customer, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Trash2, Plus, Minus, User, Table as TableIcon, CreditCard, Banknote, Globe, Package, X } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription 
} from "@/components/ui/dialog";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'POS',
        href: '/pos',
    },
];

interface Props {
    categories: (Category & { products: Product[] })[];
    tables: Table[];
    areas: Area[];
    customers: Customer[];
    restaurant_id: number;
}

interface SelectedSize {
    id: number;
    name: string;
    price_adjustment: number;
}

interface SelectedAddon {
    id: number;
    addon_product_id: number;
    addon_product_name: string;
    price: number;
    quantity: number;
}

interface CartItem {
    product: Product;
    quantity: number;
    price: number;
    notes?: string;
    size?: SelectedSize | null;
    addons?: SelectedAddon[];
}

export default function PosIndex({ categories, tables, areas, customers, restaurant_id }: Props) {
    const { auth } = usePage<SharedData>().props;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
    
    // Variation selection state
    const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
    const [selectedProductForVariation, setSelectedProductForVariation] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<SelectedSize | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

    const { post, processing } = useForm();

    const filteredProducts = useMemo(() => {
        let products: Product[] = [];
        
        if (activeCategoryId === 'all') {
            categories.forEach(cat => {
                products = [...products, ...cat.products];
            });
        } else {
            const category = categories.find(cat => cat.id === activeCategoryId);
            if (category) products = category.products;
        }

        if (searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return products;
    }, [categories, activeCategoryId, searchTerm]);

    const openVariationDialog = (product: Product) => {
        setSelectedProductForVariation(product);
        // Reset selections
        setSelectedSize(null);
        setSelectedAddons([]);
        setIsVariationDialogOpen(true);
    };

    const handleAddAddon = (addon: ProductAddon) => {
        const existingIndex = selectedAddons.findIndex(a => a.id === addon.id);
        if (existingIndex >= 0) {
            // Already added, update quantity
            const updated = [...selectedAddons];
            updated[existingIndex].quantity += 1;
            setSelectedAddons(updated);
        } else {
            // Add new
            setSelectedAddons([...selectedAddons, {
                id: addon.id!,
                addon_product_id: addon.addon_product_id,
                addon_product_name: addon.addon_product?.name || 'Unknown',
                price: Number(addon.price_override ?? addon.addon_product?.price ?? 0),
                quantity: 1,
            }]);
        }
    };

    const handleRemoveAddon = (addonId: number) => {
        const existingIndex = selectedAddons.findIndex(a => a.id === addonId);
        if (existingIndex >= 0) {
            const updated = [...selectedAddons];
            if (updated[existingIndex].quantity > 1) {
                updated[existingIndex].quantity -= 1;
            } else {
                updated.splice(existingIndex, 1);
            }
            setSelectedAddons(updated);
        }
    };

    const calculateItemPrice = (): number => {
        if (!selectedProductForVariation) return 0;
        
        let price = Number(selectedProductForVariation.price) || 0;
        
        // Add size adjustment
        if (selectedSize) {
            price += Number(selectedSize.price_adjustment) || 0;
        }
        
        // Add addons
        selectedAddons.forEach(addon => {
            price += (Number(addon.price) || 0) * addon.quantity;
        });
        
        return price;
    };

    const confirmAddToCart = () => {
        if (!selectedProductForVariation) return;
        
        const cartItem: CartItem = {
            product: selectedProductForVariation,
            quantity: 1,
            price: calculateItemPrice(),
            size: selectedSize,
            addons: selectedAddons,
        };
        
        setCart(prev => [...prev, cartItem]);
        setIsVariationDialogOpen(false);
        setSelectedProductForVariation(null);
    };

    const addToCart = (product: Product) => {
        // Check if product has variations
        if (product.has_variations && (product.sizes?.length || product.addons?.length)) {
            openVariationDialog(product);
        } else {
            // Simple product - add directly
            setCart(prev => {
                // For simple products, we can group by product id
                const existing = prev.find(item =>
                    item.product.id === product.id && !item.size && !item.addons?.length
                );
                if (existing) {
                    return prev.map(item =>
                        item.product.id === product.id && !item.size && !item.addons?.length
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return [...prev, { product, quantity: 1, price: Number(product.price) || 0 }];
            });
        }
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.quantity), 0);
    }, [cart]);

    const tax = subtotal * 0.1; // 10% tax example
    const total = subtotal + tax;

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (orderType === 'dine_in' && !selectedTable) {
            alert('Please select a table for Dine In orders.');
            return;
        }
        setIsCheckoutOpen(true);
    };

    const submitOrder = () => {
        const orderData = {
            restaurant_id,
            customer_id: selectedCustomer,
            table_id: selectedTable,
            items: cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes,
                size_id: item.size?.id,
                addon_ids: item.addons?.map(a => ({ id: a.id, quantity: a.quantity })),
            })),
            subtotal,
            tax,
            total,
            payment_method: paymentMethod,
            order_type: orderType
        };

        router.post('/pos/order', orderData, {
            onSuccess: () => {
                setCart([]);
                setSelectedTable(null);
                setIsCheckoutOpen(false);
            }
        });
    };

    const getCartItemDisplayName = (item: CartItem): string => {
        let name = item.product.name;
        if (item.size) {
            name += ` (${item.size.name})`;
        }
        return name;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="POS System" />
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Products Area */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden border-r">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search products..." 
                                className="pl-10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Tabs value={orderType} onValueChange={(v: any) => setOrderType(v)}>
                            <TabsList>
                                <TabsTrigger value="dine_in">Dine In</TabsTrigger>
                                <TabsTrigger value="takeaway">Takeaway</TabsTrigger>
                                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        <Button 
                            variant={activeCategoryId === 'all' ? 'default' : 'outline'}
                            onClick={() => setActiveCategoryId('all')}
                            className="whitespace-nowrap"
                        >
                            All Categories
                        </Button>
                        {categories.map(cat => (
                            <Button 
                                key={cat.id}
                                variant={activeCategoryId === cat.id ? 'default' : 'outline'}
                                onClick={() => setActiveCategoryId(cat.id)}
                                className="whitespace-nowrap"
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredProducts.map(product => (
                                <Card 
                                    key={product.id} 
                                    className="cursor-pointer hover:border-primary transition-colors overflow-hidden flex flex-col"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="aspect-square bg-muted relative">
                                        {product.image ? (
                                            <img src={`/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                                                ${Number(product.price || 0).toFixed(2)}
                                            </Badge>
                                        </div>
                                        {product.has_variations && (product.sizes?.length || product.addons?.length) && (
                                            <div className="absolute bottom-2 left-2">
                                                <Badge variant="default" className="text-xs">
                                                    Options
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-3">
                                        <CardTitle className="text-sm font-semibold line-clamp-2">{product.name}</CardTitle>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Cart Area */}
                <div className="w-96 flex flex-col bg-sidebar">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="font-bold flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> Current Order
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-destructive h-8 px-2">
                            Clear
                        </Button>
                    </div>

                    <div className="p-4 space-y-4 border-b">
                        {orderType === 'dine_in' && (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Select Table</Label>
                                <Select value={selectedTable?.toString()} onValueChange={(v) => setSelectedTable(parseInt(v))}>
                                    <SelectTrigger>
                                        <TableIcon className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Select Table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tables.map(table => (
                                            <SelectItem key={table.id} value={table.id.toString()}>
                                                Table {table.table_number} ({table.area?.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Select Customer</Label>
                            <Select value={selectedCustomer?.toString()} onValueChange={(v) => setSelectedCustomer(parseInt(v))}>
                                <SelectTrigger>
                                    <User className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Walk-in Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Walk-in Customer</SelectItem>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {cart.length > 0 ? (
                                cart.map((item, index) => (
                                    <div key={index} className="flex gap-3 border-b pb-3">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">{getCartItemDisplayName(item)}</h4>
                                            {item.addons && item.addons.length > 0 && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Addons: {item.addons.map(a => `${a.addon_product_name} x${a.quantity}`).join(', ')}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">${(Number(item.price) || 0).toFixed(2)} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(index, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(index, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="text-right min-w-[60px]">
                                            <p className="text-sm font-semibold">${((Number(item.price) || 0) * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive"
                                            onClick={() => removeFromCart(index)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <ShoppingCart className="h-12 w-12 mb-2" />
                                    <p>Your cart is empty</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-sidebar-accent/30 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${Number(subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (10%)</span>
                            <span>${Number(tax || 0).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-primary">${Number(total || 0).toFixed(2)}</span>
                        </div>
                        <Button 
                            className="w-full h-12 text-lg font-bold" 
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                        >
                            Checkout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Variation Selection Dialog */}
            <Dialog open={isVariationDialogOpen} onOpenChange={setIsVariationDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedProductForVariation?.name}</DialogTitle>
                        <DialogDescription>
                            Select options for this item
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-6">
                        {/* Size Selection */}
                        {selectedProductForVariation?.sizes && selectedProductForVariation.sizes.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Select Size</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedProductForVariation.sizes.map(size => {
                                        const priceAdjustment = Number(size.price_adjustment) || 0;
                                        return (
                                            <Button
                                                key={size.id}
                                                type="button"
                                                variant={selectedSize?.id === size.id ? 'default' : 'outline'}
                                                className="justify-between"
                                                onClick={() => setSelectedSize({
                                                    id: size.id!,
                                                    name: size.name,
                                                    price_adjustment: priceAdjustment,
                                                })}
                                            >
                                                <span>{size.name}</span>
                                                <span className="text-xs">
                                                    {priceAdjustment >= 0 ? '+' : ''}{priceAdjustment.toFixed(2)}
                                                </span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Addons Selection */}
                        {selectedProductForVariation?.addons && selectedProductForVariation.addons.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Add-ons</Label>
                                <div className="space-y-2">
                                    {selectedProductForVariation.addons.map(addon => {
                                        const selectedAddon = selectedAddons.find(a => a.id === addon.id);
                                        const price = Number(addon.price_override ?? addon.addon_product?.price ?? 0);
                                        
                                        return (
                                            <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{addon.addon_product?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ${price.toFixed(2)}
                                                        {addon.is_required && <span className="ml-2 text-orange-500">*Required</span>}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedAddon ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => handleRemoveAddon(addon.id!)}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-6 text-center">{selectedAddon.quantity}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => handleAddAddon(addon)}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAddAddon(addon)}
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Price Summary */}
                        <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                            <span className="font-medium text-muted-foreground">Item Price</span>
                            <span className="text-xl font-bold">${Number(calculateItemPrice() || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVariationDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAddToCart}>
                            Add to Cart
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Checkout Modal */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Complete Order</DialogTitle>
                        <DialogDescription>
                            Select payment method and finalize the order.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-6">
                        <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                            <span className="font-medium text-muted-foreground">Amount to Pay</span>
                            <span className="text-2xl font-bold">${Number(total || 0).toFixed(2)}</span>
                        </div>

                        <div className="space-y-3">
                            <Label>Payment Method</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button 
                                    type="button"
                                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                    className="flex flex-col h-20 gap-2"
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <Banknote className="h-6 w-6" />
                                    <span>Cash</span>
                                </Button>
                                <Button 
                                    type="button"
                                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                    className="flex flex-col h-20 gap-2"
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <CreditCard className="h-6 w-6" />
                                    <span>Card</span>
                                </Button>
                                <Button 
                                    type="button"
                                    variant={paymentMethod === 'online' ? 'default' : 'outline'}
                                    className="flex flex-col h-20 gap-2"
                                    onClick={() => setPaymentMethod('online')}
                                >
                                    <Globe className="h-6 w-6" />
                                    <span>Online</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
                        <Button onClick={submitOrder} disabled={processing}>
                            {processing ? 'Processing...' : 'Complete Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
