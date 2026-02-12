-- Add is_admin column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow admins to view all data
-- Profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = TRUE));

-- Articles (already public, but for updates/deletes)
CREATE POLICY "Admins can update all articles" 
ON public.articles FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = TRUE));

CREATE POLICY "Admins can insert articles" 
ON public.articles FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = TRUE));

CREATE POLICY "Admins can delete articles" 
ON public.articles FOR DELETE 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = TRUE));

-- Orders (View all orders for analytics)
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = TRUE));

-- Interactions (View all feedback)
CREATE POLICY "Admins can view all interactions" 
ON public.interactions FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = TRUE));

-- Example usage to promote a user (Run this in SQL Editor):
-- UPDATE public.profiles SET is_admin = TRUE WHERE id = 'USER_UUID_HERE';
