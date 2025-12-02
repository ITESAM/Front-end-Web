import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, UserPlus, UserMinus, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "@/api/api";

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  visualizador: "Visualizador",
};

const Configuracoes = () => {
  const queryClient = useQueryClient();
  const { isAdmin, user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("q") ?? "";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchFromUrl);

  // 🔹 Requisição para buscar usuários
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", { page, search }],
    queryFn: async () => {
      const response = await api.get("/usuario/get_users.php", {
        params: { page: String(page), perPage: "10", q: search || undefined },
      });
      if (!response.data.status) {
        throw new Error("Erro ao carregar usuários");
      }
      return response.data;
    },
    keepPreviousData: true,
  });

  const users = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  useEffect(() => {
    setSearch(searchFromUrl);
    setPage(1);
  }, [searchFromUrl]);

  // 🔹 Mutations para atualizar permissões
  const promoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("role", "admin");
      formData.append("updatedBy", user?.nome ?? "Administrador");

      const response = await api.post("/usuario/update_status_usuario.php", formData);
      if (!response.data.status) throw new Error("Falha ao promover usuário");
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Permissão de administrador concedida");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("role", "usuario");
      formData.append("updatedBy", user?.nome ?? "Administrador");

      const response = await api.post("/usuario/update_status_usuario.php", formData);
      if (!response.data.status) throw new Error("Falha ao revogar usuário");
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Permissão de administrador removida");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleChangeRole = (action: "promote" | "revoke", id: string) => {
    if (!isAdmin) {
      toast.error("Somente administradores podem alterar permissões");
      return;
    }

    if (action === "promote") {
      toast.promise(promoteMutation.mutateAsync(id), {
        loading: "Atualizando permissões...",
        success: "Usuário promovido com sucesso",
        error: "Não foi possível atualizar",
      });
    } else {
      toast.promise(revokeMutation.mutateAsync(id), {
        loading: "Removendo privilégios...",
        success: "Permissão removida com sucesso",
        error: "Não foi possível atualizar",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">
          Usuários e permissões
        </h1>
        <p className="text-muted-foreground">
          Controle os papéis de acesso e acompanhe o histórico de alterações da
          equipe.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Controle de acesso
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualize os usuários autorizados e gerencie permissões
              administrativas.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="users-search">Busca</Label>
            <Input
              id="users-search"
              placeholder="Pesquisar por nome ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setPage(1);
                }
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ajuste a busca ou convide novos membros para o painel
                administrativo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Último acesso</TableHead>
                    <TableHead>Última alteração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.nome}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {roleLabel[member.role] ?? member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.ultimoAcesso
                          ? formatDistanceToNow(
                              new Date(member.ultimoAcesso),
                              { addSuffix: true, locale: ptBR }
                            )
                          : "Nunca"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {member.atualizadoEm
                          ? `${formatDistanceToNow(
                              new Date(member.atualizadoEm),
                              { addSuffix: true, locale: ptBR }
                            )} por ${member.atualizadoPor ?? "---"}`
                          : "Sem histórico"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            //disabled={!isAdmin || promoteMutation.isPending}
                            onClick={() =>
                              handleChangeRole("promote", member.id)
                            }
                          >
                            <UserPlus className="h-4 w-4" /> Tornar admin
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-destructive"
                            //disabled={!isAdmin || revokeMutation.isPending}
                            onClick={() =>
                              handleChangeRole("revoke", member.id)
                            }
                          >
                            <UserMinus className="h-4 w-4" /> Remover admin
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {users.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {data?.meta?.page ?? 1} de {totalPages} —{" "}
                {data?.meta?.totalItems ?? users.length} usuários
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
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      aria-disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          {isFetching && !isLoading && (
            <p className="text-xs text-muted-foreground">Atualizando lista...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
