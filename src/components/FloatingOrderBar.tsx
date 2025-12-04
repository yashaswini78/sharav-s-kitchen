import { useCart } from '@/context/CartContext';
import { Clock, ChefHat, Package } from 'lucide-react';

interface ActiveOrder {
  id: string;
  token: string;
  status: 'preparing' | 'ready' | 'served';
  items: number;
}

// Mock active orders - in real app, this would come from backend
const mockActiveOrders: ActiveOrder[] = [
  { id: '1', token: 'T-001', status: 'preparing', items: 3 },
  { id: '2', token: 'T-002', status: 'ready', items: 2 },
];

const statusConfig = {
  preparing: {
    icon: ChefHat,
    label: 'Preparing',
    color: 'bg-amber-500',
  },
  ready: {
    icon: Package,
    label: 'Ready',
    color: 'bg-veg',
  },
  served: {
    icon: Clock,
    label: 'Served',
    color: 'bg-muted',
  },
};

export const FloatingOrderBar = () => {
  const { totalItems } = useCart();

  if (mockActiveOrders.length === 0 && totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-64 right-80 bg-card/95 backdrop-blur-md border-t border-border p-4 z-40">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Active Orders:
        </span>
        
        {mockActiveOrders.map((order) => {
          const config = statusConfig[order.status];
          const Icon = config.icon;
          
          return (
            <button
              key={order.id}
              className="flex items-center gap-3 bg-muted hover:bg-secondary px-4 py-2.5 rounded-xl transition-all duration-200 group"
            >
              <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
              <span className="font-semibold text-card-foreground">{order.token}</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-sm">{config.label}</span>
              </div>
              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {order.items} items
              </span>
            </button>
          );
        })}

        {mockActiveOrders.length === 0 && (
          <span className="text-sm text-muted-foreground italic">No active orders</span>
        )}
      </div>
    </div>
  );
};
