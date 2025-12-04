import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/menu';

type DishCategory = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'beverages' | 'desserts';

interface DbDish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: DishCategory;
  is_veg: boolean;
  is_available: boolean;
  is_daily_special: boolean;
  discount: number | null;
}

const categoryMap: Record<DishCategory, string> = {
  breakfast: 'breakfast',
  lunch: 'main',
  snacks: 'starters',
  dinner: 'main',
  beverages: 'beverages',
  desserts: 'desserts',
};

export const useDishes = () => {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('is_available', true)
      .order('category')
      .order('name');

    if (error) {
      setError('Failed to load menu');
      console.error(error);
    } else {
      const menuItems: MenuItem[] = (data || []).map((dish: DbDish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || '',
        price: Number(dish.price),
        originalPrice: dish.original_price ? Number(dish.original_price) : undefined,
        image: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        category: categoryMap[dish.category] || dish.category,
        isVeg: dish.is_veg,
        isPopular: dish.is_daily_special,
        isOutOfStock: !dish.is_available,
        discount: dish.discount || undefined,
      }));
      setDishes(menuItems);
    }
    setLoading(false);
  };

  return { dishes, loading, error, refetch: fetchDishes };
};
