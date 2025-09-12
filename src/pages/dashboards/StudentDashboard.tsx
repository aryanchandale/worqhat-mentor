import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BookOpen, Award, TrendingUp, FileText, Clock, CheckCircle, Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const StudentDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      progress: 75,
      assignments: 8,
      completed: 6,
      grade: "A-"
    },
    {
      id: 2, 
      title: "Data Structures & Algorithms",
      instructor: "Prof. Johnson",
      progress: 60,
      assignments: 10,
      completed: 6,
      grade: "B+"
    },
    {
      id: 3,
      title: "Web Development Fundamentals", 
      instructor: "Dr. Wilson",
      progress: 90,
      assignments: 5,
      completed: 5,
      grade: "A"
    }
  ];

  const recentAssignments = [
    {
      id: 1,
      title: "Binary Search Tree Implementation",
      course: "Data Structures & Algorithms",
      dueDate: "2024-01-15",
      status: "graded",
      score: 85,
      maxScore: 100
    },
    {
      id: 2,
      title: "React Component Design",
      course: "Web Development Fundamentals", 
      dueDate: "2024-01-18",
      status: "pending",
      score: null,
      maxScore: 100
    },
    {
      id: 3,
      title: "Algorithm Analysis Essay",
      course: "Introduction to Computer Science",
      dueDate: "2024-01-20",
      status: "submitted",
      score: null,
      maxScore: 100
    }
  ];

  const handleFileUpload = () => {
    toast({
      title: "Assignment Submitted",
      description: "Your assignment has been submitted for AI evaluation",
    });
  };

  return (
    <DashboardLayout role="student" userName="Alex Johnson">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Alex!</h1>
            <p className="text-muted-foreground">Here's your learning progress overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-education-primary" />
                <span className="text-sm font-medium">Active Courses</span>
              </div>
              <div className="text-2xl font-bold text-education-primary mt-2">3</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Assignments</span>
              </div>
              <div className="text-2xl font-bold text-accent mt-2">17/23</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">Avg Grade</span>
              </div>
              <div className="text-2xl font-bold text-success mt-2">A-</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <div className="text-2xl font-bold text-primary mt-2">75%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="assignments">Recent Assignments</TabsTrigger>
            <TabsTrigger value="submit">Submit Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="bg-gradient-card border-secondary/20 hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assignments</span>
                      <span className="text-sm font-medium">{course.completed}/{course.assignments}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                        Grade: {course.grade}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <Card key={assignment.id} className="bg-gradient-card border-secondary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.course}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Due: {assignment.dueDate}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {assignment.status === 'graded' && (
                          <div className="text-center">
                            <div className="text-xl font-bold text-education-primary">
                              {assignment.score}/{assignment.maxScore}
                            </div>
                            <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                              Graded
                            </Badge>
                          </div>
                        )}
                        
                        {assignment.status === 'submitted' && (
                          <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Grading
                          </Badge>
                        )}
                        
                        {assignment.status === 'pending' && (
                          <Badge variant="outline" className="border-accent/30 text-accent">
                            <FileText className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card className="bg-gradient-card border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Submit New Assignment
                </CardTitle>
                <CardDescription>
                  Upload your assignment for AI-powered evaluation and feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-secondary/50 rounded-lg p-12 text-center hover:border-primary/50 transition-smooth">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Drag & drop your files here</h3>
                  <p className="text-muted-foreground mb-4">or click to browse</p>
                  <Button 
                    className="bg-gradient-primary hover:shadow-glow transition-smooth"
                    onClick={handleFileUpload}
                  >
                    Choose Files
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-secondary/20">
                    <CardContent className="p-4 text-center">
                      <Brain className="w-8 h-8 mx-auto text-education-primary mb-2" />
                      <h4 className="font-semibold text-sm">AI Grading</h4>
                      <p className="text-xs text-muted-foreground">Instant evaluation</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-secondary/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto text-accent mb-2" />
                      <h4 className="font-semibold text-sm">Detailed Feedback</h4>
                      <p className="text-xs text-muted-foreground">Areas to improve</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-secondary/20">
                    <CardContent className="p-4 text-center">
                      <Award className="w-8 h-8 mx-auto text-success mb-2" />
                      <h4 className="font-semibold text-sm">Learning Roadmap</h4>
                      <p className="text-xs text-muted-foreground">Personalized path</p>
                    </CardContent>
                  </Card>
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