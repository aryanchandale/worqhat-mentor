import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Award, BookOpen, Target, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Grading",
    description: "Advanced WorqHat LLM provides comprehensive evaluation based on your marking scheme",
    badge: "Core Feature",
    gradient: "from-education-primary to-education-secondary"
  },
  {
    icon: Award,
    title: "Smart Scoring",
    description: "Accurate scoring based on custom metrics defined by teachers for each assignment",
    badge: "Precision",
    gradient: "from-accent to-primary"
  },
  {
    icon: BookOpen,
    title: "Detailed Feedback",
    description: "Comprehensive analysis highlighting problematic areas and improvement opportunities",
    badge: "Quality",
    gradient: "from-success to-accent"
  },
  {
    icon: Target,
    title: "Improvement Roadmap",
    description: "Personalized learning paths with curated resources for student development",
    badge: "Growth",
    gradient: "from-warning to-success"
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Seamless workflow for Admins, Teachers, and Students with appropriate permissions",
    badge: "Security",
    gradient: "from-primary to-accent"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor student performance and identify trends across assignments and courses",
    badge: "Analytics",
    gradient: "from-education-secondary to-primary"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-secondary/50 border-primary/30">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need for
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Modern Education
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline assignment evaluation with cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-secondary/20 hover:shadow-glow transition-smooth group">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} shadow-glow`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary/80">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;