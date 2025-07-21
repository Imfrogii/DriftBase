-- Users table policies
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Cars table policies
CREATE POLICY "Users can view all cars" ON public.cars
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own cars" ON public.cars
  FOR ALL USING (auth.uid() = user_id);

-- Events table policies
CREATE POLICY "Users can view approved events" ON public.events
  FOR SELECT USING (status = 'approved' OR auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Registrations table policies
CREATE POLICY "Users can view registrations for their events or own registrations" ON public.registrations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND created_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create own registrations" ON public.registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own registrations" ON public.registrations
  FOR DELETE USING (auth.uid() = user_id);
