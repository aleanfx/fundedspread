"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import es from "./es.json";
import en from "./en.json";

type Language = "es" | "en";

// Define the shape of our dictionary based on es.json
type Dictionary = typeof es;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Language, Dictionary> = {
  es,
  en,
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const storedLang = localStorage.getItem("fundedspread_lang") as Language;
    if (storedLang && (storedLang === "es" || storedLang === "en")) {
      setLanguageState(storedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("fundedspread_lang", lang);
    // document.documentElement.lang = lang; // Uncomment to also change HTML lang attribute dynamically
  };

  const t = (path: string): string => {
    const keys = path.split(".");
    let current: any = dictionaries[language];

    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation key not found: ${path}`);
        return path;
      }
      current = current[key];
    }

    return current as string;
  };

  // Prevent hydration mismatch by optionally rendering children only after mounting, 
  // or rendering default ES text before mount. We will render ES on server, then snap to local lang.
  if (!mounted) {
     return (
       <LanguageContext.Provider value={{ language: "es", setLanguage: () => {}, t: (k) => k }}>
         {children}
       </LanguageContext.Provider>
     );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
