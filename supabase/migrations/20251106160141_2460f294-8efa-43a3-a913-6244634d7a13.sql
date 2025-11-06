-- Fix function search path for get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = user_uuid;
$$;