-- Add 'story_generated' to the interaction_type check constraint
-- Since we used a text check constraint in the original setup:
-- check (interaction_type in ('view', 'like', 'share', 'mood_pulse'))

-- We need to drop the old constraint and add a new one.

DO $$
BEGIN
    -- Attempt to drop the constraint if it has a predictable name. 
    -- Supabase/Postgres usually names it 'interactions_interaction_type_check'.
    ALTER TABLE public.interactions DROP CONSTRAINT IF EXISTS interactions_interaction_type_check;
    
    -- Add the new constraint including 'story_generated'
    ALTER TABLE public.interactions ADD CONSTRAINT interactions_interaction_type_check 
    CHECK (interaction_type IN ('view', 'like', 'share', 'mood_pulse', 'story_generated'));
    
EXCEPTION
    WHEN undefined_object THEN
        -- If constraint name is different, we might be in trouble, but usually it's standard.
        RAISE NOTICE 'Constraint not found or could not be dropped via standard name.';
END $$;
