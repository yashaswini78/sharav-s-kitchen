import { useState, useMemo } from 'react';
import { CartProvider } from '@/context/CartContext';
import { MainSidebar } from '@/components/MainSidebar';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { FloatingOrderBar } from '@/components/FloatingOrderBar';
import { categories, menuItems } from '@/data/menuData';

const MenuContent = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  const filteredItems = useMemo(() => {
    let items = menuItems;

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
  }, [selectedCategory, searchQuery, vegOnly]);

  const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'All Items';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <MainSidebar />

      {/* Center - Product Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top - Search & Filters */}
        <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm">
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

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {categoryName}
            </h2>
            <span className="text-muted-foreground text-sm">
              {filteredItems.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => (
              <div key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard item={item} />
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Floating Order Bar */}
        <FloatingOrderBar />
      </main>

      {/* Right Sidebar - Cart */}
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
