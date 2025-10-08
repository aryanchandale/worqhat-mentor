import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Mail, Lock, User, GraduationCap, Users, Shield } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTab, setDefaultTab] = useState("signin");
  const [defaultRole, setDefaultRole] = useState("student");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const role = params.get('role');
    if (mode === 'signup') {
      setDefaultTab('signup');
    }
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      setDefaultRole(role);
    }
  }, [location.search]);

  const handleSignIn = async (role: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Get user profile to check role
      // @ts-expect-error - Supabase type inference issue
      const profileResult = await supabase.from('profiles').select('role').eq('id', data.user.id);
      const profile = profileResult.data?.[0];
      const profileError = profileResult.error;

      if (profileError || !profile) {
        toast({
          title: "Error",
          description: "Could not fetch user profile",
          variant: "destructive",
        });
        return;
      }

      if (profile.role !== role) {
        toast({
          title: "Access Denied",
          description: `You are not registered as a ${role}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: `Signed in successfully as ${role}`,
      });

      navigate(`/dashboard/${role.toLowerCase()}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (role: string, name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
            role: role,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (role === 'teacher') {
        toast({
          title: "Registration Submitted",
          description: "Please check your email to verify your account, then contact an admin for approval",
        });
      } else if (role === 'admin') {
        toast({
          title: "Admin Registration",
          description: "Admin accounts require approval from existing administrators",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    student: GraduationCap,
    teacher: Users,
    admin: Shield
  };

  const AuthForm = ({ mode, role }: { mode: 'signin' | 'signup', role: string }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
    });

    const Icon = roleIcons[role as keyof typeof roleIcons];

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        if (mode === 'signin') {
          handleSignIn(role, formData.email, formData.password);
        } else {
          handleSignUp(role, formData.name, formData.email, formData.password);
        }
      }}>
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <Badge variant="outline" className="border-primary/30 capitalize">
                {role}
              </Badge>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Processing..." : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-smooth">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">EduGrade AI</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>

        <Card className="bg-gradient-card border-secondary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle>Access Platform</CardTitle>
            <CardDescription>Choose your role to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={defaultTab} onValueChange={setDefaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <Tabs value={defaultRole} onValueChange={setDefaultRole} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="student">
                    <AuthForm mode="signin" role="student" />
                  </TabsContent>
                  <TabsContent value="teacher">
                    <AuthForm mode="signin" role="teacher" />
                  </TabsContent>
                  <TabsContent value="admin">
                    <AuthForm mode="signin" role="admin" />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="signup">
                <Tabs value={defaultRole} onValueChange={setDefaultRole} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="student">
                    <AuthForm mode="signup" role="student" />
                  </TabsContent>
                  <TabsContent value="teacher">
                    <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                      <p className="text-sm text-warning">
                        Teacher accounts require admin approval before activation
                      </p>
                    </div>
                    <AuthForm mode="signup" role="teacher" />
                  </TabsContent>
                  <TabsContent value="admin">
                    <div className="mb-4 p-3 bg-info/10 border border-info/30 rounded-lg">
                      <p className="text-sm text-info">
                        Admin accounts are created by existing administrators
                      </p>
                    </div>
                    <AuthForm mode="signup" role="admin" />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;