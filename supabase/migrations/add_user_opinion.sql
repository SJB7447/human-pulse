-- Add user_opinion column to interactions table
ALTER TABLE interactions ADD COLUMN user_opinion TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interactions' AND column_name = 'user_opinion';
