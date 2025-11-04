-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to profiles
ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Add organization_id to courses
ALTER TABLE public.courses ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Create index for faster lookups
CREATE INDEX idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX idx_courses_organization ON public.courses(organization_id);
CREATE INDEX idx_organizations_code ON public.organizations(code);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Admins can view own organization"
ON public.organizations
FOR SELECT
USING (created_by = auth.uid() OR id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) = 'admin'::user_role 
  AND created_by = auth.uid()
);

CREATE POLICY "Admins can update own organizations"
ON public.organizations
FOR UPDATE
USING (created_by = auth.uid());

-- Update existing RLS policies to be organization-scoped
DROP POLICY IF EXISTS "Everyone can view approved courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can view own courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;

CREATE POLICY "Users can view courses in their organization"
ON public.courses
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Function to generate unique organization code
CREATE OR REPLACE FUNCTION generate_org_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate organization code
CREATE OR REPLACE FUNCTION set_org_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_org_code();
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE code = NEW.code) LOOP
      NEW.code := generate_org_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_org_code
BEFORE INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION set_org_code();

-- Trigger for updated_at on organizations
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();