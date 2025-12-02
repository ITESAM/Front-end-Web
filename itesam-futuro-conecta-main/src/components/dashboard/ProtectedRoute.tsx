import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // 🔹 Busca os cookies
  const userRole = Cookies.get("isAdmin");
  const usuarioId = Cookies.get("usuario_id");

  // 🔸 Enquanto o contexto carrega, exibe loader
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // 🔸 Verifica autenticação com base no cookie OU no contexto
  const isAdmin = userRole === "true";

  // 🔹 Se não estiver autenticado, volta pro login
  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔹 Se estiver autenticado → renderiza o painel
  return <Outlet />;
};
