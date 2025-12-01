"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  UserData,
  OnboardingData,
  Recommendation,
  ReadingPlan,
  getUserData,
  saveUserData,
  saveOnboardingData,
  logout as logoutUser,
  isLoggedIn,
  hasCompletedOnboarding,
  getUserRecommendations,
  addRecommendationToUser,
  removeRecommendation,
  getReadingPlans,
  addBookToReadingPlan,
  isBookInReadingPlan,
  updateReadingPlan,
  updatePlanStep,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  onboarding: OnboardingData | null;
  recommendations: Recommendation[];
  readingPlans: ReadingPlan[];
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  login: (email: string, name: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  updateOnboarding: (data: OnboardingData) => void;
  addRecommendation: (book: Recommendation) => boolean;
  removeRecommendation: (bookId: string) => boolean;
  refreshRecommendations: () => void;
  addToReadingPlan: (book: Recommendation) => boolean;
  isInReadingPlan: (bookId: string) => boolean;
  refreshReadingPlans: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const loadRecommendations = () => {
    if (typeof window === "undefined") return;
    const userRecommendations = getUserRecommendations();
    setRecommendations(userRecommendations);
  };

  useEffect(() => {
    // Marcar como montado para evitar problemas de hidratação
    setMounted(true);

    // Carregar dados do localStorage ao montar
    const userData = getUserData();
    if (userData) {
      setUser(userData.user);
      setOnboarding(userData.onboarding);
      setRecommendations(userData.recommendations || []);
      const plans = getReadingPlans();
      setReadingPlans(plans);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    const userData = getUserData();
    if (userData && userData.user.email === email) {
      setUser(userData.user);
      setOnboarding(userData.onboarding);
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        createdAt: new Date().toISOString(),
      };

      const newUserData: UserData = {
        user: newUser,
        onboarding: null,
      };

      saveUserData(newUserData);
      setUser(newUser);
      setOnboarding(null);
    }
  };

  const register = (email: string, name: string) => {
    login(email, name); // Mesma lógica para registro
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setOnboarding(null);
  };

  const updateOnboarding = (data: OnboardingData) => {
    saveOnboardingData(data);
    setOnboarding(data);
  };

  const addRecommendation = (book: Recommendation): boolean => {
    const added = addRecommendationToUser(book);
    if (added) {
      loadRecommendations();
    }
    return added;
  };

  const refreshRecommendations = () => {
    loadRecommendations();
  };

  const removeRecommendationFromUser = (bookId: string): boolean => {
    const removed = removeRecommendation(bookId);
    if (removed) {
      loadRecommendations();
    }
    return removed;
  };

  const addToReadingPlan = (book: Recommendation): boolean => {
    const added = addBookToReadingPlan(book);
    if (added) {
      const plans = getReadingPlans();
      setReadingPlans(plans);
    }
    return added;
  };

  const isInReadingPlan = (bookId: string): boolean => {
    return isBookInReadingPlan(bookId);
  };

  const refreshReadingPlans = () => {
    const plans = getReadingPlans();
    setReadingPlans(plans);
  };

  // Evitar problemas de hidratação retornando valores consistentes no primeiro render
  const value = {
    user: mounted ? user : null,
    onboarding: mounted ? onboarding : null,
    recommendations: mounted ? recommendations : [],
    readingPlans: mounted ? readingPlans : [],
    isLoading: !mounted || isLoading,
    isAuthenticated: mounted && user !== null,
    onboardingComplete: mounted && onboarding !== null,
    login,
    register,
    logout,
    updateOnboarding,
    addRecommendation,
    removeRecommendation: removeRecommendationFromUser,
    refreshRecommendations,
    addToReadingPlan,
    isInReadingPlan,
    refreshReadingPlans,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
