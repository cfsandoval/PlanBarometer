import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageSelector } from "@/components/language-selector";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { Language, currentLanguage, setLanguage, getLanguage } from "@/lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
            <div className="container flex h-14 items-center justify-end">
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
