-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_profiles table (WITHOUT is_admin - that goes in user_roles)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create feature_flags table
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update own profile" ON public.user_profiles 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles 
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for feature_flags
CREATE POLICY "Anyone can view feature flags" ON public.feature_flags 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert feature flags" ON public.feature_flags 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can update feature flags" ON public.feature_flags 
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can delete feature flags" ON public.feature_flags 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function for auto-creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  
  -- Give new users the 'user' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for creating profile on signup
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Seed the first feature flag (disabled by default)
INSERT INTO public.feature_flags (key, name, description, enabled)
VALUES (
  'show_openrouter_api_settings', 
  'OpenRouter API Settings', 
  'Show the API Settings menu item in the sidebar',
  false
);

-- Create profile for existing user and set as admin
INSERT INTO public.user_profiles (user_id)
VALUES ('efc5084e-ce43-434c-9f92-d67c89d2e775')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('efc5084e-ce43-434c-9f92-d67c89d2e775', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;