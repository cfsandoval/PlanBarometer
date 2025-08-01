import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageSelector } from "@/components/language-selector";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BestPractices from "@/pages/best-practices";
import { Language, currentLanguage, setLanguage, getLanguage } from "@/lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/best-practices" component={BestPractices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [language, setCurrentLanguage] = useState<Language>(getLanguage());

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    // Force re-render of entire app to update all translations
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <nav className="flex items-center space-x-6">
                <a href="/" className="text-sm font-medium transition-colors hover:text-primary">
                  Planbarómetro
                </a>
                <a href="/best-practices" className="text-sm font-medium transition-colors hover:text-primary">
                  Buenas Prácticas
                </a>
              </nav>
              <LanguageSelector onLanguageChange={handleLanguageChange} />
            </div>
          </header>
          <main>
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
