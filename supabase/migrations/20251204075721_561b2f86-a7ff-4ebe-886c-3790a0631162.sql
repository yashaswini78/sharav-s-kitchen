-- Add user_id column to orders table to link orders to customers
ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update RLS policies for orders table
DROP POLICY IF EXISTS "Orders are publicly readable" ON public.orders;
DROP POLICY IF EXISTS "Allow order updates" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Customers can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

-- Customers can create orders (must be logged in)
CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only admins can update orders
CREATE POLICY "Only admins can update orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));