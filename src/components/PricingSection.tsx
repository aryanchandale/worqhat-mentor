import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Student",
    price: "Free",
    description: "Submit assignments and view AI feedback",
    features: ["Unlimited submissions", "AI feedback", "Roadmaps"],
    gradient: "from-accent to-primary",
  },
  {
    name: "Teacher",
    price: "$9/mo",
    description: "Create courses and define grading metrics",
    features: ["Course creation", "Custom rubrics", "Progress analytics"],
    gradient: "from-education-primary to-education-secondary",
  },
  {
    name: "Admin",
    price: "$19/mo",
    description: "Manage users and platform-wide settings",
    features: ["Teacher approvals", "System insights", "User management"],
    gradient: "from-warning to-success",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 px-6 bg-secondary/10">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-secondary/50 border-primary/30">
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Plans for Everyone</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a plan that fits your role and needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card key={tier.name} className="bg-gradient-card border-secondary/20 hover:shadow-glow transition-smooth">
              <CardHeader>
                <Badge variant="outline" className="w-fit border-primary/30">{tier.name}</Badge>
                <CardTitle className="text-3xl mt-2">
                  <span className={`bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>{tier.price}</span>
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
                  asChild
                >
                  <a href={`/signin?mode=signin&role=${tier.name.toLowerCase()}`}>Get Started</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
