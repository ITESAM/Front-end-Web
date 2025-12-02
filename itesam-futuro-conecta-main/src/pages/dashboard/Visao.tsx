import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle,
  Archive,
  UsersRound,
  HelpCircle,
  Newspaper,
  RefreshCcw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { apiClient } from "@/lib/api-client";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/records/StatusBadge";
import { api } from "@/api/api";

interface OverviewMetrics {
  total: number;
  novos: number;
  revisados: number;
  arquivados: number;
}

interface DashboardOverview {
  metrics: {
    forms: OverviewMetrics;
    volunteers: OverviewMetrics & { ativos?: number };
    help: OverviewMetrics & { emAnalise?: number; resolvidos?: number };
    posts: {
      publicadas: number;
      rascunhos: number;
      arquivadas: number;
      visualizacoes: number;
    };
  };
  recentSubmissions: Array<{
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
    contato?: string;
    tipo: string;
    status: string;
    tags?: string[];
    criadoEm: string | null;
  }>;
  activity: Array<{
    id: string;
    tipo: string;
    descricao: string;
    usuario: string;
    criadoEm: string | null;
  }>;
}

const DEFAULT_RESPONSE: DashboardOverview = {
  metrics: {
    forms: { total: 0, novos: 0, revisados: 0, arquivados: 0 },
    volunteers: { total: 0, novos: 0, revisados: 0, arquivados: 0, ativos: 0 },
    help: { total: 0, novos: 0, revisados: 0, arquivados: 0, emAnalise: 0, resolvidos: 0 },
    posts: { publicadas: 0, rascunhos: 0, arquivadas: 0, visualizacoes: 0 },
  },
  recentSubmissions: [],
  activity: [],
};

const Visao = () => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const response = await api.get("/dashboard/overview.php");
      return response.data;
    },
    initialData: DEFAULT_RESPONSE,
    enabled: false, // desativa fetch automático
  });

  // Força a request ao montar o componente
  useEffect(() => {
    refetch();
  }, [refetch]);

  const overview = data ?? DEFAULT_RESPONSE;

  const cardData = useMemo(
    () => [
      { title: "Envios Totais", value: overview.metrics.forms.total, icon: FileText, iconColor: "bg-primary" },
      { title: "Novos Envios", value: overview.metrics.forms.novos, icon: Sparkles, iconColor: "bg-warning" },
      { title: "Revisados", value: overview.metrics.forms.revisados, icon: CheckCircle, iconColor: "bg-success" },
      { title: "Arquivados", value: overview.metrics.forms.arquivados, icon: Archive, iconColor: "bg-muted-foreground" },
    ],
    [overview.metrics.forms]
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data inválida";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };


  return (
    <div className="space-y-6 animate-fade-in">
      {isLoading || isFetching ? (
        <p>Carregando métricas...</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
              <p className="text-muted-foreground">Acompanhe as métricas e atividades em tempo real.</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Atualizar agora
            </Button>
          </div>

          {/* Cards principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cardData.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>

          {/* Tabelas e estatísticas */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Coluna principal */}
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-col gap-1">
                <CardTitle>Envios recentes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Últimos formulários recebidos e aguardando ação da equipe.
                </p>
              </CardHeader>
              <CardContent>
                {overview.recentSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum envio recente</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Assim que novos formulários forem recebidos, eles aparecerão nesta lista automaticamente.
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overview.recentSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.nome}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {submission.email ?? submission.telefone ?? submission.contato ?? "--"}
                            </TableCell>
                            <TableCell className="capitalize text-muted-foreground">{submission.tipo}</TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(submission.criado_em)}</TableCell>
                            <TableCell>
                              <StatusBadge status={submission.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {submission.tags?.length
                                  ? submission.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))
                                  : <span className="text-xs text-muted-foreground">Sem tags</span>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coluna direita: equipe e atividades */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Equipe e publicações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UsersRound className="h-4 w-4" /> Voluntários ativos
                    </div>
                    <span className="font-semibold">
                      {overview.metrics.volunteers.ativos ?? overview.metrics.volunteers.revisados}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HelpCircle className="h-4 w-4" /> Pedidos em análise
                    </div>
                    <span className="font-semibold">
                      {overview.metrics.help.emAnalise ?? overview.metrics.help.novos}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Newspaper className="h-4 w-4" /> Postagens publicadas
                    </div>
                    <span className="font-semibold">{overview.metrics.posts.publicadas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4" /> Formulários revisados
                    </div>
                    <span className="font-semibold">{overview.metrics.forms.revisados}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade recente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {overview.activity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma atividade registrada nas últimas horas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {overview.activity.map((item) => (
                        <div key={item.id} className="rounded-lg border border-border p-3">
                          <p className="text-sm">
                            <span className="font-semibold text-foreground">{item.usuario}</span> {item.descricao}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(item.criadoEm)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Visao;

