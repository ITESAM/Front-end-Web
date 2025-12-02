import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  HandHeart,
  CheckCircle,
  Archive,
  Tag,
  MapPin,
  Phone,
  Mail,
  Clock as ClockIcon,
  CalendarDays,
  Briefcase,
  UsersRound,
  ArrowRight,
  BadgeCheck,
  Eye,
  Download,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { VolunteerRecord, PaginatedResult } from "@/types/entities";
import { getFormFieldOptionLabel } from "@/config/dashboard";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagDialog } from "@/components/dashboard/records/TagDialog";
import { StatusBadge } from "@/components/dashboard/records/StatusBadge";
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
import { api } from "@/api/api";

const formatDate = (date?: string) => {
  if (!date) return "--";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
};

const buildParams = ({
  page,
  dateRange,
  status,
  tag,
  search,
}: {
  page: number;
  dateRange?: DateRange;
  status?: string;
  tag?: string;
  search?: string;
}) => ({
  page: String(page),
  perPage: "10",
  status,
  tag,
  q: search,
  startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
  endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
});

const Voluntarios = () => {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("q") ?? "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState(searchFromUrl);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerRecord | null>(null);
  const [tagModalState, setTagModalState] = useState<{ open: boolean; volunteer: VolunteerRecord | null }>({
    open: false,
    volunteer: null,
  });

  const params = useMemo(
    () => ({
      user_id: 1, //Cookies.get("userRole"),
      page,
      dateRange,
      status: statusFilter !== "todos" ? statusFilter : undefined,
      tag: tagFilter && tagFilter !== "todas" ? tagFilter : undefined,
      search: search || searchFromUrl || undefined,
    }),
    [user?.id, page, dateRange, statusFilter, tagFilter, search, searchFromUrl]
  );

  const { data, isLoading, isFetching } = useQuery({
      queryKey: ["volunteers", params],
      queryFn: () =>
        api.get<PaginatedResult<VolunteerRecord>>(
          "/voluntario/get_list_voluntarios.php",
          { params } // ✅ axios envia automaticamente os parâmetros via GET
        ),
    });

  const metrics = data?.data.metrics ?? {};

  const reviewMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient.patch(`/volunteers/${id}`, {
        status: "ativo",
        updatedBy: user?.nome,
      }),
    onSuccess: async () => {
      toast.success("Voluntário marcado como ativo");
      await queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient.patch(`/volunteers/${id}`, {
        status: "arquivado",
        updatedBy: user?.nome,
      }),
    onSuccess: async () => {
      toast.success("Voluntário arquivado");
      await queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });

  const tagMutation = useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) =>
      apiClient.patch(`/volunteers/${id}`, {
        tags,
        updatedBy: user?.nome,
      }),
    onSuccess: async () => {
      toast.success("Tags atualizadas");
      await queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });

  const canExecuteActions = isAdmin;

  const handleActionWithPermission = async (callback: () => Promise<unknown>, message: string) => {
    if (!canExecuteActions) {
      toast.error("Apenas administradores podem executar esta ação");
      throw new Error("Unauthorized");
    }

    toast.promise(callback(), {
      loading: message,
      success: "Ação concluída!",
      error: "Não foi possível completar a ação",
    });
  };

  const volunteers = data?.data ?? [];
  const totalPages = data?.data.meta.totalPages ?? 1;

  useEffect(() => {
    setSearch(searchFromUrl);
    setPage(1);
  }, [searchFromUrl]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">Voluntários</h1>
        <p className="text-muted-foreground">
          Gerencie o cadastro de voluntários, revise documentos e acompanhe disponibilidade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={metrics.total ?? 0} icon={UsersRound} iconColor="bg-primary" sparkline={[]} />
        <StatCard title="Pendentes" value={metrics.pendentes ?? 0} icon={ClockIcon} iconColor="bg-warning" sparkline={[]} />
        <StatCard title="Ativos" value={metrics.ativos ?? 0} icon={BadgeCheck} iconColor="bg-success" sparkline={[]} />
        <StatCard title="Arquivados" value={metrics.inativos ?? 0} icon={Archive} iconColor="bg-muted-foreground" sparkline={[]} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Voluntários cadastrados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Utilize filtros avançados para localizar perfis específicos ou acompanhar status de revisão.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex gap-2">
              <div className="space-y-1">
                <Label htmlFor="volunteers-status">Status</Label>
                <select
                  id="volunteers-status"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={statusFilter ?? "todos"}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="ativo">Ativos</option>
                  <option value="arquivado">Arquivados</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="volunteers-tags">Tag</Label>
                <Input
                  id="volunteers-tags"
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
                <Label htmlFor="volunteers-search">Busca</Label>
                <Input
                  id="volunteers-search"
                  placeholder="Nome, e-mail ou cidade"
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
          ) : volunteers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HandHeart className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum voluntário encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ajuste os filtros ou tente outro termo de busca para localizar registros cadastrados.
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
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.data.map((volunteer) => (
                    <TableRow
                      key={volunteer.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedVolunteer(volunteer)}
                    >
                      <TableCell className="font-medium">{volunteer.nome}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {volunteer.email ?? (volunteer.contato?.includes("@") ? volunteer.contato : "--")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {volunteer.telefone ?? (!volunteer.contato?.includes("@") ? volunteer.contato ?? "--" : "--")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{volunteer.cidade ?? "--"}</TableCell>
                      <TableCell>
                        <StatusBadge status={volunteer.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.tags?.length ? (
                            volunteer.tags.map((tag) => (
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
                                void handleActionWithPermission(() => reviewMutation.mutateAsync(volunteer.id), "Atualizando status...");
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Revisar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                if (!canExecuteActions) {
                                  toast.error("Apenas administradores podem adicionar tags");
                                  return;
                                }
                                setTagModalState({ open: true, volunteer });
                              }}
                            >
                              <Tag className="mr-2 h-4 w-4" />
                              Adicionar Tag
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={archiveMutation.isPending || !canExecuteActions}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleActionWithPermission(() => archiveMutation.mutateAsync(volunteer.id), "Arquivando registro...");
                              }}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Arquivar
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

          {volunteers.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {data?.meta.page ?? 1} de {totalPages} — {data?.meta.totalItems ?? volunteers.length} voluntários
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

      <Sheet open={Boolean(selectedVolunteer)} onOpenChange={(open) => !open && setSelectedVolunteer(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedVolunteer && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-primary" />
                  {selectedVolunteer.nome}
                </SheetTitle>
                <SheetDescription>
                  Última atualização em {formatDate(selectedVolunteer.atualizadoEm)} por {selectedVolunteer.atualizadoPor ?? "---"}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações de contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(() => {
                      const isEmailContact = selectedVolunteer.contato?.includes("@");
                      const email = selectedVolunteer.email ?? (isEmailContact ? selectedVolunteer.contato : undefined);
                      const phone = selectedVolunteer.telefone ?? (!isEmailContact ? selectedVolunteer.contato : undefined);
                      const modalidadeLabels =
                        selectedVolunteer.dados.TiposAjuda;
                      const disponibilidadeLabel = selectedVolunteer.dados.DiasDisponiveis
                        ? getFormFieldOptionLabel("form_voluntariado", "disponibilidade", selectedVolunteer.dados.DiasDisponiveis)
                        : undefined;
                      const areaAtuacao = selectedVolunteer.dados.Graduacao ??
                        (modalidadeLabels.length ? modalidadeLabels.join(", ") : undefined);
                      const turno = selectedVolunteer.dados.TurnoDisponiveis ?? disponibilidadeLabel;

                      return (
                        <>
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" /> {email ?? "E-mail não informado"}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" /> {phone ?? "Telefone não informado"}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {selectedVolunteer.dados.Bairro ? `${selectedVolunteer.dados.Bairro}, ` : ""}
                            {selectedVolunteer.dados.Bairro ?? "--"}
                          </p>
                          <p className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            {areaAtuacao ?? "Área não informada"}
                          </p>
                          <p className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            {turno ?? "Turno não informado"}
                          </p>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Disponibilidade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(() => {
                      const disponibilidadeLabel = selectedVolunteer.dados.DiasDisponiveis
                        ? getFormFieldOptionLabel("form_voluntariado", "disponibilidade", selectedVolunteer.dados.DiasDisponiveis)
                        : undefined;
                      const diasTexto = selectedVolunteer.dados.DiasDisponiveis?.length
                        ? selectedVolunteer.dados.DiasDisponiveis
                        : "Não Informado";

                      return (
                        <p className="flex items-start gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>{diasTexto ?? "Dias não informados"}</span>
                        </p>
                      );
                    })()}
                    <p>
                      <strong>Status:</strong> <StatusBadge status={selectedVolunteer.status} />
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedVolunteer.tags?.length ? (
                          selectedVolunteer.tags.map((tag) => (
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

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Motivação e experiência</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Experiência</h4>
                      <p className="mt-1 text-muted-foreground">
                        {selectedVolunteer.experiencia ?? selectedVolunteer.descricaoContribuicao ?? "Não informado"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Motivação</h4>
                      <p className="mt-1 text-muted-foreground">
                        {selectedVolunteer.dados.Motivo }
                         
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Origem do contato</h4>
                      <p className="mt-1 text-muted-foreground">{selectedVolunteer.dados.ComoSoubeProjeto?? "Não informado"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Documentos enviados</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3 text-sm">
                    {selectedVolunteer.documentos?.rg ? (
                      <Button
                        variant="outline"
                        className="gap-2"
                        size="sm"
                        onClick={() => window.open(selectedVolunteer.documentos?.rg, "_blank")}
                      >
                        <Eye className="h-4 w-4" /> RG
                      </Button>
                    ) : null}
                    {selectedVolunteer.documentos?.cpf ? (
                      <Button
                        variant="outline"
                        className="gap-2"
                        size="sm"
                        onClick={() => window.open(selectedVolunteer.documentos?.cpf, "_blank")}
                      >
                        <Download className="h-4 w-4" /> CPF
                      </Button>
                    ) : null}
                    {selectedVolunteer.documentos?.selfie ? (
                      <Button
                        variant="outline"
                        className="gap-2"
                        size="sm"
                        onClick={() => window.open(selectedVolunteer.documentos?.selfie, "_blank")}
                      >
                        <Eye className="h-4 w-4" /> Selfie
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Nenhum documento enviado</span>
                    )}
                  </CardContent>
                </Card>

                {selectedVolunteer.historico?.length ? (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Histórico de status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {selectedVolunteer.historico.map((item, index) => (
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
            </div>
          )}
        </SheetContent>
      </Sheet>

      <TagDialog
        open={tagModalState.open}
        onOpenChange={(open) =>
          setTagModalState((state) => ({ open, volunteer: open ? state.volunteer : null }))
        }
        title={`Adicionar tags — ${tagModalState.volunteer?.nome ?? ""}`}
        defaultTags={tagModalState.volunteer?.tags ?? []}
        onSubmit={async (tags) => {
          if (!tagModalState.volunteer) return;
          try {
            await handleActionWithPermission(
              () => tagMutation.mutateAsync({ id: tagModalState.volunteer!.id, tags }),
              "Atualizando tags..."
            );
            setTagModalState({ open: false, volunteer: null });
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

export default Voluntarios;
