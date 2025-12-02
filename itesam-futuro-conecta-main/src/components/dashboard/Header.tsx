import { useEffect, useState } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Clock,
  LogOut,
  LifeBuoy,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/api/api";

const notificacoes = [
  { id: 1, titulo: "Novo formulário recebido", descricao: "João Silva enviou um formulário", tempo: "há 5 min", lida: false },
  { id: 2, titulo: "Imagem aprovada", descricao: "A imagem 'Evento 2024' foi aprovada", tempo: "há 1 hora", lida: false },
  { id: 3, titulo: "Comentário em postagem", descricao: "Maria comentou em 'Novidades'", tempo: "há 2 horas", lida: true },
  { id: 4, titulo: "Backup concluído", descricao: "Backup automático realizado com sucesso", tempo: "há 3 horas", lida: true },
];

const mensagens = [
  { id: 1, nome: "Rafaella Santos", mensagem: "Olá! Preciso de ajuda com...", tempo: "há 10 min", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rafaella" },
  { id: 2, nome: "Vítor Costa", mensagem: "As imagens já foram processadas", tempo: "há 30 min", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vitor" },
  { id: 3, nome: "Pedro Oliveira", mensagem: "Obrigado pelo suporte!", tempo: "há 1 hora", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro" },
];

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);
  const [errorNotificacoes, setErrorNotificacoes] = useState(null);

  const mensagens = [
    {
      id: 1,
      nome: "Rafaella Santos",
      mensagem: "Olá! Preciso de ajuda com...",
      tempo: "há 10 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rafaella",
    },
    {
      id: 2,
      nome: "Vítor Costa",
      mensagem: "As imagens já foram processadas",
      tempo: "há 30 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vitor",
    },
    {
      id: 3,
      nome: "Pedro Oliveira",
      mensagem: "Obrigado pelo suporte!",
      tempo: "há 1 hora",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro",
    },
  ];

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  async function marcarComoLida(id: number) {
    await fetch(`/api/notificacoes/marcar-como-lida.php?id=${id}`, {
      method: 'PUT',
    });
    atualizarNotificacoes(); // atualiza a lista no front
  }

  // Buscar notificações do usuário logado
  useEffect(() => {
    const fetchNotificacoes = async () => {
      if (!user?.id) return;

      setLoadingNotificacoes(true);
      setErrorNotificacoes(null);

      try {
        const res = await api.get("notificacoes/get.php", {
          params: { usuario_id: user.id },
        });

        if (res.data.success) {
          setNotificacoes(
            res.data.notificacoes.map((n) => ({
              id: n.id,
              titulo: n.tipo === "sucesso" ? "Sucesso" :
                n.tipo === "alerta" ? "Alerta" :
                  n.tipo === "aviso" ? "Aviso" : "Informação",
              descricao: n.mensagem,
              tempo: new Date(n.criada_em).toLocaleString("pt-BR"),
              lida: !!n.lida,
            }))
          );
        } else {
          setErrorNotificacoes(res.data.message || "Erro ao carregar notificações.");
        }
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
        setErrorNotificacoes("Erro ao conectar ao servidor.");
      } finally {
        setLoadingNotificacoes(false);
      }
    };

    fetchNotificacoes();
  }, [user?.id]);

  // Atualizar o campo de busca
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") ?? "";
    setSearchTerm(query);
  }, [location.search]);

  const handleSearch = () => {
    const params = new URLSearchParams(location.search);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* 🔍 Campo de busca */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar formulário, imagem ou tag..."
            className="pl-10 pr-24 bg-background"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            variant="secondary"
            onClick={handleSearch}
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* 🔔 Notificações e perfil */}
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notificacoesNaoLidas > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              {notificacoesNaoLidas > 0 && (
                <Badge variant="secondary">{notificacoesNaoLidas} novas</Badge>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loadingNotificacoes ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Carregando notificações...
                </p>
              ) : errorNotificacoes ? (
                <p className="p-4 text-sm text-destructive text-center">
                  {errorNotificacoes}
                </p>
              ) : notificacoes.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Nenhuma notificação.
                </p>
              ) : (
                notificacoes.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${!notif.lida ? "bg-muted/30" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.lida ? "bg-primary" : "bg-transparent"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notif.titulo}</p>
                        <p className="text-sm text-muted-foreground">
                          {notif.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notif.tempo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-border">
              <Button variant="ghost" className="w-full" size="sm">
                Ver todas as notificações
              </Button>
            </div>
          </PopoverContent>
        </Popover>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={`https://itesam.org.br/api/${user?.avatarUrl ?? "Admin"}`} />
                <AvatarFallback>{user?.nome?.slice(0, 2).toUpperCase() ?? "AD"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.nome ?? "Administrador"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? "---"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => navigate('../../')}>
              Site Institucional
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/perfil')}>
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header >
  );
};
