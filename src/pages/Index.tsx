import { useState } from 'react';
import { CartProvider } from '@/context/CartContext';
import { Hero } from '@/components/Hero';
import { CategoryMenu } from '@/components/CategoryMenu';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { categories, menuItems } from '@/data/menuData';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { totalItems } = useCart();
  
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-primary-foreground text-xl">🍽️</span>
        </div>
        <span className="font-display font-bold text-xl text-foreground">Sharav's Kitchen</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <User className="w-4 h-4 mr-2" />
          Team Sign In
        </Button>
        <div className="relative md:hidden">
          <Button variant="secondary" size="icon">
            <ShoppingBag className="w-5 h-5" />
          </Button>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

const MenuContent = () => {
  const [selectedCategory, setSelectedCategory] = useState('popular');
  
  const filteredItems = selectedCategory === 'popular'
    ? menuItems.filter(item => item.isPopular)
    : menuItems.filter(item => item.category === selectedCategory);

  const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'Menu';

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Categories */}
      <div className="hidden md:block w-56 flex-shrink-0">
        <CategoryMenu
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Center - Product Grid */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {categoryName}
          </h2>
          <span className="text-muted-foreground text-sm">
            {filteredItems.length} items
          </span>
        </div>
        
        {/* Mobile Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 md:hidden scrollbar-hide mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <div key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
              <ProductCard item={item} />
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items in this category yet.</p>
          </div>
        )}
      </main>

      {/* Right Sidebar - Cart */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <CartSidebar />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Header />
          <Hero />
          <MenuContent />
        </div>
      </div>
    </CartProvider>
  );
};

export default Index;
