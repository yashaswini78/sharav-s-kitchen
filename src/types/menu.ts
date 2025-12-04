export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isPopular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface Category {
  id: string;
  name: string;
  icon: string;
}
