import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🔹 Contextos e provedores
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/dashboard/ProtectedRoute";

// 🔹 Componentes globais
import FloatingNav from "./components/FloatingNav";
import AccessibilityPanel from "./components/AccessibilityPanel";
import { Layout } from "./components/dashboard/Layout";

// 🔹 Páginas do site público
import Index from "./pages/Index";
import QuemSomos from "./pages/QuemSomos";
import GaleriaPublica from "./pages/Galeria";
import Noticias from "./pages/Noticias";
import NewsDetail from "./pages/NewsDetail";
import Contato from "./pages/Contato";
import MapaDoSite from "./pages/MapaDoSite";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Voluntariado from "./pages/Voluntariado";
import ConfiguracoesPublica from "./pages/Configuracoes";
import ForgotPassword from "./pages/ForgotPassword";

// 🔹 Páginas do Dashboard
import Visao from "./pages/dashboard/Visao";
import Postagens from "./pages/dashboard/Postagens";
import Formularios from "./pages/dashboard/Formularios";
import Voluntarios from "./pages/dashboard/Voluntarios";
import Galeria from "./pages/dashboard/Galeria";
import Perfil from "./pages/dashboard/Perfil";
import Configuracoes from "./pages/dashboard/Configuracoes";
import Ajuda from "./pages/dashboard/Ajuda";
import Suporte from "./pages/dashboard/Suporte";
import FormPage from "./pages/dashboard/FormPage";
import Login from "./pages/dashboard/Login";

// 🔹 Configuração do Dashboard
import { dashboardConfig } from "./config/dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

const publicFormRoutes = dashboardConfig.routes
  .filter((route) => route.component === "FormPage" && route.formRef)
  .map((route) => ({
    path: route.path.startsWith("/") ? route.path.slice(1) : route.path,
    formRef: route.formRef!,
  }));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* 🔹 Contextos globais */}
        <AuthProvider>
          <AccessibilityProvider>
            <AccessibilityPanel />
            <FloatingNav />

            {/* 🔹 Rotas principais */}
            <Routes>
              {/* -------------------- SITE PÚBLICO -------------------- */}
              <Route path="/" element={<Index />} />
              <Route path="/quem-somos" element={<QuemSomos />} />
              <Route path="/galeria" element={<GaleriaPublica />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/noticias/:slug" element={<NewsDetail />} />
              <Route path="/voluntariado" element={<Voluntariado />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/mapa-do-site" element={<MapaDoSite />} />
              <Route path="/configuracoes" element={<ConfiguracoesPublica />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />

              {/* -------------------- DASHBOARD -------------------- */}
              <Route path="/admin/*" element={
                  <Routes>
                    <Route path="login" element={<Login />} />

                    {publicFormRoutes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<FormPage formKey={route.formRef} />}
                      />
                    ))}

                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="visao" replace />} />
                        <Route path="visao" element={<Visao />} />
                        <Route path="postagens" element={<Postagens />} />
                        <Route path="formularios" element={<Formularios />} />
                        <Route path="voluntarios" element={<Voluntarios />} />
                        <Route path="galeria" element={<Galeria />} />
                        <Route path="perfil" element={<Perfil />} />
                        <Route path="configuracoes" element={<Configuracoes />} />
                        <Route path="ajuda" element={<Ajuda />} />
                        <Route path="suporte" element={<Suporte />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
              } />

              {/* -------------------- ROTA PADRÃO -------------------- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AccessibilityProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
