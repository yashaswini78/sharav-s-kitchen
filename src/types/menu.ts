export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isVeg: boolean;
  isPopular?: boolean;
  isOutOfStock?: boolean;
  discount?: number;
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
