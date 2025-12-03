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
  getUserRecommendations,
  addRecommendationToUser,
  removeRecommendation,
  getReadingPlans,
  addBookToReadingPlan,
  isBookInReadingPlan,
  updateReadingPlan,
  updatePlanStep,
  removeReadingPlan,
  updateUserName,
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  getSessionEmail,
  setSessionEmail,
  clearSession,
  type Favorite,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  onboarding: OnboardingData | null;
  recommendations: Recommendation[];
  readingPlans: ReadingPlan[];
  favorites: Favorite[];
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  login: (email: string, name: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  updateOnboarding: (data: OnboardingData) => void;
  updateUser: (name: string) => boolean;
  addRecommendation: (book: Recommendation) => boolean;
  removeRecommendation: (bookId: string) => boolean;
  refreshRecommendations: () => void;
  addToReadingPlan: (book: Recommendation) => boolean;
  isInReadingPlan: (bookId: string) => boolean;
  removeFromReadingPlan: (planId: string) => boolean;
  refreshReadingPlans: () => void;
  toggleFavorite: (book: Recommendation) => boolean;
  isBookFavorite: (bookId: string) => boolean;
  refreshFavorites: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
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
    const sessionEmail = getSessionEmail();

    if (userData && sessionEmail && userData.user.email === sessionEmail) {
      // Há uma sessão ativa para este usuário
      setUser(userData.user);
      setOnboarding(userData.onboarding);
      setRecommendations(userData.recommendations || []);
      const plans = getReadingPlans();
      setReadingPlans(plans);
      const favs = getFavorites();
      setFavorites(favs);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    const userData = getUserData();
    if (userData && userData.user.email === email) {
      // Login em usuário existente: restaurar dados salvos
      setSessionEmail(email);
      setUser(userData.user);
      setOnboarding(userData.onboarding);
      setRecommendations(userData.recommendations || []);
      const plans = getReadingPlans();
      setReadingPlans(plans);
      const favs = getFavorites();
      setFavorites(favs);
      return;
    }

    // Se não existe usuário salvo para esse email, não fazer login.
    // A tela de login deve forçar o fluxo de cadastro nesse caso.
  };

  const register = (email: string, name: string) => {
    // Cadastro sempre cria/atualiza o usuário salvo para este email
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    const newUserData: UserData = {
      user: newUser,
      onboarding: null,
      recommendations: [],
      readingPlans: [],
      favorites: [],
    };

    saveUserData(newUserData);
    setSessionEmail(email);
    setUser(newUser);
    setOnboarding(null);
    setRecommendations([]);
    setReadingPlans([]);
    setFavorites([]);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setOnboarding(null);
    setRecommendations([]);
    setReadingPlans([]);
    setFavorites([]);
  };

  const updateOnboarding = (data: OnboardingData) => {
    saveOnboardingData(data);
    setOnboarding(data);
  };

  const updateUser = (name: string): boolean => {
    const updated = updateUserName(name);
    if (updated) {
      const userData = getUserData();
      if (userData) {
        setUser(userData.user);
      }
    }
    return updated;
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
      // Se o livro estiver nos favoritos, remover também
      if (isFavorite(bookId)) {
        removeFavorite(bookId);
        const favs = getFavorites();
        setFavorites(favs);
      }
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

  const removeFromReadingPlan = (planId: string): boolean => {
    const removed = removeReadingPlan(planId);
    if (removed) {
      const plans = getReadingPlans();
      setReadingPlans(plans);
    }
    return removed;
  };

  const toggleFavorite = (book: Recommendation): boolean => {
    const isFav = isFavorite(book.id);
    if (isFav) {
      const removed = removeFavorite(book.id);
      if (removed) {
        const favs = getFavorites();
        setFavorites(favs);
      }
      return false;
    } else {
      const added = addFavorite(book);
      if (added) {
        const favs = getFavorites();
        setFavorites(favs);
      }
      return added;
    }
  };

  const isBookFavorite = (bookId: string): boolean => {
    return isFavorite(bookId);
  };

  const refreshFavorites = () => {
    const favs = getFavorites();
    setFavorites(favs);
  };

  // Evitar problemas de hidratação retornando valores consistentes no primeiro render
  const value = {
    user: mounted ? user : null,
    onboarding: mounted ? onboarding : null,
    recommendations: mounted ? recommendations : [],
    readingPlans: mounted ? readingPlans : [],
    favorites: mounted ? favorites : [],
    isLoading: !mounted || isLoading,
    isAuthenticated: mounted && user !== null,
    onboardingComplete: mounted && onboarding !== null,
    login,
    register,
    logout,
    updateOnboarding,
    updateUser,
    addRecommendation,
    removeRecommendation: removeRecommendationFromUser,
    refreshRecommendations,
    addToReadingPlan,
    isInReadingPlan,
    removeFromReadingPlan,
    refreshReadingPlans,
    toggleFavorite,
    isBookFavorite,
    refreshFavorites,
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
