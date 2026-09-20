import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Language, Theme, ToastMessage } from '../types';
import { translations, TranslationKeys } from '../i18n/translations';
import { subscribeToStorage } from '../services/storageService';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: TranslationKeys;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  isCommandOpen: boolean;
  setIsCommandOpen: (open: boolean) => void;
  refreshTrigger: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('individual');

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kc_lang') as Language) || 'en';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('kc_theme') as Theme) || 'light';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to storage updates for reactive UI updates
  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('kc_theme', theme);
  }, [theme]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    addToast({
      title: 'Persona Switched',
      description: `Switched view mode to ${newRole.toUpperCase()}`,
      type: 'info',
    });
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('kc_lang', newLang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const t = translations[language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        theme,
        setTheme,
        t,
        toasts,
        addToast,
        removeToast,
        isCommandOpen,
        setIsCommandOpen,
        refreshTrigger,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
