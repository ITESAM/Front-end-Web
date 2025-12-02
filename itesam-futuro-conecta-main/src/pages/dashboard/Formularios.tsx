import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  Clock,
  CheckCircle,
  Archive,
  Tag,
  Mail,
  CalendarDays,
  ListFilter,
  User,
  Phone,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { FormularioRecord, PaginatedResult } from "@/types/entities";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/dashboard/records/StatusBadge";
import { TagDialog } from "@/components/dashboard/records/TagDialog";
import { api } from "@/api/api";
import Cookies from "js-cookie";

const formatDate = (date?: string) => {
  if (!date) return "--";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
};

const buildParams = ({
  page,
  dateRange,
  status,
  tag,
  type,
  search,
}: {
  page: number;
  dateRange?: DateRange;
  status?: string;
  tag?: string;
  type?: string;
  search?: string;
}) => ({
  page: String(page),
  perPage: "10",
  status,
  tag,
  type,
  q: search,
  startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
  endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
});

const Formularios = () => {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("q") ?? "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState(searchFromUrl);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedForm, setSelectedForm] = useState<FormularioRecord | null>(null);
  const [tagModalState, setTagModalState] = useState<{ open: boolean; form: FormularioRecord | null }>({
    open: false,
    form: null,
  });

  const params = useMemo(
    () => ({
      user_id: 1, //Cookies.get("userRole"),
      page,
      dateRange,
      status: statusFilter !== "todos" ? statusFilter : undefined,
      type: typeFilter !== "todos" ? typeFilter : undefined,
      tag: tagFilter && tagFilter !== "todas" ? tagFilter : undefined,
      search: search || searchFromUrl || undefined,
    }),
    [user?.id, page, dateRange, statusFilter, typeFilter, tagFilter, search, searchFromUrl]
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["forms", params],
    queryFn: () =>
      api.get<PaginatedResult<FormularioRecord>>(
        "/formularios/get_list_formularios.php",
        { params } // ✅ axios envia automaticamente os parâmetros via GET
      ),
  });

  const metrics = data?.data.metrics ?? {};
  const forms = data?.data ?? [];
  const totalPages = data?.data.meta.totalPages ?? 1;

  useEffect(() => {
    setSearch(searchFromUrl);
    setPage(1);
  }, [searchFromUrl]);

  const canExecuteActions = isAdmin;

  const reviewMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient.patch(`/forms/${id}`, {
        status: "revisado",
        updatedBy: user?.nome,
      }),
    onSuccess: async () => {
      toast.success("Formulário marcado como revisado");
      await queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient.patch(`/forms/${id}`, {
        status: "arquivado",
        updatedBy: user?.nome,
      }),
    onSuccess: async () => {
      toast.success("Formulário arquivado");
      await queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  const tagMutation = useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) =>
      apiClient.patch(`/forms/${id}`, {
        tags,
        updatedBy: user?.nome,
      }),
    onSuccess: async () => {
      toast.success("Tags atualizadas");
      await queryClient.invalidateQueries({ queryKey: ["forms"] });
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
        <h1 className="text-3xl font-bold text-foreground">Formulários</h1>
        <p className="text-muted-foreground">
          Acompanhe os envios recebidos e atualize o status de cada formulário de contato ou voluntariado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Envios Totais" value={metrics.total_geral ?? 0} icon={FileText} iconColor="bg-primary" sparkline={[]} />
        <StatCard title="Novos Envios" value={metrics.novos ?? 0} icon={Clock} iconColor="bg-warning" sparkline={[]} />
        <StatCard title="Revisados" value={metrics.revisados ?? 0} icon={CheckCircle} iconColor="bg-success" sparkline={[]} />
        <StatCard title="Arquivados" value={metrics.arquivados ?? 0} icon={Archive} iconColor="bg-muted-foreground" sparkline={[]} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Envios recentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Filtre por status, tipo ou período para encontrar rapidamente os formulários que precisam de atenção.
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
                  <option value="revisado">Revisados</option>
                  <option value="arquivado">Arquivados</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={typeFilter ?? "todos"}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="contato">Contato</option>
                  <option value="voluntario">Voluntário</option>
                </select>
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
                <Label htmlFor="forms-tags">Tag</Label>
                <Input
                  id="forms-tags"
                  placeholder="Filtrar por tag"
                  value={tagFilter ?? ""}
                  onChange={(event) => {
                    setTagFilter(event.target.value || undefined);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="forms-search">Busca</Label>
                <Input
                  id="forms-search"
                  placeholder="Nome, e-mail ou assunto"
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
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum formulário encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ajuste os filtros ou tente outro termo de busca para localizar os envios cadastrados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome completo</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data de envio</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.data.map((form) => (
                    <TableRow
                      key={form.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedForm(form)}
                    >
                      <TableCell className="font-medium">{form.nome}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {form.email ?? form.telefone ?? form.contato ?? "--"}
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">{form.tipo}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(form.criadoEm)}</TableCell>
                      <TableCell>
                        <StatusBadge status={form.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {form.tags?.length ? (
                            form.tags.map((tag) => (
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
                                  () => reviewMutation.mutateAsync(form.id),
                                  "Atualizando status..."
                                );
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Revisar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                if (!canExecuteActions) {
                                  toast.error("Apenas administradores podem adicionar tags");
                                  return;
                                }
                                setTagModalState({ open: true, form });
                              }}
                            >
                              <Tag className="mr-2 h-4 w-4" /> Adicionar Tag
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={archiveMutation.isPending || !canExecuteActions}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleActionWithPermission(
                                  () => archiveMutation.mutateAsync(form.id),
                                  "Arquivando registro..."
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

          {forms.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {data?.meta.page ?? 1} de {totalPages} — {data?.meta.totalItems ?? forms.length} formulários
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

      <Sheet open={Boolean(selectedForm)} onOpenChange={(open) => !open && setSelectedForm(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedForm && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {selectedForm.nome}
                </SheetTitle>
                <SheetDescription>
                  Última alteração em {formatDate(selectedForm.atualizadoEm)} por {selectedForm.atualizadoPor ?? "---"}
                </SheetDescription>
              </SheetHeader>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do envio</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {selectedForm.nome}
                  </p>
                  {(() => {
                    const isEmailContact =
                      selectedForm.contato && typeof selectedForm.contato === "string"
                        ? selectedForm.contato.includes("@")
                        : false;
                    const email = selectedForm.email ?? (isEmailContact ? selectedForm.contato : undefined);
                    const phone =
                      selectedForm.telefone ?? (!isEmailContact ? selectedForm.contato : undefined);

                    return (
                      <>
                        {email && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {email}
                          </p>
                        )}
                        {phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {phone}
                          </p>
                        )}
                        {!email && !phone && selectedForm.contato && (
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" /> {selectedForm.contato}
                          </p>
                        )}
                        {!email && !phone && !selectedForm.contato && (
                          <p className="text-muted-foreground">Contato não informado</p>
                        )}
                      </>
                    );
                  })()}
                  <p className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4 text-muted-foreground" />
                    Tipo: {selectedForm.tipo}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Enviado em {formatDate(selectedForm.criadoEm)}
                  </p>
                  <p className="flex items-center gap-2">
                    Status: <StatusBadge status={selectedForm.status} />
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detalhes adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {selectedForm.dados ? (
                    Object.entries(selectedForm.dados).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{key}</span>
                        <span className="text-muted-foreground">
                          {Array.isArray(value) ? value.join(", ") : String(value ?? "-")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhuma informação adicional fornecida.</p>
                  )}

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Tags</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedForm.tags?.length ? (
                        selectedForm.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem tags</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedForm.historico?.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Histórico de status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedForm.historico.map((item, index) => (
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
            </div>
          )}
        </SheetContent>
      </Sheet>

      <TagDialog
        open={tagModalState.open}
        onOpenChange={(open) => setTagModalState((state) => ({ open, form: open ? state.form : null }))}
        title={`Adicionar tags — ${tagModalState.form?.nome ?? ""}`}
        defaultTags={tagModalState.form?.tags ?? []}
        onSubmit={async (tags) => {
          if (!tagModalState.form) return;
          try {
            await handleActionWithPermission(
              () => tagMutation.mutateAsync({ id: tagModalState.form!.id, tags }),
              "Atualizando tags..."
            );
            setTagModalState({ open: false, form: null });
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

export default Formularios;
