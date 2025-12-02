import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  HelpingHand,
  Inbox,
  Clock,
  CheckCircle2,
  Archive,
  Tag,
  Phone,
  Mail,
  CalendarDays,
  ArrowRight,
  LifeBuoy,
  Compass,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { HelpRequestRecord, PaginatedResult } from "@/types/entities";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/dashboard/records/StatusBadge";
import { TagDialog } from "@/components/dashboard/records/TagDialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const formatDate = (date?: string) => {
  if (!date) return "--";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
};

const buildParams = ({
  page,
  status,
  tag,
  search,
  dateRange,
}: {
  page: number;
  status?: string;
  tag?: string;
  search?: string;
  dateRange?: DateRange;
}) => ({
  page: String(page),
  perPage: "10",
  status,
  tag,
  q: search,
  startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
  endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
});

const quickLinks = [
  {
    title: "Visão Geral",
    description: "Confira indicadores em tempo real antes de priorizar os atendimentos do dia.",
    to: "/visao",
    icon: Compass,
  },
  {
    title: "Formulários Recebidos",
    description: "Identifique novos cadastros que podem originar pedidos de suporte.",
    to: "/formularios",
    icon: Sparkles,
  },
  {
    title: "Central de Suporte",
    description: "Acesse guias completos, perguntas frequentes e canais de contato.",
    to: "/suporte",
    icon: LifeBuoy,
  },
];

