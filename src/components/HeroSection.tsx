import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, GraduationCap, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signin?mode=signup');
  };

  const handleWatchDemo = () => {
    navigate('/demo');
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="AI Education Platform" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <Badge variant="secondary" className="mb-6 bg-secondary/50 border-education-primary/30">
          <Brain className="w-4 h-4 mr-2" />
          AI-Powered Assessment Platform
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
          Revolutionize
          <br />
          <span className="text-foreground">Assignment Grading</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Enhance productivity for teachers and students with AI that provides instant grading, 
          detailed feedback, and personalized improvement roadmaps.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth px-8 py-4 text-lg" onClick={handleGetStarted}>
            <GraduationCap className="w-5 h-5 mr-2" />
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-education-primary/30 hover:bg-education-primary/10" onClick={handleWatchDemo}>
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-education-primary mb-2">95%</div>
            <p className="text-muted-foreground">Accuracy Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-education-secondary mb-2">10x</div>
            <p className="text-muted-foreground">Faster Grading</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">100%</div>
            <p className="text-muted-foreground">Detailed Feedback</p>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-pulse">
        <div className="w-16 h-16 bg-gradient-primary rounded-full opacity-30 blur-sm" />
      </div>
      <div className="absolute bottom-20 right-10 animate-pulse delay-1000">
        <div className="w-20 h-20 bg-gradient-hero rounded-full opacity-20 blur-sm" />
      </div>
    </section>
  );
};

export default HeroSection;