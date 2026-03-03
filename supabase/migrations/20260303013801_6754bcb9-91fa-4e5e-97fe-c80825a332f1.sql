
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('donor', 'recipient', 'volunteer', 'admin');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'donor',
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  donor_name TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  pickup_time TEXT,
  address TEXT NOT NULL,
  special_instructions TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked', 'in_transit', 'delivered')),
  recipient_id UUID REFERENCES public.profiles(id),
  recipient_name TEXT,
  volunteer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Enable realtime for donations
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;

-- Donation tracking (live geolocation)
CREATE TABLE public.donation_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_tracking ENABLE ROW LEVEL SECURITY;

-- Enable realtime for tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.donation_tracking;

-- User roles table (for admin check without recursion)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get current user's profile id
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Profiles RLS
CREATE POLICY "Anyone authenticated can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Donations RLS
CREATE POLICY "Donors see own donations"
  ON public.donations FOR SELECT TO authenticated
  USING (
    donor_id = public.get_my_profile_id()
    OR recipient_id = public.get_my_profile_id()
    OR volunteer_id = public.get_my_profile_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Donors can create donations"
  ON public.donations FOR INSERT TO authenticated
  WITH CHECK (donor_id = public.get_my_profile_id());

CREATE POLICY "Admins and involved users can update donations"
  ON public.donations FOR UPDATE TO authenticated
  USING (
    donor_id = public.get_my_profile_id()
    OR volunteer_id = public.get_my_profile_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins and donors can delete donations"
  ON public.donations FOR DELETE TO authenticated
  USING (
    donor_id = public.get_my_profile_id()
    OR public.has_role(auth.uid(), 'admin')
  );

-- Donation tracking RLS
CREATE POLICY "Involved users can view tracking"
  ON public.donation_tracking FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.donations d
      WHERE d.id = donation_id
        AND (d.donor_id = public.get_my_profile_id()
          OR d.recipient_id = public.get_my_profile_id()
          OR d.volunteer_id = public.get_my_profile_id()
          OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Volunteers can insert tracking"
  ON public.donation_tracking FOR INSERT TO authenticated
  WITH CHECK (volunteer_id = public.get_my_profile_id());

CREATE POLICY "Volunteers can update own tracking"
  ON public.donation_tracking FOR UPDATE TO authenticated
  USING (volunteer_id = public.get_my_profile_id());

-- User roles RLS
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone, role, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'donor'),
    COALESCE(NEW.raw_user_meta_data ->> 'city', '')
  );
  -- Also add to user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'donor')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
