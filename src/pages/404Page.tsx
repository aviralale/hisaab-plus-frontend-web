import { useState, useEffect } from "react";
import { ArrowLeft, Home, RefreshCw, Smile } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  const [quote, setQuote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const quotes = [
    "Getting lost can sometimes lead to wonderful discoveries.",
    "The best adventures often begin with a wrong turn.",
    "Sometimes the page you're looking for is just taking a break.",
    "This may be a dead end, but your journey isn't over.",
    "You've ventured into uncharted territory. Time to explore elsewhere.",
    "Every 404 is just a detour to something better.",
    "This path may be missing, but there are plenty of others to follow.",
  ];

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/5 px-4">
      <div className="w-full max-w-lg space-y-10 text-center">
        {/* 404 with smiley face - fixed alignment */}
        <div className="flex items-center justify-center">
          <span className="text-9xl font-bold tracking-tighter text-primary">
            4
          </span>
          <div className="flex items-center justify-center w-24 h-24">
            <Smile className="w-20 h-20 text-primary" strokeWidth={2} />
          </div>
          <span className="text-9xl font-bold tracking-tighter text-primary">
            4
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Page not found
          </h2>
          <p className="text-muted-foreground text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Inspirational quote card */}
        <Card className="bg-primary/5 border-primary/20 shadow-md overflow-hidden">
          <CardContent className="pt-8 pb-8 relative">
            {isLoading ? (
              <div className="flex justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <blockquote className="italic text-xl relative">
                <span className="absolute -left-2 -top-4 text-4xl text-primary/30">
                  "
                </span>
                {quote}
                <span className="absolute -bottom-8 right-0 text-4xl text-primary/30">
                  "
                </span>
              </blockquote>
            )}
          </CardContent>
        </Card>

        {/* Alert with suggestion */}
        <Alert className="border-primary/20 bg-secondary/10 shadow-sm">
          <AlertTitle className="flex items-center w-full justify-center text-lg font-medium">
            Don't worry, we've got you covered
          </AlertTitle>
          <AlertDescription className="text-base">
            Let's get you back on track. Try returning to the previous page or
            heading home.
          </AlertDescription>
        </Alert>

        {/* Navigation options */}
        <div className="flex flex-col space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full py-6 text-base font-medium transition-all hover:shadow-md"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          <Button
            variant="default"
            className="w-full py-6 text-base font-medium bg-gradient-to-r from-primary to-primary/80 transition-all hover:shadow-md"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
