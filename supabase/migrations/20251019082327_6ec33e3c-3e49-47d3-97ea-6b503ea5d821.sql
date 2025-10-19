-- Safe backfill: map unknown roles to 'student'
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) AS full_name,
  (
    CASE 
      WHEN (u.raw_user_meta_data->>'role') IN ('student','teacher','admin') THEN (u.raw_user_meta_data->>'role')::public.user_role
      ELSE 'student'::public.user_role
    END
  ) AS role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;