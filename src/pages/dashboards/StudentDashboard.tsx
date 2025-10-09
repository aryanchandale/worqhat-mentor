import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BookOpen, Award, TrendingUp, FileText, Clock, CheckCircle, Upload, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [submissionText, setSubmissionText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);

    // Fetch enrolled courses
    const { data: enrollmentsData } = await supabase
      .from('enrollments')
      .select('*, courses(*, profiles(full_name))')
      .eq('student_id', user.id)
      .eq('status', 'approved');

    setEnrolledCourses(enrollmentsData?.map(e => e.courses) || []);

    // Fetch available courses to join
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, profiles(full_name)')
      .eq('status', 'approved');

    // Filter out already enrolled courses
    const enrolledIds = enrollmentsData?.map(e => e.course_id) || [];
    setAvailableCourses(coursesData?.filter(c => !enrolledIds.includes(c.id)) || []);

    // Fetch assignments from enrolled courses
    if (enrollmentsData && enrollmentsData.length > 0) {
      const courseIds = enrollmentsData.map(e => e.course_id);
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*, courses(title)')
        .in('course_id', courseIds)
        .order('due_date', { ascending: true });

      setAssignments(assignmentsData || []);

      // Fetch student's submissions
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*, assignments(title, courses(title))')
        .eq('student_id', user.id);

      setSubmissions(submissionsData || []);
    }

    setIsLoading(false);
  };

  const handleJoinCourse = async (courseId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('enrollments')
      .insert({
        student_id: user.id,
        course_id: courseId,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to request enrollment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request Sent",
      description: "Your enrollment request has been sent to the teacher",
    });

    fetchData();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // Filter for PDF files only
      const pdfFiles = fileArray.filter(f => f.type === 'application/pdf');
      if (pdfFiles.length !== fileArray.length) {
        toast({
          title: "Invalid Files",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
      }
      setUploadedFiles(prev => [...prev, ...pdfFiles]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!user || !selectedAssignment) {
      toast({
        title: "Error",
        description: "Please select an assignment",
        variant: "destructive",
      });
      return;
    }

    // Get assignment details for AI grading
    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (!assignment) {
      toast({
        title: "Error",
        description: "Assignment not found",
        variant: "destructive",
      });
      return;
    }

    // Create submission record
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        student_id: user.id,
        assignment_id: selectedAssignment,
        content: submissionText,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (submissionError) {
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
      return;
    }

    // Upload files to storage
    for (const file of uploadedFiles) {
      const fileName = `${submission.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('submission-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Create file record
      await supabase
        .from('submission_files')
        .insert({
          submission_id: submission.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type
        });
    }

    toast({
      title: "Assignment Submitted",
      description: "Your assignment has been submitted successfully. AI is now grading...",
    });

    // Call AI grading function in background
    supabase.functions.invoke('grade-assignment', {
      body: {
        submissionContent: submissionText,
        assignmentTitle: assignment.title,
        assignmentInstructions: assignment.instructions || assignment.description,
        maxPoints: assignment.max_points || 100
      }
    }).then(({ data: gradeData, error: gradeError }) => {
      if (gradeError) {
        console.error('AI grading error:', gradeError);
        toast({
          title: "AI Grading Failed",
          description: "Your submission was saved, but AI grading failed. Teacher will review manually.",
          variant: "destructive",
        });
        return;
      }

      // Update submission with AI feedback
      supabase
        .from('submissions')
        .update({
          ai_feedback: gradeData.feedback,
          grade: gradeData.suggestedGrade
        })
        .eq('id', submission.id)
        .then(() => {
          toast({
            title: "AI Grading Complete",
            description: `AI has graded your submission with ${gradeData.suggestedGrade}/${assignment.max_points || 100} points`,
          });
          fetchData();
        });
    });

    setSelectedAssignment("");
    setSubmissionText("");
    setUploadedFiles([]);
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" userName="Loading...">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email || "Student";

  return (
    <DashboardLayout role="student" userName={userName}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userName.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Here's your learning progress overview</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-education-primary" />
                <span className="text-sm font-medium">Enrolled Courses</span>
              </div>
              <div className="text-2xl font-bold text-education-primary mt-2">{enrolledCourses.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Assignments</span>
              </div>
              <div className="text-2xl font-bold text-accent mt-2">{submissions.length}/{assignments.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">Available Courses</span>
              </div>
              <div className="text-2xl font-bold text-success mt-2">{availableCourses.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Submitted</span>
              </div>
              <div className="text-2xl font-bold text-primary mt-2">{submissions.filter(s => s.status === 'submitted').length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="join">Join Course</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submit">Submit Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                  <p className="text-muted-foreground">Join a course to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="bg-gradient-card border-secondary/20">
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        Teacher: {course.profiles?.full_name || 'Unknown'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Code:</strong> {course.course_code}</p>
                        <p><strong>Subject:</strong> {course.subject}</p>
                        {course.description && <p className="text-muted-foreground">{course.description}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="join" className="space-y-6">
            {availableCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Available Courses</h3>
                  <p className="text-muted-foreground">Check back later for new courses!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {availableCourses.map((course) => (
                  <Card key={course.id} className="border-secondary/20">
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        Teacher: {course.profiles?.full_name || 'Unknown'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <p><strong>Code:</strong> {course.course_code}</p>
                          <p><strong>Subject:</strong> {course.subject}</p>
                          {course.grade_level && <p><strong>Grade Level:</strong> {course.grade_level}</p>}
                          {course.description && <p className="text-muted-foreground">{course.description}</p>}
                        </div>
                        <Button 
                          onClick={() => handleJoinCourse(course.id)}
                          className="w-full"
                        >
                          Request to Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {assignments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
                  <p className="text-muted-foreground">Your assignments will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const submission = submissions.find(s => s.assignment_id === assignment.id);
                  return (
                    <Card key={assignment.id} className="bg-gradient-card border-secondary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground">{assignment.courses.title}</p>
                            {assignment.due_date && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {assignment.description && (
                              <p className="text-sm">{assignment.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {submission ? (
                              <>
                                {submission.grade !== null && (
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-education-primary">
                                      {submission.grade}/{assignment.max_points || 100}
                                    </div>
                                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                                      Graded
                                    </Badge>
                                  </div>
                                )}
                                {submission.grade === null && (
                                  <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                                    Submitted
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline" className="border-accent/30 text-accent">
                                Not Submitted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card className="bg-gradient-card border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Submit Assignment
                </CardTitle>
                <CardDescription>
                  Upload your assignment files (PDF format)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment">Select Assignment</Label>
                    <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignments.filter(a => !submissions.find(s => s.assignment_id === a.id)).map((assignment) => (
                          <SelectItem key={assignment.id} value={assignment.id}>
                            {assignment.title} - {assignment.courses.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Additional Notes (Optional)</Label>
                    <Textarea
                      id="content"
                      placeholder="Add any notes or comments about your submission..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload PDF Files</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div 
                      className="border-2 border-dashed border-secondary/50 rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Click to upload PDF files</h3>
                      <p className="text-muted-foreground text-sm">Only PDF format is accepted</p>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files:</Label>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmitAssignment}
                    disabled={!selectedAssignment || uploadedFiles.length === 0}
                    className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
                  >
                    Submit Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;