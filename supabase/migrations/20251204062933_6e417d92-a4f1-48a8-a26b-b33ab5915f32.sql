-- Create enum for dish categories
CREATE TYPE public.dish_category AS ENUM ('breakfast', 'lunch', 'snacks', 'dinner', 'beverages', 'desserts');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid');

-- Create dishes table
CREATE TABLE public.dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image_url TEXT,
  category dish_category NOT NULL DEFAULT 'lunch',
  is_veg BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_daily_special BOOLEAN NOT NULL DEFAULT false,
  availability_start TIME,
  availability_end TIME,
  discount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  order_type TEXT NOT NULL DEFAULT 'delivery',
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  delivery_time TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Dishes are publicly readable (menu)
CREATE POLICY "Dishes are publicly readable" 
ON public.dishes 
FOR SELECT 
USING (true);

-- Orders are publicly readable for now (admin will manage)
CREATE POLICY "Orders are publicly readable" 
ON public.orders 
FOR SELECT 
USING (true);

-- Allow public to create orders (customers placing orders)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Allow public to insert dishes (admin functionality - will add proper auth later)
CREATE POLICY "Allow dish management" 
ON public.dishes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow order updates (admin marking as paid/delivered)
CREATE POLICY "Allow order updates" 
ON public.orders 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_dishes_updated_at
BEFORE UPDATE ON public.dishes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Insert sample dishes
INSERT INTO public.dishes (name, description, price, original_price, category, is_veg, is_available, discount) VALUES
('Masala Dosa', 'Crispy dosa with spiced potato filling', 80, NULL, 'breakfast', true, true, 0),
('Idli Sambar', 'Soft idlis with sambar and chutney', 60, NULL, 'breakfast', true, true, 0),
('Paneer Butter Masala', 'Creamy paneer in rich tomato gravy', 180, 200, 'lunch', true, true, 10),
('Chicken Biryani', 'Aromatic basmati rice with tender chicken', 220, NULL, 'lunch', false, true, 0),
('Veg Thali', 'Complete meal with rice, dal, sabzi, roti', 150, NULL, 'lunch', true, true, 0),
('Samosa', 'Crispy pastry with spiced potato filling', 30, NULL, 'snacks', true, true, 0),
('Chicken Tikka', 'Grilled marinated chicken pieces', 160, NULL, 'snacks', false, true, 0),
('Dal Makhani', 'Creamy black lentils slow cooked', 140, NULL, 'dinner', true, true, 0),
('Butter Chicken', 'Tender chicken in buttery tomato sauce', 200, 220, 'dinner', false, true, 10),
('Gulab Jamun', 'Sweet milk dumplings in sugar syrup', 50, NULL, 'desserts', true, true, 0),
('Mango Lassi', 'Refreshing mango yogurt drink', 60, NULL, 'beverages', true, true, 0),
('Masala Chai', 'Spiced Indian tea', 20, NULL, 'beverages', true, true, 0);