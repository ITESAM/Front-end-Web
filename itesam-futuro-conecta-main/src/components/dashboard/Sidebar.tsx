import { NavLink } from "react-router-dom";
import {
  FileText,
  Image,
  BarChart3,
  HelpCircle,
  LogOut,
  Layers,
  Newspaper,
  Users,
  HandHeart,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Visão", href: "visao", icon: BarChart3 },
  { name: "Formulários", href: "formularios", icon: FileText },
  { name: "Voluntários", href: "voluntarios", icon: HandHeart },
  { name: "Postagens", href: "postagens", icon: Newspaper },
  { name: "Galeria", href: "galeria", icon: Image },
];

const general = [
  { name: "Usuários & Permissões", href: "configuracoes", icon: Users },
];

const support = [
  { name: "Pedidos de Ajuda", href: "ajuda", icon: HelpCircle },
  { name: "Central de Suporte", href: "suporte", icon: LifeBuoy },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-primary">ITESAM</span>
            <span className="text-xs text-muted-foreground">Painel Institucional</span>
          </div>
        </div>
        {user && (
          <div className="mt-4 rounded-lg border border-border bg-sidebar-accent/40 p-3 text-xs text-sidebar-foreground">
            <p className="font-semibold text-sm">{user.nome}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 inline-flex items-center rounded bg-sidebar-accent px-2 py-1 text-[10px] uppercase tracking-wide text-sidebar-primary">
              {user.role}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Gerenciamento</div>
          {general.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Suporte</div>
          {support.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};
