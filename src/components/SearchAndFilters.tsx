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
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-card border-border text-foreground text-sm"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "secondary"}
          size="icon"
          className="h-10 w-10 rounded-xl shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-xs sm:text-sm font-medium shrink-0",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-card-foreground hover:bg-secondary border border-border"
            )}
          >
            <span className="text-sm">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-card rounded-xl border border-border animate-fade-in">
          <button
            onClick={onVegToggle}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm",
              vegOnly
                ? "bg-veg/20 text-veg border-2 border-veg"
                : "bg-muted text-muted-foreground border-2 border-transparent"
            )}
          >
            <div className="veg-badge" />
            <span className="font-medium">Veg Only</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <select className="bg-muted text-foreground px-2 py-2 rounded-lg text-xs border-none outline-none">
              <option>Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
