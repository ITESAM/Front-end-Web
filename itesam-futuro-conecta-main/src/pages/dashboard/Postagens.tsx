import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id, ptBR } from "date-fns/locale";
import {
  PenSquare,
  FilePenLine,
  Archive,
  Rocket,
  CircleDot,
  Eye,
  Heart,
  User,
  Search,
  Plus,
  Clock3,
  Pencil,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/api/api";
import { PostRecord, PaginatedResult } from "@/types/entities";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { PostEditor, PostEditorValue } from "@/components/dashboard/postagens/PostEditor";

// 🧩 Helpers
export interface Categoria {
  id?: number;
  nome: string;
}

export interface Subcategoria {
  id: number;
  nome: string;
  categoria_id: number;
}

// Funções auxiliares
const formatDate = (date?: string) =>
  date ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "--";

const buildParams = ({
  page,
  status,
  search,
}: {
  page: number;
  status?: string;
  search?: string;
}) => ({
  page: String(page),
  perPage: "10",
  status,
  q: search,
});

// Categorias padrão
const categoriasPadrao: Categoria[] = [
  { nome: "Institucional", id: 0 },
  { nome: "Eventos", id: 1 },
  { nome: "Avisos", id: 2 },
  { nome: "Comunicados", id: 3 },
];

// Status
const statusLabels = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  publicado: "Publicado",
  arquivado: "Arquivado",
} as const;

const formatStatusLabel = (status: string) =>
  statusLabels[status as keyof typeof statusLabels] ?? status;

