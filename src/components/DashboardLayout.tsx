import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Home, Settings, LogOut, Bell, User, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'teacher' | 'admin';
  userName: string;
}

const DashboardLayout = ({ children, role, userName }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
    navigate('/');
  };

  const roleConfig = {
    student: {
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30"
    },
    teacher: {
      color: "text-education-primary", 
      bgColor: "bg-education-primary/10",
      borderColor: "border-education-primary/30"
    },
    admin: {
      color: "text-warning",
      bgColor: "bg-warning/10", 
      borderColor: "border-warning/30"
    }
  };

  const config = roleConfig[role];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-secondary/20 bg-background/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden border-primary/30"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-smooth">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">EduGrade AI</h1>
                <Badge variant="outline" className={`text-xs ${config.borderColor}`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)} Portal
                </Badge>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-primary/30">
              <Bell className="w-4 h-4" />
              <Badge className="ml-1 bg-accent text-accent-foreground">2</Badge>
            </Button>
            
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                <User className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className={`text-xs ${config.color} capitalize`}>{role}</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-secondary/20 bg-background p-6 transition-transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:top-0 md:h-[calc(100vh-4rem)] md:translate-x-0
        `}>
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            
            {role === 'student' && (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  My Courses
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Assignments
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Grades
                </Button>
              </>
            )}
            
            {role === 'teacher' && (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  My Courses
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Create Assignment
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Student Management
                </Button>
              </>
            )}
            
            {role === 'admin' && (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  User Management
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Course Approvals
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Analytics
                </Button>
              </>
            )}
            
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;