-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pet_type TEXT NOT NULL CHECK (pet_type IN ('dog', 'cat')),
  pet_name TEXT,
  breed_provided TEXT,
  age TEXT,
  origin TEXT,
  owner_name TEXT,
  twitter_handle TEXT,
  traits_notes TEXT,
  image_url TEXT,
  ai_breed_identified TEXT,
  ai_confidence INTEGER,
  ai_temperament TEXT,
  ai_care_notes TEXT,
  ai_traits JSONB,
  ai_fun_fact TEXT,
  ai_origin TEXT,
  raw_ai_response JSONB
);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public submissions)
CREATE POLICY "Allow public insert" ON submissions FOR INSERT WITH CHECK (true);

-- Allow anyone to read (for stats)
CREATE POLICY "Allow public read" ON submissions FOR SELECT USING (true);

-- Stats view
CREATE VIEW submission_stats AS
SELECT
  COUNT(*) AS total_submissions,
  COUNT(DISTINCT ai_breed_identified) AS unique_breeds,
  COUNT(*) FILTER (WHERE pet_type = 'dog') AS dog_count,
  COUNT(*) FILTER (WHERE pet_type = 'cat') AS cat_count;

-- Storage bucket (run this separately in Supabase dashboard or via API)
-- Bucket name: pet-photos
-- Public: true