const Postagens = () => {
  const queryClient = useQueryClient();
  const { isAdmin, user } = useAuth();
  const [searchParams] = useSearchParams();

  const searchFromUrl = searchParams.get("q") ?? "";
  const [subcategoriasList, setSubcategoriasList] = useState<Subcategoria[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState(searchFromUrl);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostEditorValue | null>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [meta, setMeta] = useState({
    page: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // 🔹 Busca subcategorias
  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const res = await api.get("subcategoria/get_categoria_subcategoria.php");
        if (res.data?.status) {
          setSubcategoriasList(res.data.data);
        }
      } catch (err) {
        console.error("Erro ao buscar subcategorias:", err);
      }
    };
    fetchSubcategorias();
  }, []);

  const params = useMemo(
    () =>
      buildParams({
        page,
        status: statusFilter && statusFilter !== "  " ? statusFilter : undefined,
        search: search || searchFromUrl || undefined,
      }),
    [page, statusFilter, search, searchFromUrl]
  );

  // 🔥 Query principal (postagens + categorias + subcategorias)
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["posts", params],
    queryFn: async () => {
      try {
        const [postsRes, categoriasRes, subcategoriasRes] = await Promise.all([
          api.get("postagens/get_list_postagens.php", {
            params: { user_id: localStorage.getItem("Id") ?? 1, ...params },
          }),
          api.get("categoria/get_list_categoria.php"),
          api.get("subcategoria/get_categoria_subcategoria.php"),
        ]);

        const payload = postsRes.data;
        const posts = payload?.status && Array.isArray(payload.data) ? payload.data : [];

        const meta = {
          page: Number(payload.page ?? 1),
          perPage: Number(payload.perPage ?? 10),
          totalItems: Number(payload.totalItems ?? posts.length),
          totalPages: Number(payload.totalPages ?? Math.max(1, Math.ceil(posts.length / 10))),
        };

        const categorias =
          categoriasRes.data?.status && Array.isArray(categoriasRes.data.data)
            ? categoriasRes.data.data
            : categoriasPadrao;

        const subcategorias =
          subcategoriasRes.data?.status && Array.isArray(subcategoriasRes.data.data)
            ? subcategoriasRes.data.data
            : [];

        // 🔗 Adiciona categoria e subcategoria ao post
        const postsComCategoria = posts.map((post: any) => {
          const categoria = categorias.find((cat) => cat.id === post.categoria_id);
          const subcategoria = subcategorias.find((sub) => sub.id === post.subcategoria_id);
          return {
            ...post,
            categoria_nome: categoria?.nome ?? "Sem categoria",
            subcategoria_nome: subcategoria?.nome ?? "Sem subcategoria",
          };
        });

        return {
          data: postsComCategoria,
          meta,
          categorias,
          subcategorias,
          metrics: payload.metrics ?? {},
        };
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
        toast.error("Erro ao carregar postagens. Tente novamente mais tarde.");
        return {
          data: [],
          meta: { page: 1, perPage: 10, totalItems: 0, totalPages: 1 },
          categorias: categoriasPadrao,
          subcategorias: [],
          metrics: {},
        };
      }
    },
  });

  // 🔁 Atualiza métricas e metadados
  useEffect(() => {
    if (data) {
      setMetrics(data.metrics ?? {});
      setMeta(data.meta);
    }
  }, [dataUpdatedAt]);

  // Slugs
  const { data: allPostsData } = useQuery({
    queryKey: ["posts", "slugs"],
    queryFn: async () => {
      const resp = await api.get("postagens/get_list_postagens.php", {
        params: { user_id: user?.id ?? 1, page: 1, perPage: 200 },
      });
      const payload = resp.data;
      const posts = payload?.status && Array.isArray(payload.data) ? payload.data : [];
      return { data: posts };
    },
  });

  const posts = data?.data ?? [];
  const categorias = data?.categorias ?? categoriasPadrao;
  const totalPages = data?.meta?.totalPages ?? 1;

  const existingSlugs = useMemo(() => {
    const values = ((allPostsData as any)?.data ?? [])
      .map((item: any) => item.slug)
      .filter((s: any) => Boolean(s));
    return Array.from(new Set(values));
  }, [allPostsData]);

  const openEditor = (post?: PostRecord) => {
    setEditingPost(post ?? null);
    setIsEditorOpen(true);
  };

  // 🧩 handleSavePost atualizado para enviar FormData (com imagem)
  const handleSavePost = async (payload: PostEditorValue, file?: File | null) => {

    try {
      const formData = new FormData();
      
      formData.append("titulo", payload.titulo ?? "");
      formData.append("subtitulo", payload.descricaoCurta ?? payload.titulo ?? "");
      formData.append("descricao", payload.conteudo ?? "");
      formData.append("resumo", payload.descricaoCurta ?? "");
      formData.append("status", payload.status ?? "rascunho");
      formData.append("responsavel", payload.responsavel ?? "");
      formData.append("categoria_id", String(payload.categoria ?? 1));
      formData.append("subCategoria_id", String(payload.subcategoria ?? 1));
      formData.append("bloco_especial", payload.blocosEspeciais ?? "");
      formData.append("fonte_referencia", payload.fonte ?? "");
      formData.append("url_personalizada", payload.slug ?? "");
      formData.append("imagem_alt", payload.altImagem ?? "");
      formData.append("criado_por", localStorage.getItem('Id'));

      if (payload.tags && payload.tags.length > 0) {
        formData.append("tags", JSON.stringify(payload.tags));
      }

      if (payload.agendamentoPublicacao) {
        formData.append("agendar_publicacao", payload.agendamentoPublicacao);
      }

      if (file) {
        formData.append("imagem", file);
      }

      if (payload.id) {
        formData.append("id", String(payload.id));
      }

      const endpoint = payload.id
        ? "postagens/put_editar_postagem.php"
        : "postagens/post_postagem.php";

      await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Postagem salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
      setIsEditorOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar postagem.");
    }
  };

  const patchStatus = useMutation({
    mutationFn: async (args: { id: number; status: string }) => {
      const response = await api.post("postagens/patch_status_postagens.php", args);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status.");
    },
  });

  const handleStatusChange = (id: number, status: string, message: string) => {
    toast.promise(patchStatus.mutateAsync({ id, status }), {
      loading: message,
      success: "Status atualizado!",
      error: "Erro ao atualizar status",
    });
  };

  // 🔹 Função para deletar postagem
  const handleDeletePost = async (postId: number) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar esta postagem?");
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`postagens/delete_post_id.php?id=${postId}`, {
        method: "DELETE",
        params: { id: postId }
      });

      const data = await res;

      if (data.status) {
        alert("Postagem deletada com sucesso!");
        // Atualiza a lista de posts, pode ser refetch ou remover do state
        // Exemplo simples usando refetch:
        window.location.reload();
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar postagem.");
    }
  };

  // ----------------------------------------
  // 🔽 Layout principal
  // ----------------------------------------
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Postagens</h1>
          <p className="text-muted-foreground">Gerencie o conteúdo publicado e organize rascunhos.</p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Postagem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Publicadas" value={metrics.publicado ?? 0} icon={Rocket} iconColor="bg-success" sparkline={[]} />
        <StatCard title="Rascunhos" value={metrics.rascunho ?? 0} icon={CircleDot} iconColor="bg-warning" sparkline={[]} />
        <StatCard title="Em revisão" value={metrics.em_revisao ?? 0} icon={Clock3} iconColor="bg-blue-500" sparkline={[]} />
        <StatCard title="Arquivadas" value={metrics.arquivado ?? 0} icon={Archive} iconColor="bg-muted-foreground" sparkline={[]} />
        <StatCard title="Visualizações" value={metrics.visualizacoes ?? 0} icon={Eye} iconColor="bg-primary" sparkline={[]} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Lista de postagens</CardTitle>
            <p className="text-sm text-muted-foreground">Atualize o status e edite o conteúdo diretamente pelo painel.</p>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter ?? "todos"}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="todos">
                Todos ({metrics?.total ?? 0})
              </option>
              <option value="rascunho">
                Rascunhos ({metrics?.rascunho ?? 0})
              </option>
              <option value="em_revisao">
                Em revisão ({metrics?.em_revisao ?? 0})
              </option>
              <option value="publicado">
                Publicados ({metrics?.publicado ?? 0})
              </option>
              <option value="arquivado">
                Arquivados ({metrics?.arquivado ?? 0})
              </option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PenSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma postagem encontrada</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Utilize os filtros ou cadastre uma nova postagem para manter o público informado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Curtidas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post: any) => (
                    <TableRow key={post.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{post.titulo}</TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-1">
                        <User className="h-4 w-4" /> {post.criado_por}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{post.categoria_nome ?? "--"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(post.criado_em ?? post.criadoEm)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{formatStatusLabel(post.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4" />
                          {post.qtdVisualizacoes ?? post.visualizacoes ?? 0}
                        </div>
                      </TableCell>

                      <TableCell className="text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="h-4" />
                          {post.qtdLikes ?? post.curtidas ?? 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FilePenLine className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditor(post)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>

                            {post.status === "rascunho" && (
                              <DropdownMenuItem
                                onSelect={() => handleStatusChange(post.id, "publicado", "Publicando postagem...")}
                              >
                                <Rocket className="w-4 h-4 mr-2" />
                                Publicar
                              </DropdownMenuItem>
                            )}

                            {post.status === "publicado" && (
                              <DropdownMenuItem
                                onSelect={() => handleStatusChange(post.id, "em_revisao", "Enviando para revisão...")}
                              >
                                <Clock3 className="w-4 h-4 mr-2" />
                                Enviar para revisão
                              </DropdownMenuItem>
                            )}

                            {post.status === "em_revisao" && (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => handleStatusChange(post.id, "publicado", "Publicando postagem...")}
                                >
                                  <Rocket className="w-4 h-4 mr-2" />
                                  Publicar
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() => handleStatusChange(post.id, "arquivado", "Arquivando postagem...")}
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  Arquivar
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* 🔹 NOVO ITEM DE EXCLUSÃO */}
                            <DropdownMenuItem onSelect={() => handleDeletePost(post.id)}>
                              <Trash className="w-4 h-4 mr-2 text-red-500" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {posts.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {(data as any)?.meta?.page ?? 1} de {totalPages} — {(data as any)?.meta?.totalItems ?? posts.length} postagens
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      aria-disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          {isFetching && !isLoading && <p className="text-xs text-muted-foreground">Atualizando dados...</p>}
        </CardContent>
      </Card>

      <PostEditor
        open={isEditorOpen}
        onOpenChange={(open) => {
          setIsEditorOpen(open);
          if (!open) {
            setEditingPost(null);
          }
        }}
        post={editingPost}
        onSave={handleSavePost}
        categorias={categorias}
        existingSlugs={existingSlugs}
      />
    </div>
  );
};

export default Postagens;