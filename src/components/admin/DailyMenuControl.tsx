import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type DishCategory = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'beverages' | 'desserts';

interface Dish {
  id: string;
  name: string;
  price: number;
  category: DishCategory;
  is_veg: boolean;
  is_available: boolean;
  is_daily_special: boolean;
  discount: number | null;
}

const categoryLabels: Record<DishCategory, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  snacks: '🍿 Snacks',
  dinner: '🌙 Dinner',
  beverages: '🥤 Beverages',
  desserts: '🍰 Desserts',
};

export const DailyMenuControl = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, price, category, is_veg, is_available, is_daily_special, discount')
      .order('category')
      .order('name');

    if (error) {
      toast.error('Failed to load dishes');
      console.error(error);
    } else {
      setDishes(data || []);
    }
    setLoading(false);
  };

  const toggleAvailability = async (dish: Dish) => {
    setUpdating(dish.id);
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !dish.is_available })
      .eq('id', dish.id);

    if (error) {
      toast.error('Failed to update');
    } else {
      fetchDishes();
    }
    setUpdating(null);
  };

  const toggleDailySpecial = async (dish: Dish) => {
    setUpdating(dish.id);
    const { error } = await supabase
      .from('dishes')
      .update({ is_daily_special: !dish.is_daily_special })
      .eq('id', dish.id);

    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(dish.is_daily_special ? 'Removed from specials' : 'Marked as special');
      fetchDishes();
    }
    setUpdating(null);
  };

  const updateDiscount = async (dishId: string, discount: number) => {
    const { error } = await supabase
      .from('dishes')
      .update({ discount })
      .eq('id', dishId);

    if (error) {
      toast.error('Failed to update discount');
    } else {
      fetchDishes();
    }
  };

  const enableAll = async (category: DishCategory) => {
    const categoryDishIds = dishes.filter(d => d.category === category).map(d => d.id);
    
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: true })
      .in('id', categoryDishIds);

    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(`All ${category} items enabled`);
      fetchDishes();
    }
  };

  const disableAll = async (category: DishCategory) => {
    const categoryDishIds = dishes.filter(d => d.category === category).map(d => d.id);
    
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: false })
      .in('id', categoryDishIds);

    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(`All ${category} items disabled`);
      fetchDishes();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const groupedDishes = dishes.reduce((acc, dish) => {
    if (!acc[dish.category]) {
      acc[dish.category] = [];
    }
    acc[dish.category].push(dish);
    return acc;
  }, {} as Record<DishCategory, Dish[]>);

  const availableCount = dishes.filter(d => d.is_available).length;
  const specialCount = dishes.filter(d => d.is_daily_special).length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-veg/10 border-veg/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-veg">{availableCount}</div>
            <div className="text-sm text-muted-foreground">Available Items</div>
          </CardContent>
        </Card>
        <Card className="bg-muted border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{dishes.length - availableCount}</div>
            <div className="text-sm text-muted-foreground">Unavailable</div>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">{specialCount}</div>
            <div className="text-sm text-muted-foreground">Daily Specials</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{dishes.filter(d => d.discount && d.discount > 0).length}</div>
            <div className="text-sm text-muted-foreground">With Offers</div>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Control */}
      {(Object.keys(groupedDishes) as DishCategory[]).map((category) => (
        <Card key={category} className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display">
                {categoryLabels[category]}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({groupedDishes[category].filter(d => d.is_available).length}/{groupedDishes[category].length} available)
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => enableAll(category)}>
                  <ToggleRight className="w-4 h-4 mr-1" />
                  Enable All
                </Button>
                <Button variant="outline" size="sm" onClick={() => disableAll(category)}>
                  <ToggleLeft className="w-4 h-4 mr-1" />
                  Disable All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groupedDishes[category].map((dish) => (
                <div
                  key={dish.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    dish.is_available ? 'bg-background border-border' : 'bg-muted/50 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={dish.is_available}
                      onCheckedChange={() => toggleAvailability(dish)}
                      disabled={updating === dish.id}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dish.name}</span>
                        <Badge variant={dish.is_veg ? 'default' : 'destructive'} className={`text-xs ${dish.is_veg ? 'bg-veg' : 'bg-non-veg'}`}>
                          {dish.is_veg ? 'V' : 'NV'}
                        </Badge>
                        {dish.is_daily_special && (
                          <Badge className="bg-accent text-accent-foreground text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Special
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">₹{dish.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Discount Input */}
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        className="w-16 h-8 text-center"
                        value={dish.discount || ''}
                        placeholder="0"
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : 0;
                          updateDiscount(dish.id, val);
                        }}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>

                    {/* Daily Special Toggle */}
                    <Button
                      variant={dish.is_daily_special ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDailySpecial(dish)}
                      disabled={updating === dish.id}
                      className={dish.is_daily_special ? 'bg-accent hover:bg-accent/90' : ''}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Special
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
