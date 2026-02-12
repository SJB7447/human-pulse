-- Add is_public column to interactions table
ALTER TABLE interactions 
ADD COLUMN is_public BOOLEAN DEFAULT TRUE;

-- Update existing rows to be public (optional, but good for continuity)
UPDATE interactions SET is_public = TRUE WHERE is_public IS NULL;
