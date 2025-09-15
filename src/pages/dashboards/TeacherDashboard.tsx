import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, Plus, Calendar, FileText, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TeacherDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Fetch teacher's courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id);

      setCourses(coursesData || []);

      // Fetch assignments for teacher's courses
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*, courses(title)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      setAssignments(assignmentsData || []);

      // Fetch enrollment requests
      if (coursesData && coursesData.length > 0) {
        const courseIds = coursesData.map(c => c.id);
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('*, profiles(full_name, email), courses(title)')
          .in('course_id', courseIds)
          .eq('status', 'pending');

        setEnrollmentRequests(enrollmentsData || []);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleEnrollmentResponse = async (enrollmentId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('enrollments')
      .update({ 
        status,
        enrolled_at: status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', enrollmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update enrollment request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Enrollment request ${status}`,
    });

    // Refresh enrollment requests
    setEnrollmentRequests(prev => prev.filter(req => req.id !== enrollmentId));
  };

  const CreateCourseForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      subject: '',
      grade_level: '',
      course_code: '',
      max_students: 30
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const { error } = await supabase
        .from('courses')
        .insert({
          ...formData,
          teacher_id: user?.id
        });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Course Created",
        description: "Your course request has been submitted for approval",
      });

      setFormData({
        title: '',
        description: '',
        subject: '',
        grade_level: '',
        course_code: '',
        max_students: 30
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Course
          </CardTitle>
          <CardDescription>
            Submit a new course for admin approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code</Label>
                <Input
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                  placeholder="e.g., MATH101"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Input
                  id="grade_level"
                  value={formData.grade_level}
                  onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                  placeholder="e.g., 9-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_students">Max Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                  min={1}
                  max={100}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Submit Course Request
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout role="teacher" userName="Loading...">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" userName={user?.user_metadata?.full_name || user?.email || "Teacher"}>
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                  <p className="text-2xl font-bold">{courses.filter(c => c.status === 'approved').length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Enrollments</p>
                  <p className="text-2xl font-bold">{enrollmentRequests.length}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Courses</p>
                  <p className="text-2xl font-bold">{courses.filter(c => c.status === 'pending').length}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="create">Create Course</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollment Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Manage your courses and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No courses yet. Create your first course!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}>
                            {course.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Code: {course.course_code}</span>
                          <span>Subject: {course.subject}</span>
                          {course.grade_level && <span>Grade: {course.grade_level}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <CreateCourseForm />
          </TabsContent>

          <TabsContent value="enrollments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Requests</CardTitle>
                <CardDescription>Review student enrollment requests</CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending enrollment requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {enrollmentRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{request.profiles.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{request.profiles.email}</p>
                            <p className="text-sm">Course: {request.courses.title}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEnrollmentResponse(request.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEnrollmentResponse(request.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;