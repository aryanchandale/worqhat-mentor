-- Function to generate unique course codes (8 characters: letters and numbers)
CREATE OR REPLACE FUNCTION public.generate_course_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Trigger function to set course code before insert
CREATE OR REPLACE FUNCTION public.set_course_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.course_code IS NULL OR NEW.course_code = '' THEN
    NEW.course_code := generate_course_code();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.courses WHERE course_code = NEW.course_code) LOOP
      NEW.course_code := generate_course_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating course codes
DROP TRIGGER IF EXISTS trigger_set_course_code ON public.courses;
CREATE TRIGGER trigger_set_course_code
  BEFORE INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_course_code();

-- Make course_code unique
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_course_code_key;
ALTER TABLE public.courses ADD CONSTRAINT courses_course_code_key UNIQUE (course_code);