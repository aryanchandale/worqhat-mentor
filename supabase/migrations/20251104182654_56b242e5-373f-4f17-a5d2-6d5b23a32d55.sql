-- Fix search_path for new functions (with CASCADE)
DROP FUNCTION IF EXISTS set_org_code() CASCADE;
DROP FUNCTION IF EXISTS generate_org_code() CASCADE;

CREATE OR REPLACE FUNCTION generate_org_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION set_org_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_org_code();
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE code = NEW.code) LOOP
      NEW.code := generate_org_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER ensure_org_code
BEFORE INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION set_org_code();