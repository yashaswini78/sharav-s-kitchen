-- Create storage bucket for dish images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dish-images', 'dish-images', true);

-- Allow anyone to view dish images (public bucket)
CREATE POLICY "Dish images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

-- Allow authenticated admins to upload dish images
CREATE POLICY "Admins can upload dish images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dish-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to update dish images
CREATE POLICY "Admins can update dish images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dish-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to delete dish images
CREATE POLICY "Admins can delete dish images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dish-images' 
  AND public.has_role(auth.uid(), 'admin')
);