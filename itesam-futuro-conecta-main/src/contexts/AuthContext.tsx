import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_ADMIN_CREDENTIALS } from "@/config/auth";
import { AuthLoginResponse, AuthUser } from "@/types/auth";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { api } from "@/api/api";

interface LoginPayload {
  email: string;
  senha: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "auth_token"; // você pode usar apiClient.getTokenKey() se quiser

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const avatarUrl = user?.avatarUrl ?? null;

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // if (!storedToken === DEFAULT_ADMIN_CREDENTIALS.token) {
    //   setUser(DEFAULT_ADMIN_CREDENTIALS.user);
    //   setToken(storedToken);
    //   Cookies.set("isAdmin", "true");
    //   setIsLoading(false);
    //   return;
    // }

    try {
      const response = await api.get<AuthUser>("usuario/me.php", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setUser(response.data);
      setToken(storedToken);
      Cookies.set("isAdmin", String(response.data.tipo_usuario === "admin"));
    } catch (error) {
      console.error("Erro ao carregar usuário autenticado", error);
      localStorage.removeItem(TOKEN_KEY);
      Cookies.remove("isAdmin");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const persistAuth = useCallback((authToken: string, authUser: any) => {
    const userData: AuthUser = {
      id: authUser.id,
      nome: authUser.nome,
      avatarUrl: authUser.avatarUrl || authUser.foto_perfil || "",
      perfil: authUser.tipo_usuario.toLowerCase(),
      email: "",
      role: "admin"
    };

    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem("Id", userData.id);
    localStorage.setItem("nome", userData.nome);
    setToken(authToken);
    setUser(userData);
    Cookies.set("isAdmin", String(userData.perfil === "admin"));
  }, []);


  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);

      const sanitizedEmail = payload.email.trim().toLowerCase();
      const isDefaultAdmin =
        sanitizedEmail === DEFAULT_ADMIN_CREDENTIALS.email && payload.senha === DEFAULT_ADMIN_CREDENTIALS.password;

      if (isDefaultAdmin) {
        persistAuth(DEFAULT_ADMIN_CREDENTIALS.token, DEFAULT_ADMIN_CREDENTIALS.user);
        toast.success("Bem-vindo(a) de volta!");
        navigate("/admin/visao");
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.post<AuthLoginResponse>("http://localhost/its-api/api/usuario/login.php", {
          email: payload.email,
          senha: payload.senha,
        });

        persistAuth(response.data.user.token, response.data.user);
        toast.success("Bem-vindo(a) de volta!");

        if (response.data.user.tipo_usuario.toLowerCase() === "admin") {
          navigate("/admin/visao");
        } else {
          navigate("/");
        }
      } catch (error) {
        toast.error("Credenciais inválidas");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, persistAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    Cookies.remove("isAdmin");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const refresh = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      avatarUrl,
      isAdmin: Cookies.get("isAdmin") === "true",
      login,
      logout,
      refresh,
    }),
    [user, token, isLoading, avatarUrl, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  return context;
};
