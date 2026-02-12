-- Add author_id column to articles table for reporter identification
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id);

-- Allow authenticated users to insert articles (reporters)
DROP POLICY IF EXISTS "Authenticated users can insert articles." ON public.articles;
CREATE POLICY "Authenticated users can insert articles." ON public.articles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authors to update their own articles
DROP POLICY IF EXISTS "Authors can update own articles." ON public.articles;
CREATE POLICY "Authors can update own articles." ON public.articles
    FOR UPDATE USING (auth.uid() = author_id);
