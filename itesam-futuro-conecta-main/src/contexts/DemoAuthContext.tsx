import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface DemoUser {
  name: string;
  email: string;
  phone: string;
  address?: string;
  avatarUrl?: string;
}

interface DemoAuthContextValue {
  user: DemoUser | null;
  login: (overrides?: Partial<DemoUser>) => void;
  logout: () => void;
  updateUser: (updates: Partial<DemoUser>) => void;
}

const STORAGE_KEY = "demo-auth-user";

export const demoUserProfile: DemoUser = {
  name: "Ana Beatriz Souza",
  email: "ana.souza@exemplo.com",
  phone: "+55 (92) 90000-0000",
  address: "Rua das Flores, 123 - Manaus/AM",
  avatarUrl: "https://i.pravatar.cc/150?img=47",
};

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(undefined);

export const DemoAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as DemoUser;
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao carregar usuário da demonstração", error);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (overrides?: Partial<DemoUser>) => {
    const nextUser = { ...demoUserProfile, ...overrides };
    setUser(nextUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<DemoUser>) => {
    setUser((previousUser) => {
      if (!previousUser) {
        return previousUser;
      }

      const nextUser = { ...previousUser, ...updates };
      return nextUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
    }),
    [user],
  );

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
};

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);

  if (!context) {
    throw new Error("useDemoAuth deve ser utilizado dentro de um DemoAuthProvider");
  }

  return context;
};
