-- Insert admin user (you'll need to create this user in Supabase Auth first)
-- Then update the role manually or use this after the user is created
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@driftbase.com';

-- Sample events for testing (these will be pending by default)
INSERT INTO public.events (
  id,
  created_by,
  title,
  description,
  location_lat,
  location_lng,
  location_name,
  event_date,
  level,
  price,
  status
) VALUES 
(
  uuid_generate_v4(),
  uuid_generate_v4(),
  'Warsaw Drift Championship',
  'Professional drift competition in the heart of Warsaw. Open to all skill levels with separate categories.',
  52.2297,
  21.0122,
  'Warsaw, Poland',
  NOW() + INTERVAL '30 days',
  'pro',
  150.00,
  'approved'
),
(
  uuid_generate_v4(),
  uuid_generate_v4(),
  'Beginner Drift Workshop',
  'Learn the basics of drifting in a safe environment with professional instructors.',
  52.1672,
  20.9679,
  'Okęcie, Warsaw',
  NOW() + INTERVAL '14 days',
  'beginner',
  80.00,
  'approved'
),
(
  uuid_generate_v4(),
 uuid_generate_v4(),
  'Street Drift Meetup',
  'Casual drift meetup for intermediate drivers. Bring your own car and safety gear.',
  52.2869,
  20.9345,
  'Bemowo, Warsaw',
  NOW() + INTERVAL '7 days',
  'street',
  50.00,
  'approved'
);
