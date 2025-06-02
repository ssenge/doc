-- Migration: Create user_profiles table
-- Description: User profile information including billing address

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  language text DEFAULT 'en' CHECK (language IN ('en', 'de', 'es', 'fr')),
  
  -- Billing Address (German/European format)
  billing_street text, -- "Unter den Linden 77"
  billing_street2 text, -- Optional: "Apartment 4B, 3rd Floor"
  billing_postal_code text, -- "10117"
  billing_city text, -- "Berlin"
  billing_country text DEFAULT 'Germany',
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful indexes
CREATE INDEX idx_user_profiles_email ON user_profiles USING btree (id);
CREATE INDEX idx_user_profiles_country ON user_profiles USING btree (billing_country);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information including billing address';
COMMENT ON COLUMN user_profiles.billing_street IS 'Street address including house number (German format)';
COMMENT ON COLUMN user_profiles.billing_street2 IS 'Additional address info (apartment, floor, etc.)'; 