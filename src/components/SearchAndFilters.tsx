import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Category } from '@/types/menu';

interface SearchAndFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vegOnly: boolean;
  onVegToggle: () => void;
}

export const SearchAndFilters = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  vegOnly,
  onVegToggle,
}: SearchAndFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search dishes, cuisines..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-card border-border text-foreground"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "secondary"}
          size="icon"
          className="h-12 w-12 rounded-xl"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 text-sm font-medium",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-card-foreground hover:bg-secondary border border-border"
            )}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="flex gap-4 p-4 bg-card rounded-xl border border-border animate-fade-in">
          <button
            onClick={onVegToggle}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              vegOnly
                ? "bg-veg/20 text-veg border-2 border-veg"
                : "bg-muted text-muted-foreground border-2 border-transparent"
            )}
          >
            <div className="veg-badge" />
            <span className="text-sm font-medium">Veg Only</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select className="bg-muted text-foreground px-3 py-2 rounded-lg text-sm border-none outline-none">
              <option>Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
