-- First, let's create a backup of existing events data
CREATE TABLE events_backup AS SELECT * FROM public.events;

-- Create the new locations table structure (if not exists from previous scripts)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for the locations table
CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON public.locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_name ON public.locations USING gin(to_tsvector('english', name));

-- Enable Row Level Security for locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for locations (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'locations' AND policyname = 'Anyone can view locations') THEN
    CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'locations' AND policyname = 'Authenticated users can create locations') THEN
    CREATE POLICY "Authenticated users can create locations" ON public.locations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Migrate existing event location data to the locations table
INSERT INTO public.locations (name, latitude, longitude, created_at)
SELECT DISTINCT 
  COALESCE(location_name, 'Event Location ' || title) as name,
  location_lat,
  location_lng,
  created_at
FROM public.events
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add location_id column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);

-- Update events table with location_id references
UPDATE public.events 
SET location_id = l.id
FROM public.locations l
WHERE public.events.location_lat = l.latitude 
  AND public.events.location_lng = l.longitude
  AND (public.events.location_name = l.name OR public.events.location_name IS NULL);

-- Make location_id NOT NULL after migration
ALTER TABLE public.events ALTER COLUMN location_id SET NOT NULL;

-- Drop old location columns from events table
ALTER TABLE public.events DROP COLUMN IF EXISTS location_name;
ALTER TABLE public.events DROP COLUMN IF EXISTS location_lat;
ALTER TABLE public.events DROP COLUMN IF EXISTS location_lng;

-- Create index on location_id for better performance
CREATE INDEX IF NOT EXISTS idx_events_location_id ON public.events(location_id);

-- Update the events RLS policies to work with the new structure
-- (The existing policies should still work, but let's make sure they're optimal)
