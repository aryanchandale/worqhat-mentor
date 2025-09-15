-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');

-- Create approval status enum
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create submission status enum
CREATE TYPE public.submission_status AS ENUM ('draft', 'submitted', 'graded');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create teacher approval requests table
CREATE TABLE public.teacher_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  qualification TEXT NOT NULL,
  experience TEXT,
  reason TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on teacher requests
ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade_level TEXT,
  max_students INTEGER DEFAULT 30,
  course_code TEXT NOT NULL UNIQUE,
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status approval_status NOT NULL DEFAULT 'pending',
  enrolled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Enable RLS on enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  allow_late BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  status submission_status NOT NULL DEFAULT 'draft',
  grade INTEGER,
  feedback TEXT,
  ai_feedback TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create submission files table
CREATE TABLE public.submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on submission files
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('assignment-files', 'assignment-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('submission-files', 'submission-files', false);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to get user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for teacher requests
CREATE POLICY "Users can view own teacher requests" ON public.teacher_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create teacher requests" ON public.teacher_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all teacher requests" ON public.teacher_requests FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update teacher requests" ON public.teacher_requests FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for courses
CREATE POLICY "Everyone can view approved courses" ON public.courses FOR SELECT USING (status = 'approved');
CREATE POLICY "Teachers can view own courses" ON public.courses FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Admins can view all courses" ON public.courses FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Teachers can create courses" ON public.courses FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'teacher' AND auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Admins can update all courses" ON public.courses FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for enrollments
CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view course enrollments" ON public.enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
);
CREATE POLICY "Students can create enrollment requests" ON public.enrollments FOR INSERT WITH CHECK (
  public.get_user_role(auth.uid()) = 'student' AND auth.uid() = student_id
);
CREATE POLICY "Teachers can update course enrollments" ON public.enrollments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
);

-- RLS Policies for assignments
CREATE POLICY "Students can view course assignments" ON public.assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid() AND status = 'approved')
);
CREATE POLICY "Teachers can view own course assignments" ON public.assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid())
);
CREATE POLICY "Teachers can create assignments" ON public.assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()) AND auth.uid() = created_by
);
CREATE POLICY "Teachers can update own assignments" ON public.assignments FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for submissions
CREATE POLICY "Students can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view course submissions" ON public.submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assignments a 
    JOIN public.courses c ON a.course_id = c.id 
    WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT WITH CHECK (
  public.get_user_role(auth.uid()) = 'student' AND auth.uid() = student_id
);
CREATE POLICY "Students can update own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Teachers can update course submissions" ON public.submissions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.assignments a 
    JOIN public.courses c ON a.course_id = c.id 
    WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
  )
);

-- RLS Policies for submission files
CREATE POLICY "Users can view own submission files" ON public.submission_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND student_id = auth.uid())
);
CREATE POLICY "Teachers can view course submission files" ON public.submission_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.assignments a ON s.assignment_id = a.id
    JOIN public.courses c ON a.course_id = c.id
    WHERE s.id = submission_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY "Students can insert submission files" ON public.submission_files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND student_id = auth.uid())
);

-- Storage policies for assignment files
CREATE POLICY "Teachers can upload assignment files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'assignment-files' AND 
  public.get_user_role(auth.uid()) = 'teacher'
);

CREATE POLICY "Users can view assignment files" ON storage.objects FOR SELECT USING (
  bucket_id = 'assignment-files'
);

-- Storage policies for submission files
CREATE POLICY "Students can upload submission files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'submission-files' AND 
  public.get_user_role(auth.uid()) = 'student' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can view own submission files" ON storage.objects FOR SELECT USING (
  bucket_id = 'submission-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can view course submission files" ON storage.objects FOR SELECT USING (
  bucket_id = 'submission-files' AND 
  public.get_user_role(auth.uid()) = 'teacher'
);