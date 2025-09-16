import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signin?mode=signup');
  };

  const handleWatchDemo = () => {
    handleNav('demo');
  };

  const handleNav = (target: 'features' | 'roles' | 'demo') => {
    if (target === 'demo') {
      navigate('/demo');
    } else {
      navigate(`/#${target}`);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-secondary/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EduGrade AI</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNav('features')} className="text-foreground/80 hover:text-primary transition-smooth">
              Features
            </button>
            <button onClick={() => handleNav('roles')} className="text-foreground/80 hover:text-primary transition-smooth">
              Roles
            </button>
            <button onClick={() => handleNav('demo')} className="text-foreground/80 hover:text-primary transition-smooth">
              Demo
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/10" asChild>
              <Link to="/signin?mode=signin">Sign In</Link>
            </Button>
            <Button className="bg-gradient-primary hover:shadow-glow transition-smooth" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden border-primary/30"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-secondary/20 rounded-xl border border-secondary/20">
            <nav className="flex flex-col gap-4">
              <button onClick={() => handleNav('features')} className="text-foreground/80 hover:text-primary transition-smooth text-left">
                Features
              </button>
              <button onClick={() => handleNav('roles')} className="text-foreground/80 hover:text-primary transition-smooth text-left">
                Roles
              </button>
              <button onClick={() => handleNav('demo')} className="text-foreground/80 hover:text-primary transition-smooth text-left">
                Demo
              </button>
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="outline" className="border-primary/30 hover:bg-primary/10" asChild>
                  <Link to="/signin?mode=signin">Sign In</Link>
                </Button>
                <Button className="bg-gradient-primary hover:shadow-glow transition-smooth" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;