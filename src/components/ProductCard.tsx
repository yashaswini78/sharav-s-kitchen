import { MenuItem } from '@/types/menu';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  item: MenuItem;
}

export const ProductCard = ({ item }: ProductCardProps) => {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;
  const isSelected = quantity > 0;
  const isOutOfStock = item.isOutOfStock;

  return (
    <div 
      className={cn(
        "group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in relative",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isOutOfStock && "opacity-60"
      )}
    >
      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-semibold">
            Out of Stock
          </span>
        </div>
      )}

      <div className="relative h-40 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.isPopular && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
            🔥 Popular
          </span>
        )}
        {item.discount && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded-full">
            {item.discount}% OFF
          </span>
        )}
        <div className="absolute top-3 right-3">
          <div className={item.isVeg ? 'veg-badge' : 'non-veg-badge'} />
        </div>
        {isSelected && (
          <div className="absolute bottom-3 right-3 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {quantity}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-display font-semibold text-card-foreground text-lg mb-1">
          {item.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-primary">
              ₹{item.price}
            </span>
            {item.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{item.originalPrice}
              </span>
            )}
          </div>
          
          {quantity === 0 ? (
            <Button
              variant="accent"
              size="sm"
              onClick={() => !isOutOfStock && addToCart(item)}
              className="rounded-full"
              disabled={isOutOfStock}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-primary rounded-full p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => updateQuantity(item.id, quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-semibold text-primary-foreground w-6 text-center">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => updateQuantity(item.id, quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
