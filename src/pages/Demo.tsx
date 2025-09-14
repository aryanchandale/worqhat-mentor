import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, FileText, Award, TrendingUp, CheckCircle, AlertCircle, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGrading, setIsGrading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'assignment' | 'grading' | 'results'>('assignment');

  const startGrading = () => {
    setIsGrading(true);
    setShowResults(false);
    setActiveTab('grading');
    // Simulate AI grading process
    setTimeout(() => {
      setIsGrading(false);
      setShowResults(true);
      setActiveTab('results');
    }, 3000);
  };

  const sampleAssignment = `
  Essay: "The Impact of Artificial Intelligence on Modern Education"
  
  Artificial intelligence has revolutionized many aspects of our daily lives, and education is no exception. In recent years, we have seen a significant transformation in how students learn and teachers educate through the integration of AI technologies.
  
  One of the most notable impacts is personalized learning. AI systems can analyze individual student performance and adapt the curriculum to meet specific needs. This approach helps students learn at their own pace and focuses on areas where they need the most improvement.
  
  Furthermore, AI has enabled automated grading systems that can provide instant feedback to students. This not only saves teachers time but also allows students to understand their mistakes immediately and work on corrections.
  
  However, there are also challenges. Some educators worry that over-reliance on AI might reduce critical thinking skills among students. Additionally, there are concerns about data privacy and the digital divide that might leave some students behind.
  
  In conclusion, while AI presents both opportunities and challenges in education, its proper implementation can significantly enhance the learning experience for both students and educators.
  `;

  const gradingResults = {
    score: 85,
    maxScore: 100,
    breakdown: [
      { criterion: "Content Quality", score: 22, max: 25 },
      { criterion: "Structure & Organization", score: 20, max: 25 },
      { criterion: "Grammar & Language", score: 18, max: 25 },
      { criterion: "Critical Analysis", score: 15, max: 25 }
    ],
    feedback: [
      {
        type: "strength",
        area: "Content Quality",
        comment: "Excellent coverage of key AI applications in education with relevant examples."
      },
      {
        type: "improvement", 
        area: "Critical Analysis",
        comment: "Could benefit from deeper analysis of the implications and more supporting evidence."
      },
      {
        type: "improvement",
        area: "Grammar & Language", 
        comment: "Minor grammatical errors in paragraph 3. Consider using more varied sentence structures."
      }
    ],
    roadmap: [
      "Review advanced argumentation techniques",
      "Study peer-reviewed research on AI in education", 
      "Practice academic writing with complex sentence structures",
      "Explore counterarguments and rebuttals"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-secondary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-smooth">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">EduGrade AI</h1>
                <Badge variant="outline" className="text-xs border-primary/30">
                  Demo
                </Badge>
              </div>
            </Link>
            <Button asChild variant="outline" className="border-primary/30">
              <Link to="/signin?mode=signin">Try Full Platform</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-secondary/50 border-primary/30">
            Live Demo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            See AI Grading
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              In Action
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience how our AI evaluates assignments with detailed feedback and improvement roadmaps
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Assignment
              </TabsTrigger>
              <TabsTrigger value="grading" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Grading
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assignment">
              <Card className="bg-gradient-card border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Sample Student Assignment
                  </CardTitle>
                  <CardDescription>
                    This is a sample essay that will be evaluated by our AI system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/20 p-6 rounded-lg border border-secondary/20">
                    <pre className="whitespace-pre-wrap text-foreground font-mono text-sm leading-relaxed">
                      {sampleAssignment}
                    </pre>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={startGrading}
                      className="bg-gradient-primary hover:shadow-glow transition-smooth"
                      size="lg"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Grade with AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grading">
              <Card className="bg-gradient-card border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Grading Process
                  </CardTitle>
                  <CardDescription>
                    Watch as our AI analyzes the assignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isGrading && !showResults ? (
                    <div className="text-center py-12">
                      <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Click "Grade with AI" to start the process</p>
                    </div>
                  ) : isGrading ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">AI is analyzing the assignment...</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span>Content analysis complete</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span>Structure evaluation finished</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          <span>Generating feedback and roadmap...</span>
                        </div>
                      </div>
                      
                      <Progress value={75} className="w-full" />
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
                      <h3 className="text-xl font-semibold text-success">Grading Complete!</h3>
                      <p className="text-muted-foreground mt-2">View the detailed results in the Results tab</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              {showResults ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Score Card */}
                  <Card className="bg-gradient-card border-secondary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Final Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-5xl font-bold text-education-primary mb-2">
                          {gradingResults.score}/{gradingResults.maxScore}
                        </div>
                        <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                          Grade: B
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {gradingResults.breakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.criterion}</span>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(item.score / item.max) * 100} 
                                className="w-20 h-2"
                              />
                              <span className="text-sm font-medium min-w-[3rem]">
                                {item.score}/{item.max}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback Card */}
                  <Card className="bg-gradient-card border-secondary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Detailed Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {gradingResults.feedback.map((item, index) => (
                          <div key={index} className={`p-4 rounded-lg border-l-4 ${
                            item.type === 'strength' 
                              ? 'bg-success/10 border-l-success' 
                              : 'bg-warning/10 border-l-warning'
                          }`}>
                            <div className="flex items-start gap-2">
                              {item.type === 'strength' ? (
                                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                              )}
                              <div>
                                <h4 className="font-medium text-sm">{item.area}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{item.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Improvement Roadmap */}
                  <Card className="lg:col-span-2 bg-gradient-card border-secondary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Personalized Improvement Roadmap
                      </CardTitle>
                      <CardDescription>
                        AI-generated learning path to enhance your skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gradingResults.roadmap.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg border border-secondary/20">
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-gradient-card border-secondary/20">
                  <CardContent className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Complete the grading process to see results</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Button asChild className="bg-gradient-primary hover:shadow-glow transition-smooth" size="lg">
              <Link to="/signin?mode=signin">
                <Brain className="w-5 h-5 mr-2" />
                Try the Full Platform
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;