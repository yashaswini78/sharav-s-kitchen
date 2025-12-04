import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderType } from '@/types/menu';

const orderTypeLabels: Record<OrderType, string> = {
  'dine-in': 'Dine In',
  'takeaway': 'Takeaway',
  'delivery': 'Delivery',
};

export const CartSidebar = () => {
  const { items, orderType, setOrderType, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  return (
    <aside className="bg-card rounded-2xl shadow-card p-4 flex flex-col h-fit sticky top-4">
      {/* Order Type Tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-4">
        {(['dine-in', 'takeaway', 'delivery'] as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200",
              orderType === type
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {orderTypeLabels[type]}
          </button>
        ))}
      </div>

      {/* Cart Header */}
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-card-foreground">
          Your Order
        </h2>
        {totalItems > 0 && (
          <span className="ml-auto bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
            {totalItems}
          </span>
        )}
      </div>

      {/* Cart Items */}
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Your feast awaits — add something delicious!
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 mb-4 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-muted rounded-xl p-3 animate-scale-in"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-card-foreground truncate">
                  {item.name}
                </h4>
                <p className="text-primary font-semibold text-sm">
                  ₹{item.price * item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Footer */}
      {items.length > 0 && (
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-card-foreground">₹{totalPrice}</span>
          </div>
          {orderType === 'delivery' && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold text-veg">FREE</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg">
            <span className="font-display font-semibold">Total</span>
            <span className="font-display font-bold text-primary">₹{totalPrice}</span>
          </div>
          <Button variant="hero" size="lg" className="w-full">
            Place Order
          </Button>
        </div>
      )}
    </aside>
  );
};
