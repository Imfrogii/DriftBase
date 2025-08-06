-- Create locations table
CREATE TABLE public.locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for geospatial queries
CREATE INDEX idx_locations_lat_lng ON public.locations(latitude, longitude);
CREATE INDEX idx_locations_name ON public.locations USING gin(to_tsvector('english', name));

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Anyone can view locations" ON public.locations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create locations" ON public.locations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
