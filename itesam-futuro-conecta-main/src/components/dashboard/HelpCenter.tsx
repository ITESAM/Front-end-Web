import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HelpCircle, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationShortcuts = [
  {
    combo: ["Alt", "1"],
    label: "Visão geral",
    path: "admin/visao",
    description:
      "Acompanhe indicadores principais da instituição, metas e próximos passos prioritários.",
  },
  {
    combo: ["Alt", "2"],
    label: "Postagens",
    path: "admin/postagens",
    description:
      "Crie comunicados para voluntários e comunidade, organize campanhas e acompanhe o engajamento.",
  },
  {
    combo: ["Alt", "3"],
    label: "Formulários",
    path: "admin/formularios",
    description:
      "Configure formulários para inscrições, avaliações e registros importantes da operação.",
  },
  {
    combo: ["Alt", "4"],
    label: "Voluntários",
    path: "admin/voluntarios",
    description:
      "Gerencie a base de voluntários, atualize status de participação e acompanhe disponibilidade.",
  },
  {
    combo: ["Alt", "5"],
    label: "Galeria",
    path: "admin/galeria",
    description:
      "Centralize fotos e materiais visuais dos projetos para facilitar divulgações futuras.",
  },
  {
    combo: ["Alt", "6"],
    label: "Perfil",
    path: "admin/perfil",
    description:
      "Revise suas informações pessoais, notificações e preferências da conta.",
  },
  {
    combo: ["Alt", "7"],
    label: "Configurações",
    path: "admin/configuracoes",
    description:
      "Ajuste permissões de acesso, integrações e parâmetros gerais da plataforma.",
  },
  {
    combo: ["Alt", "8"],
    label: "Pedidos de Ajuda",
    path: "admin/ajuda",
    description:
      "Visualize, filtre e responda às solicitações de ajuda registradas pela comunidade.",
  },
  {
    combo: ["Alt", "9"],
    label: "Suporte",
    path: "admin/suporte",
    description:
      "Consulte a base de conhecimento e encontre orientações rápidas para dúvidas frequentes.",
  },
] as const;

const utilityShortcuts = [
  {
    combo: ["Ctrl", "/"],
    altCombo: ["⌘", "/"],
    description: "Abrir ou fechar este painel de ajuda de qualquer lugar da plataforma.",
  },
  {
    combo: ["Alt", "H"],
    description: "Ir diretamente para a página Pedidos de Ajuda.",
  },
  {
    combo: ["Esc"],
    description: "Fechar o painel de ajuda quando estiver aberto.",
  },
] as const;

const interactiveTags = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

const ShortcutKeys = ({ keys }: { keys: readonly string[] }) => {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {keys.map((key, index) => (
        <kbd
          key={`${key}-${index}`}
          className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase text-foreground shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
};

export const HelpCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navigationByKey = useMemo(() => {
    const entries = navigationShortcuts.map((shortcut) => [shortcut.combo[1], shortcut.path]);
    return Object.fromEntries(entries) as Record<string, string>;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (interactiveTags.has(target.tagName) || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (event.key === "Escape" && open) {
        setOpen(false);
        return;
      }

      if (isTypingTarget) {
        return;
      }

      if (event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        if (event.key.toLowerCase() === "h") {
          event.preventDefault();
          navigate("/ajuda");
          return;
        }

        const path = navigationByKey[event.key];
        if (path) {
          event.preventDefault();
          navigate(path);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, navigationByKey, open]);

  const closeAndNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg transition hover:shadow-xl"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm font-semibold">Ajuda</span>
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
              /
            </kbd>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-6 overflow-hidden px-0 sm:max-w-lg"
      >
        <SheetHeader className="px-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            Central de atalhos e ajuda
          </SheetTitle>
          <SheetDescription>
            Utilize os atalhos abaixo para navegar rapidamente e descubra onde
            executar as principais tarefas do sistema.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 pb-10">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Atalhos de navegação
            </h3>
            <p className="text-sm text-muted-foreground">
              Acesse áreas estratégicas com uma combinação de teclas. Os atalhos
              usam a tecla <strong>Alt</strong> acompanhada de um número.
            </p>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut) => {
                const isActive = location.pathname === shortcut.path;
                return (
                  <button
                    key={shortcut.path}
                    type="button"
                    onClick={() => closeAndNavigate(shortcut.path)}
                    className={cn(
                      "flex w-full items-start justify-between gap-4 rounded-lg border p-4 text-left transition",
                      isActive
                        ? "border-primary/40 bg-primary/5"
                        : "hover:border-primary/30 hover:bg-muted"
                    )}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {shortcut.label}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {shortcut.description}
                      </p>
                    </div>
                    <ShortcutKeys keys={shortcut.combo} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Comandos rápidos
            </h3>
            <p className="text-sm text-muted-foreground">
              Combine as teclas a seguir para abrir esta central ou chegar aos
              pedidos de ajuda imediatamente.
            </p>
            <ul className="space-y-2">
              {utilityShortcuts.map((shortcut, index) => (
                <li
                  key={`${shortcut.description}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShortcutKeys keys={shortcut.combo} />
                    {shortcut.altCombo ? (
                      <>
                        <span className="text-xs text-muted-foreground">ou</span>
                        <ShortcutKeys keys={shortcut.altCombo} />
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

