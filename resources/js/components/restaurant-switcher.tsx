import { router, useForm, usePage } from '@inertiajs/react';
import { Store, ChevronsUpDown, Check } from 'lucide-react';
import { SharedData } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function RestaurantSwitcher() {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, post } = useForm({
        restaurant_id: auth.active_restaurant_id
    });
    
    const restaurants = auth.user?.restaurants || [];
    const activeRestaurantId = auth.active_restaurant_id;
    const activeRestaurant = restaurants.find(r => r.id === activeRestaurantId) || restaurants[0];

    if (restaurants.length <= 1 && auth.user?.role?.name !== 'super_admin') {
        if (!activeRestaurant) return null;
        
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Store className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{activeRestaurant.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{auth.user?.company?.name}</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    const handleSwitch = (id: number) => {
        if (id === activeRestaurantId) return;
        
        // Use router directly for a simple POST request without form state management
        // or ensure the data is passed correctly to the post method
        router.post('/restaurant/switch', {
            restaurant_id: id
        });
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Store className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeRestaurant?.name || 'Select Restaurant'}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {auth.user?.company?.name || 'System'}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side="bottom"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Restaurants
                        </DropdownMenuLabel>
                        {restaurants.map((restaurant) => (
                            <DropdownMenuItem
                                key={restaurant.id}
                                onClick={() => handleSwitch(restaurant.id)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <Store className="size-4 shrink-0" />
                                </div>
                                {restaurant.name}
                                {restaurant.id === activeRestaurantId && (
                                    <Check className="ml-auto size-4" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
