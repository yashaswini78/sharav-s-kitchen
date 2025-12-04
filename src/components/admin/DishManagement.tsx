import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type DishCategory = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'beverages' | 'desserts';

interface Dish {
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
  availability_start: string | null;
  availability_end: string | null;
  discount: number | null;
}

const categoryOptions: { value: DishCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'desserts', label: 'Desserts' },
];

const emptyDish: Omit<Dish, 'id'> = {
  name: '',
  description: '',
  price: 0,
  original_price: null,
  image_url: '',
  category: 'lunch',
  is_veg: true,
  is_available: true,
  is_daily_special: false,
  availability_start: null,
  availability_end: null,
  discount: 0,
};

export const DishManagement = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState<Omit<Dish, 'id'>>(emptyDish);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      toast.error('Failed to load dishes');
      console.error(error);
    } else {
      setDishes(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (dish?: Dish) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        original_price: dish.original_price,
        image_url: dish.image_url,
        category: dish.category,
        is_veg: dish.is_veg,
        is_available: dish.is_available,
        is_daily_special: dish.is_daily_special,
        availability_start: dish.availability_start,
        availability_end: dish.availability_end,
        discount: dish.discount,
      });
    } else {
      setEditingDish(null);
      setFormData(emptyDish);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    setSaving(true);

    const dishData = {
      ...formData,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      discount: formData.discount ? Number(formData.discount) : 0,
    };

    if (editingDish) {
      const { error } = await supabase
        .from('dishes')
        .update(dishData)
        .eq('id', editingDish.id);

      if (error) {
        toast.error('Failed to update dish');
        console.error(error);
      } else {
        toast.success('Dish updated successfully');
        setIsDialogOpen(false);
        fetchDishes();
      }
    } else {
      const { error } = await supabase
        .from('dishes')
        .insert([dishData]);

      if (error) {
        toast.error('Failed to create dish');
        console.error(error);
      } else {
        toast.success('Dish created successfully');
        setIsDialogOpen(false);
        fetchDishes();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (dish: Dish) => {
    if (!confirm(`Delete "${dish.name}"?`)) return;

    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', dish.id);

    if (error) {
      toast.error('Failed to delete dish');
      console.error(error);
    } else {
      toast.success('Dish deleted');
      fetchDishes();
    }
  };

  const toggleAvailability = async (dish: Dish) => {
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !dish.is_available })
      .eq('id', dish.id);

    if (error) {
      toast.error('Failed to update availability');
    } else {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{dishes.length} dishes in menu</p>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Dish
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Dish</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dishes.map((dish) => (
              <TableRow key={dish.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{dish.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{dish.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {dish.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₹{dish.price}</span>
                    {dish.discount && dish.discount > 0 && (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        {dish.discount}% OFF
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={dish.is_veg ? 'default' : 'destructive'} className={dish.is_veg ? 'bg-veg' : 'bg-non-veg'}>
                    {dish.is_veg ? 'Veg' : 'Non-veg'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={dish.is_available}
                    onCheckedChange={() => toggleAvailability(dish)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(dish)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(dish)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDish ? 'Edit Dish' : 'Add New Dish'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dish Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter dish name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Original Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.original_price || ''}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? Number(e.target.value) : null })}
                  placeholder="For discount display"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: DishCategory) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={formData.discount || ''}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value ? Number(e.target.value) : 0 })}
                  placeholder="0"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Available From</Label>
                <Input
                  type="time"
                  value={formData.availability_start || ''}
                  onChange={(e) => setFormData({ ...formData, availability_start: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Available Until</Label>
                <Input
                  type="time"
                  value={formData.availability_end || ''}
                  onChange={(e) => setFormData({ ...formData, availability_end: e.target.value || null })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_veg"
                  checked={formData.is_veg}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_veg: checked })}
                />
                <Label htmlFor="is_veg">Vegetarian</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">Available</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_daily_special"
                  checked={formData.is_daily_special}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_daily_special: checked })}
                />
                <Label htmlFor="is_daily_special">Daily Special</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingDish ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
