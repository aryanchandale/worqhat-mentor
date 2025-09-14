import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, GraduationCap, CheckCircle, UserCheck, BookOpen, PlusCircle, FileText, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    icon: Shield,
    title: "Admin",
    description: "Oversee the entire platform",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    features: [
      { icon: UserCheck, text: "Approve teacher registrations" },
      { icon: CheckCircle, text: "Manage course creation requests" },
      { icon: Users, text: "Platform-wide user management" },
      { icon: Star, text: "System analytics & insights" }
    ]
  },
  {
    icon: Users,
    title: "Teacher",
    description: "Create and manage courses",
    color: "text-education-primary",
    bgColor: "bg-education-primary/10",
    borderColor: "border-education-primary/30",
    features: [
      { icon: PlusCircle, text: "Create courses & assignments" },
      { icon: UserCheck, text: "Approve student enrollments" },
      { icon: FileText, text: "Define grading criteria" },
      { icon: CheckCircle, text: "Review AI evaluations" }
    ]
  },
  {
    icon: GraduationCap,
    title: "Student",
    description: "Learn and grow with AI feedback",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    features: [
      { icon: BookOpen, text: "Enroll in courses" },
      { icon: FileText, text: "Submit assignments" },
      { icon: Star, text: "Receive instant feedback" },
      { icon: CheckCircle, text: "Access improvement roadmaps" }
    ]
  }
];

const RolesSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-secondary/50 border-primary/30">
            Role-Based Access
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Designed for
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Every User Type
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tailored experiences for Admins, Teachers, and Students with secure access controls
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <Card key={index} className={`bg-gradient-card border-2 ${role.borderColor} hover:shadow-glow transition-smooth group relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${role.bgColor}`} />
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-4 rounded-2xl ${role.bgColor} w-fit mb-4`}>
                  <role.icon className={`w-8 h-8 ${role.color}`} />
                </div>
                <CardTitle className="text-2xl group-hover:text-primary transition-smooth">
                  {role.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {role.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {role.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <feature.icon className={`w-5 h-5 ${role.color}`} />
                    <span className="text-foreground">{feature.text}</span>
                  </div>
                ))}

                <Button 
                  className={`w-full mt-6 bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-smooth`}
                  size="lg"
                  onClick={() => navigate(`/signin?mode=signin&role=${role.title.toLowerCase()}`)}
                >
                  Join as {role.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;