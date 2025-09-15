import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, BookOpen, Clock, UserCheck, BookCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [teacherRequests, setTeacherRequests] = useState<any[]>([]);
  const [courseRequests, setCourseRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingTeachers: 0,
    pendingCourses: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Fetch teacher approval requests
      const { data: teachersData } = await supabase
        .from('teacher_requests')
        .select('*, profiles(full_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      setTeacherRequests(teachersData || []);

      // Fetch course approval requests
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*, profiles(full_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      setCourseRequests(coursesData || []);

      // Fetch stats
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id');

      const { data: allCourses } = await supabase
        .from('courses')
        .select('id, status');

      setStats({
        totalUsers: allUsers?.length || 0,
        totalCourses: allCourses?.filter(c => c.status === 'approved').length || 0,
        pendingTeachers: teachersData?.length || 0,
        pendingCourses: coursesData?.length || 0
      });

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleTeacherApproval = async (requestId: string, userId: string, status: 'approved' | 'rejected') => {
    const { error: requestError } = await supabase
      .from('teacher_requests')
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (requestError) {
      toast({
        title: "Error",
        description: "Failed to update teacher request",
        variant: "destructive",
      });
      return;
    }

    if (status === 'approved') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'teacher' })
        .eq('id', userId);

      if (profileError) {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: `Teacher request ${status}`,
    });

    // Refresh teacher requests
    setTeacherRequests(prev => prev.filter(req => req.id !== requestId));
    setStats(prev => ({ ...prev, pendingTeachers: prev.pendingTeachers - 1 }));
  };

  const handleCourseApproval = async (courseId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('courses')
      .update({
        status,
        approved_by: user?.id,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', courseId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update course request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Course request ${status}`,
    });

    // Refresh course requests
    setCourseRequests(prev => prev.filter(req => req.id !== courseId));
    setStats(prev => ({
      ...prev,
      pendingCourses: prev.pendingCourses - 1,
      totalCourses: status === 'approved' ? prev.totalCourses + 1 : prev.totalCourses
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin" userName="Loading...">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName={user?.user_metadata?.full_name || user?.email || "Admin"}>
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Teachers</p>
                  <p className="text-2xl font-bold">{stats.pendingTeachers}</p>
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
                  <p className="text-2xl font-bold">{stats.pendingCourses}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teachers">Teacher Requests</TabsTrigger>
            <TabsTrigger value="courses">Course Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Teacher Approval Requests
                </CardTitle>
                <CardDescription>Review and approve teacher registration requests</CardDescription>
              </CardHeader>
              <CardContent>
                {teacherRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending teacher requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {teacherRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold">{request.profiles.full_name}</h4>
                              <p className="text-sm text-muted-foreground">{request.profiles.email}</p>
                            </div>
                            <div className="space-y-1">
                              <p><span className="font-medium">Qualification:</span> {request.qualification}</p>
                              {request.experience && (
                                <p><span className="font-medium">Experience:</span> {request.experience}</p>
                              )}
                              {request.reason && (
                                <p><span className="font-medium">Reason:</span> {request.reason}</p>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Requested: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleTeacherApproval(request.id, request.user_id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTeacherApproval(request.id, request.user_id, 'rejected')}
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

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookCheck className="w-5 h-5" />
                  Course Approval Requests
                </CardTitle>
                <CardDescription>Review and approve course creation requests</CardDescription>
              </CardHeader>
              <CardContent>
                {courseRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending course requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {courseRequests.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                by {course.profiles.full_name} ({course.profiles.email})
                              </p>
                            </div>
                            <p className="text-sm">{course.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Code: {course.course_code}</span>
                              <span>Subject: {course.subject}</span>
                              {course.grade_level && <span>Grade: {course.grade_level}</span>}
                              <span>Max Students: {course.max_students}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Requested: {new Date(course.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCourseApproval(course.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCourseApproval(course.id, 'rejected')}
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

export default AdminDashboard;