import { useState, useMemo } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { CartProvider, useCart } from '@/context/CartContext';
import { MainSidebar } from '@/components/MainSidebar';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { FloatingOrderBar } from '@/components/FloatingOrderBar';
import { categories } from '@/data/menuData';
import { useDishes } from '@/hooks/useDishes';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const MenuContent = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const { totalItems } = useCart();

  const { dishes, loading, error } = useDishes();

  const filteredItems = useMemo(() => {
    let items = dishes;

    // Filter by category
    if (selectedCategory === 'popular') {
      items = items.filter(item => item.isPopular);
    } else if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Filter by veg
    if (vegOnly) {
      items = items.filter(item => item.isVeg);
    }

    return items;
  }, [dishes, selectedCategory, searchQuery, vegOnly]);

  const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'All Items';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Center - Product Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top - Search & Filters */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Menu Button */}
            <MainSidebar />
            
            {/* Search & Filters */}
            <div className="flex-1">
              <SearchAndFilters
                categories={[{ id: 'all', name: 'All', icon: '🍽️' }, ...categories]}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                vegOnly={vegOnly}
                onVegToggle={() => setVegOnly(!vegOnly)}
              />
            </div>

            {/* Mobile Cart Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="lg:hidden relative h-10 w-10 shrink-0"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 p-0">
                <CartSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              {categoryName}
            </h2>
            <span className="text-muted-foreground text-xs sm:text-sm">
              {filteredItems.length} items
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredItems.map((item, index) => (
                <div key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Floating Order Bar */}
        <FloatingOrderBar />
      </main>

      {/* Right Sidebar - Cart (Desktop only) */}
      <div className="w-80 border-l border-border bg-card flex-shrink-0 hidden lg:block overflow-y-auto">
        <CartSidebar />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
};

export default Index;
