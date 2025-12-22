-- Add variation_titles column to compose_forms table
-- This stores the song titles for each variation: { "0": { "1": "title", "2": "title", "3": "title" }, ... }

ALTER TABLE compose_forms ADD COLUMN IF NOT EXISTS variation_titles jsonb;
