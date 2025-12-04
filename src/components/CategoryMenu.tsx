import { Category } from '@/types/menu';
import { cn } from '@/lib/utils';

interface CategoryMenuProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryMenu = ({ categories, selectedCategory, onSelectCategory }: CategoryMenuProps) => {
  return (
    <nav className="bg-sidebar rounded-2xl p-4 shadow-card">
      <h2 className="font-display font-semibold text-sidebar-foreground mb-4 px-2">
        Categories
      </h2>
      <ul className="space-y-1">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
