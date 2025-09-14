import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-secondary/20 bg-background">
      <div className="container mx-auto px-6 py-10 grid gap-6 md:grid-cols-2 items-center">
        <div>
          <h3 className="text-xl font-semibold">Get started with EduGrade AI</h3>
          <p className="text-muted-foreground mt-1">Jump straight to your role’s sign in</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button asChild variant="outline" className="border-primary/30">
            <Link to="/signin?mode=signin&role=student">Student Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary/30">
            <Link to="/signin?mode=signin&role=teacher">Teacher Sign In</Link>
          </Button>
          <Button asChild className="bg-gradient-primary hover:shadow-glow transition-smooth">
            <Link to="/signin?mode=signin&role=admin">Admin Sign In</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
