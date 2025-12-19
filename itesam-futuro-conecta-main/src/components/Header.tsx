import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Facebook, Menu, X, Search, Instagram, Phone, Mail } from "lucide-react";
import { TikTokIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoItesam from "@/assets/logo-itesam.svg";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/contexts/AuthContext";

const INSTITUTE_ACRONYM = "ITESAM";
const INSTITUTE_FULL_NAME = "Instituto de Tecnologia, Ensino e Saúde da Amazônia";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [commandValue, setCommandValue] = useState("");
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Quem Somos", path: "/quem-somos" },
    { name: "Galeria", path: "/galeria" },
    { name: "Notícias", path: "/noticias" },
    { name: "Contato", path: "/contato" },
    { name: "Mapa do Site", path: "/mapa-do-site" },
    { name: "Seja Voluntário", path: "/voluntariado" },
  ];

  const { user, logout, isAdmin } = useAuth();


  const quickActions = [
    {
      name: "Quero ser voluntário",
      path: "/voluntariado",
      description: "Junte-se à nossa rede de apoio e faça a diferença.",
    },
    {
      name: "Fale conosco",
      path: "/contato",
      description: `Entre em contato com a equipe do Instituto ${INSTITUTE_ACRONYM}.`,
    },
    ...(user
      ? [
        {
          name: "Abrir configurações",
          path: "/configuracoes",
          description: "Atualize os dados do seu perfil fictício.",
        },
      ]
      : [
        {
          name: "Faça login",
          path: "/login",
          description: "Acesse sua conta para acompanhar seus atendimentos.",
        },
      ]),
  ];

  const isActive = (path: string) => location.pathname === path;

  const updateHeaderHeight = () => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  };

  const openSearch = (initialQuery = "") => {
    setCommandValue(initialQuery);
    setIsMenuOpen(false);
    setIsSearchOpen(true);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  useLayoutEffect(() => {
    updateHeaderHeight();

    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const animation = requestAnimationFrame(updateHeaderHeight);

    return () => cancelAnimationFrame(animation);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || event.key === "/") {
        event.preventDefault();
        openSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      setCommandValue("");
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearchInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openSearch();
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openSearch(event.key);
    }
  };

  const userAvatar = user?.avatarUrl?.trim();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const userInitials = user ? getInitials(user.nome) : "US";

  const firstName = user ? user.nome.split(" ")[0] : "";

  const handleLogout = () => {
    logout();
    handleNavigate("/login");
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        {/* Utility Bar */}
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container mx-auto px-4 py-2 text-xs md:text-sm text-foreground/70 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a href="tel:+559292729631" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                +55 (92) 99272-9631
              </a>
              <a
                href="mailto:contato@itesam.org.br"
                className="hidden sm:flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                contato@itesam.org.br
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-foreground/60">Siga nossas redes</span>
              <div className="flex items-center gap-2 text-primary">
                <a
                  href="https://www.facebook.com/profile.php?id=61581223787205"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://www.instagram.com/instituto_itesam?igsh=amh0ZHVveXA1bG04&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.tiktok.com/@instituto_itesam?_t=ZM-90MJQmzhrVz&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/559292729631"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Bar */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo and Name */}
            <Link
              to="/"
              className="flex items-center gap-4 flex-shrink-0"
              aria-label={`${INSTITUTE_ACRONYM} - ${INSTITUTE_FULL_NAME}`}
              title={`${INSTITUTE_ACRONYM} - ${INSTITUTE_FULL_NAME}`}
            >
              <div className="bg-white rounded-2xl p-3 shadow-[0_10px_30px_-15px_rgba(24,64,149,0.6)] ring-1 ring-primary/10">
                <img
                  src={logoItesam}
                  alt={`Logo ${INSTITUTE_ACRONYM} - ${INSTITUTE_FULL_NAME}`}
                  loading="eager"
                  decoding="async"
                  className="h-16 w-auto object-contain md:h-14"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span
                  className="text-lg font-semibold tracking-wide sm:text-xl lg:text-2xl"
                  style={{ color: "#2E338C" }}
                >
                  Cuidado e acolhimento
                </span>
              </div>


            </Link>

            {/* Search and Actions */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
              <div className="relative w-full max-w-xs">
                <Input
                  type="search"
                  placeholder="Buscar no portal (Ctrl + K)"
                  className="w-full cursor-pointer bg-white/60 border-border text-foreground placeholder:text-foreground/50 focus:bg-white"
                  onFocus={() => openSearch()}
                  onClick={() => openSearch()}
                  onKeyDown={handleSearchInputKeyDown}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => openSearch()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label="Abrir busca"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              <Button
                variant="hero"
                size="sm"
                className="hidden lg:inline-flex shadow-lg shadow-primary/20"
                asChild
              >
                <Link to="/voluntariado">Quero ser voluntário</Link>
              </Button>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-label="Abrir menu do usuário"
                    >
                      <div className="hidden lg:flex flex-col items-end leading-tight">
                        <span className="text-sm font-semibold text-foreground">{user.name}</span>
                        <span className="text-xs text-muted-foreground">Meu painel</span>
                      </div>
                      <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                        <AvatarImage src={`https://itesam.org.br/api/${userAvatar}`} alt={`Avatar de ${user.name}`} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Mostra o Dashboard apenas se for admin */}
                    {user.tipo_usuario === "admin" && (
                      <DropdownMenuItem onSelect={() => handleNavigate("/admin/visao")}>
                        Dashboard
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onSelect={() => handleNavigate("/configuracoes")}>
                      Meu Perfil / Configurações
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => handleNavigate("/")}>
                      Página Inicial
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="text-destructive focus:text-destructive"
                    >
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md border border-border text-primary hover:bg-primary/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Alternar menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Navigation Bar - Desktop */}
        <div className="border-t border-b border-primary/10 bg-background">
          <div className="container mx-auto px-4">
            <nav className="hidden md:flex items-center justify-between h-14">
              <div className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-3 text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                      ? "text-primary"
                      : "text-foreground/70 hover:text-primary"
                      }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {isActive(item.path) && (
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-1 block h-1 w-8 rounded-full bg-primary/80" />
                    )}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {user ? (
                  <span className="hidden lg:inline text-sm font-medium text-primary/80">Olá, {firstName}!</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                    asChild
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 border-t border-primary/10">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2 mb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar no portal (Ctrl + K)"
                    className="w-full cursor-pointer bg-white border-border text-foreground placeholder:text-foreground/50"
                    onFocus={() => openSearch()}
                    onClick={() => openSearch()}
                    onKeyDown={handleSearchInputKeyDown}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => openSearch()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    aria-label="Abrir busca"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                        <AvatarImage src={userAvatar || undefined} alt={`Avatar de ${user.name}`} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full" asChild>
                      <Link to="/configuracoes">Meu Perfil / Configurações</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/40 text-primary hover:bg-primary/10"
                    asChild
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                )}
                <Button variant="hero" size="sm" className="w-full" asChild>
                  <Link to="/voluntariado">Quero ser voluntário</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
        <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <CommandInput
            value={commandValue}
            onValueChange={setCommandValue}
            placeholder="Buscar por páginas e ações"
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Navegação principal">
              {navItems.map((item) => (
                <CommandItem key={item.path} value={`${item.name} ${item.path}`} onSelect={() => handleNavigate(item.path)}>
                  <span className="font-medium">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Ações rápidas">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.path}
                  value={`${action.name} ${action.path}`}
                  onSelect={() => handleNavigate(action.path)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{action.name}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </header>
      <div aria-hidden="true" style={{ height: headerHeight }} />
    </>
  );
};

export default Header;