const Ajuda = () => {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("q") ?? "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState(searchFromUrl);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestRecord | null>(null);
  const [tagModalState, setTagModalState] = useState<{ open: boolean; request: HelpRequestRecord | null }>({
    open: false,
    request: null,
  });

  const params = useMemo(
    () =>
      buildParams({
        page,
        status: statusFilter && statusFilter !== "todos" ? statusFilter : undefined,
        tag: tagFilter && tagFilter !== "todas" ? tagFilter : undefined,
        search: search || searchFromUrl || undefined,
        dateRange,
      }),
    [page, statusFilter, tagFilter, search, searchFromUrl, dateRange]
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["help", params],
    queryFn: () => apiClient.get<PaginatedResult<HelpRequestRecord>>("/help", { params }),
    keepPreviousData: true,
  });

  const metrics = data?.metrics ?? {};
  const requests = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  useEffect(() => {
    setSearch(searchFromUrl);
    setPage(1);
  }, [searchFromUrl]);

  const canExecuteActions = isAdmin;

  const reviewMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient.patch(`/help/${id}`, { status: "em análise", updatedBy: user?.nome }),
    onSuccess: async () => {
      toast.success("Pedido em análise");
      await queryClient.invalidateQueries({ queryKey: ["help"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient.patch(`/help/${id}`, { status: "resolvido", updatedBy: user?.nome }),
    onSuccess: async () => {
      toast.success("Pedido marcado como resolvido");
      await queryClient.invalidateQueries({ queryKey: ["help"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient.patch(`/help/${id}`, { status: "arquivado", updatedBy: user?.nome }),
    onSuccess: async () => {
      toast.success("Pedido arquivado");
      await queryClient.invalidateQueries({ queryKey: ["help"] });
    },
  });

  const tagMutation = useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) =>
      apiClient.patch(`/help/${id}`, { tags, updatedBy: user?.nome }),
    onSuccess: async () => {
      toast.success("Tags atualizadas");
      await queryClient.invalidateQueries({ queryKey: ["help"] });
    },
  });

  const handleActionWithPermission = async (callback: () => Promise<unknown>, loading: string) => {
    if (!canExecuteActions) {
      toast.error("Apenas administradores podem executar esta ação");
      throw new Error("Unauthorized");
    }

    toast.promise(callback(), {
      loading,
      success: "Ação concluída!",
      error: "Não foi possível completar a ação",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">Pedidos de ajuda</h1>
        <p className="text-muted-foreground">
          Monitore solicitações recebidas pela equipe e acompanhe o status de atendimento em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 overflow-hidden border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit gap-2">
                <LifeBuoy className="h-4 w-4" /> Central de conhecimento
              </Badge>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Precisa entender melhor o fluxo de atendimento?</h2>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Acesse nossa Central de Suporte para descobrir o passo a passo completo do dashboard, fluxos sugeridos e
                  respostas para dúvidas recorrentes.
                </p>
              </div>
              <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Orientações por módulo e por papel.
                </li>
                <li className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" /> Rotina sugerida para triagem diária.
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link to="/suporte">Abrir Central de Suporte</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="mailto:suporte@itesam.org">Enviar mensagem</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Atalhos do painel
            </CardTitle>
            <CardDescription>Chegue rapidamente aos módulos que mais conversam com o suporte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickLinks.map((link) => (
              <div key={link.title} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex items-start gap-3">
                  <link.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm text-foreground">{link.title}</p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
                  <Link to={link.to}>
                    Acessar <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total" value={metrics.total ?? 0} icon={Inbox} iconColor="bg-primary" sparkline={[]} />
        <StatCard title="Novos" value={metrics.novos ?? 0} icon={Clock} iconColor="bg-warning" sparkline={[]} />
        <StatCard title="Em análise" value={metrics.emAnalise ?? 0} icon={HelpingHand} iconColor="bg-accent" sparkline={[]} />
        <StatCard title="Resolvidos" value={metrics.resolvidos ?? 0} icon={CheckCircle2} iconColor="bg-success" sparkline={[]} />
        <StatCard title="Arquivados" value={metrics.arquivados ?? 0} icon={Archive} iconColor="bg-muted-foreground" sparkline={[]} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Solicitações registradas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Filtre por status, período ou tag para identificar prioridades e demandas da comunidade.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex gap-2">
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
                  <option value="todos">Todos</option>
                  <option value="novo">Novos</option>
                  <option value="em análise">Em análise</option>
                  <option value="resolvido">Resolvidos</option>
                  <option value="arquivado">Arquivados</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Tag</Label>
                <Input
                  placeholder="Filtrar por tag"
                  value={tagFilter ?? ""}
                  onChange={(event) => {
                    setTagFilter(event.target.value || undefined);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="space-y-1">
                <Label>Período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM", { locale: ptBR })}`
                        ) : (
                          format(dateRange.from, "dd/MM", { locale: ptBR })
                        )
                      ) : (
                        <span>Últimos 30 dias</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        setPage(1);
                      }}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label htmlFor="help-search">Busca</Label>
                <Input
                  id="help-search"
                  placeholder="Nome, e-mail ou necessidade"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setPage(1);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HelpingHand className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum pedido de ajuda</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Os pedidos aparecerão aqui assim que forem enviados pela comunidade.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome completo</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo de ajuda</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <TableCell className="font-medium">{request.nome}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.email ?? (request.contato?.includes("@") ? request.contato : "--")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.telefone ?? (!request.contato?.includes("@") ? request.contato ?? "--" : "--")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.tipoAjuda ?? request.categoriaAjuda ?? "--"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(request.criadoEm)}</TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {request.tags?.length ? (
                            request.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem tags</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                            <Button variant="ghost" size="sm" disabled={!canExecuteActions}>
                              Ações
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              disabled={reviewMutation.isPending || !canExecuteActions}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleActionWithPermission(
                                  () => reviewMutation.mutateAsync(request.id),
                                  "Atualizando status..."
                                );
                              }}
                            >
                              <Clock className="mr-2 h-4 w-4" /> Revisar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={resolveMutation.isPending || !canExecuteActions}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleActionWithPermission(
                                  () => resolveMutation.mutateAsync(request.id),
                                  "Resolvendo pedido..."
                                );
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Resolver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                if (!canExecuteActions) {
                                  toast.error("Apenas administradores podem adicionar tags");
                                  return;
                                }
                                setTagModalState({ open: true, request });
                              }}
                            >
                              <Tag className="mr-2 h-4 w-4" /> Adicionar Tag
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={archiveMutation.isPending || !canExecuteActions}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleActionWithPermission(
                                  () => archiveMutation.mutateAsync(request.id),
                                  "Arquivando pedido..."
                                );
                              }}
                            >
                              <Archive className="mr-2 h-4 w-4" /> Arquivar
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

          {requests.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {data?.meta.page ?? 1} de {totalPages} — {data?.meta.totalItems ?? requests.length} pedidos
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

      <Sheet open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedRequest && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HelpingHand className="h-5 w-5 text-primary" />
                  {selectedRequest.nome}
                </SheetTitle>
                <SheetDescription>
                  Última alteração em {formatDate(selectedRequest.atualizadoEm)} por {selectedRequest.atualizadoPor ?? "---"}
                </SheetDescription>
              </SheetHeader>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumo do pedido</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                  {(() => {
                    const isEmailContact = selectedRequest.contato?.includes("@");
                    const email = selectedRequest.email ?? (isEmailContact ? selectedRequest.contato : undefined);
                    const phone = selectedRequest.telefone ?? (!isEmailContact ? selectedRequest.contato : undefined);

                    return (
                      <>
                        {email && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" /> {email}
                          </p>
                        )}
                        {phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" /> {phone}
                          </p>
                        )}
                        {!email && !phone && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" /> Contato não informado
                          </p>
                        )}
                      </>
                    );
                  })()}
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Enviado em {formatDate(selectedRequest.criadoEm)}
                  </p>
                  <p className="flex items-center gap-2">
                    Status: <StatusBadge status={selectedRequest.status} />
                  </p>
                  <p className="md:col-span-2">
                    <strong>Tipo de ajuda:</strong> {selectedRequest.tipoAjuda ?? selectedRequest.categoriaAjuda ?? "Não informado"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Descrição da necessidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {selectedRequest.descricao ?? selectedRequest.descricaoAjuda ?? "Sem descrição detalhada"}
                  </p>
                </CardContent>
              </Card>

              {selectedRequest.historico?.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Histórico de status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedRequest.historico.map((item, index) => (
                      <div key={`${item.status}-${index}`} className="flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(item.data)}</span>
                        <span className="text-muted-foreground">por {item.por}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tags associadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {selectedRequest.tags?.length ? (
                      selectedRequest.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem tags</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <TagDialog
        open={tagModalState.open}
        onOpenChange={(open) => setTagModalState((state) => ({ open, request: open ? state.request : null }))}
        title={`Adicionar tags — ${tagModalState.request?.nome ?? ""}`}
        defaultTags={tagModalState.request?.tags ?? []}
        onSubmit={async (tags) => {
          if (!tagModalState.request) return;
          try {
            await handleActionWithPermission(
              () => tagMutation.mutateAsync({ id: tagModalState.request!.id, tags }),
              "Atualizando tags..."
            );
            setTagModalState({ open: false, request: null });
          } catch (error) {
            console.error(error);
          }
        }}
        isSubmitting={tagMutation.isPending}
        description="Clique em uma tag para removê-la. Pressione Enter para adicionar novas tags."
      />
    </div>
  );
};

export default Ajuda;
