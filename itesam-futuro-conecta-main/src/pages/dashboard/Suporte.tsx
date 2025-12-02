import { Link } from "react-router-dom";
import {
  LifeBuoy,
  BookOpen,
  Rocket,
  Settings2,
  Users,
  FileText,
  Image,
  Newspaper,
  HelpCircle,
  MessageCircleQuestion,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  Compass,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const quickStart = [
  {
    title: "Faça login e personalize o painel",
    description:
      "Acesse com seu usuário, revise seu perfil em Perfil e defina preferências básicas para receber notificações relevantes.",
    icon: ShieldCheck,
  },
  {
    title: "Acompanhe a visão geral",
    description:
      "Use a página Visão para monitorar indicadores-chave, itens pendentes e atividades recentes em tempo real.",
    icon: Compass,
  },
  {
    title: "Gerencie os fluxos principais",
    description:
      "Formulários, voluntários, galerias e postagens têm trilhas dedicadas. Abra cada módulo para revisar entradas e atualizar status.",
    icon: ClipboardList,
  },
  {
    title: "Atenda pedidos de ajuda",
    description:
      "Centralize atendimentos na página Pedidos de Ajuda. Defina responsáveis, atualize status e mantenha histórico completo.",
    icon: LifeBuoy,
  },
];

const modules = [
  {
    title: "Visão",
    description:
      "Resumo executivo com métricas, atividades recentes e atalhos para tarefas pendentes.",
    icon: Rocket,
    links: [
      { label: "Ver visão geral", to: "/visao" },
    ],
  },
  {
    title: "Formulários",
    description:
      "Receba inscrições, classifique por status, adicione tags e exporte dados conforme necessário.",
    icon: FileText,
    links: [
      { label: "Ir para formulários", to: "/formularios" },
    ],
  },
  {
    title: "Voluntários",
    description:
      "Faça triagem, acompanhe atividades recentes e mantenha o cadastro atualizado.",
    icon: Users,
    links: [
      { label: "Gerenciar voluntários", to: "/voluntarios" },
    ],
  },
  {
    title: "Postagens",
    description:
      "Planeje conteúdo, controle revisões e publique atualizações para a comunidade.",
    icon: Newspaper,
    links: [
      { label: "Organizar postagens", to: "/postagens" },
    ],
  },
  {
    title: "Galeria",
    description:
      "Armazene e aprove imagens com histórico de aprovação e filtros inteligentes.",
    icon: Image,
    links: [
      { label: "Abrir galeria", to: "/galeria" },
    ],
  },
  {
    title: "Configurações",
    description:
      "Controle permissões, dados institucionais, integrações e preferências avançadas.",
    icon: Settings2,
    links: [
      { label: "Ajustar configurações", to: "/configuracoes" },
    ],
  },
];

const faqItems = [
  {
    value: "faq-1",
    question: "Como encontro rapidamente um registro específico?",
    answer:
      "Use a busca global no topo do painel. Digite parte do nome, e-mail ou tag e pressione Enter. Os filtros avançados ficam disponíveis em cada módulo para refinar resultados.",
  },
  {
    value: "faq-2",
    question: "Como organizar pedidos de ajuda por prioridade?",
    answer:
      "Atribua tags como 'urgente' ou 'importante' e utilize o filtro de tags na página Pedidos de Ajuda. Combine com filtros de status para criar filas claras de atendimento.",
  },
  {
    value: "faq-3",
    question: "Posso delegar tarefas para outros usuários?",
    answer:
      "Sim. Ao atualizar registros, registre o responsável no campo de notas ou utilize tags com o nome da pessoa. Em breve integraremos atribuição direta.",
  },
  {
    value: "faq-4",
    question: "O que fazer quando algo não funciona como esperado?",
    answer:
      "Consulte esta central, verifique as permissões em Configurações e, se o problema persistir, abra um chamado em Pedidos de Ajuda marcando o status como 'em análise'.",
  },
];

const supportChannels = [
  {
    title: "Abrir chamado interno",
    description: "Crie um pedido detalhado na página Pedidos de Ajuda para registrar e acompanhar a resolução.",
    icon: HelpCircle,
    action: { label: "Ir para Pedidos de Ajuda", to: "/ajuda" },
  },
  {
    title: "Falar com o time",
    description: "Envie um e-mail para a equipe de suporte institucional ou agende uma ligação para questões urgentes.",
    icon: Mail,
    action: { label: "Enviar e-mail", to: "mailto:suporte@itesam.org" },
  },
  {
    title: "Canal rápido",
    description: "Utilize o chat interno para dúvidas breves e acompanhamento de atividades em andamento.",
    icon: MessageSquare,
    action: { label: "Abrir chat", to: "#" },
  },
];

const Suporte = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit gap-2">
          <LifeBuoy className="h-4 w-4" /> Central de suporte
        </Badge>
        <h1 className="text-3xl font-bold text-foreground">Central de suporte e orientação</h1>
        <p className="text-muted-foreground max-w-3xl">
          Conheça cada parte do painel, descubra fluxos recomendados e encontre respostas rápidas para manter a operação do
          ITESAM sempre alinhada.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader className="bg-primary/10 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Rocket className="h-5 w-5 text-primary" /> Guia rápido para começar
            </CardTitle>
            <CardDescription>
              Siga estes passos iniciais para dominar o dashboard em poucos minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            {quickStart.map((step, index) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-base text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link to="/visao">Ir para a visão geral</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/ajuda">Monitorar pedidos de ajuda</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/configuracoes">Personalizar o painel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/20 border-secondary/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-secondary-foreground" /> Boas práticas
            </CardTitle>
            <CardDescription>
              Orientações para manter o trabalho organizado e colaborativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-secondary-foreground">
            <div className="space-y-2">
              <h3 className="font-semibold uppercase text-xs text-secondary-foreground/70">Rotina diária</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CalendarCheck className="h-4 w-4 mt-0.5" />
                  Revise alertas e métricas de Visão para priorizar ações do dia.
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircleQuestion className="h-4 w-4 mt-0.5" />
                  Atualize pedidos de ajuda com notas claras sempre que houver andamento.
                </li>
                <li className="flex items-start gap-2">
                  <Settings2 className="h-4 w-4 mt-0.5" />
                  Garanta que permissões e cadastros estejam atualizados semanalmente.
                </li>
              </ul>
            </div>
            <Separator className="border-secondary/40" />
            <div className="space-y-2">
              <h3 className="font-semibold uppercase text-xs text-secondary-foreground/70">Status recomendados</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-green-500/40 text-green-600">Resolvido</Badge>
                <Badge variant="outline" className="border-yellow-500/40 text-yellow-600">Em análise</Badge>
                <Badge variant="outline" className="border-blue-500/40 text-blue-600">Novo</Badge>
                <Badge variant="outline" className="border-slate-400/40 text-slate-600">Arquivado</Badge>
              </div>
              <p className="text-xs text-secondary-foreground/80">
                Utilize a combinação de status e tags para construir filas de trabalho claras e comunicáveis para toda a equipe.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground">Mapa do dashboard</h2>
          <p className="text-muted-foreground max-w-3xl">
            Explore cada módulo com atalhos diretos e entenda o que monitorar em cada área.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.title} className="flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <module.icon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex flex-wrap gap-2">
                  {module.links.map((link) => (
                    <Button key={link.to} asChild size="sm" variant="secondary">
                      <Link to={link.to}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> Perguntas frequentes
            </CardTitle>
            <CardDescription>Respostas diretas para dúvidas recorrentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item) => (
                <AccordionItem key={item.value} value={item.value} className="border border-border rounded-lg px-4">
                  <AccordionTrigger className="font-medium text-left text-sm">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Canais de suporte
            </CardTitle>
            <CardDescription>Escolha a melhor forma de falar com nossa equipe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportChannels.map((channel) => (
              <div key={channel.title} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <channel.icon className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{channel.title}</h3>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to={channel.action.to}>{channel.action.label}</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-dashed border-primary/40">
        <CardContent className="py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Ainda ficou alguma dúvida?</h2>
            <p className="text-muted-foreground">
              Nossa equipe está pronta para apoiar. Abra um chamado ou compartilhe sugestões para continuarmos evoluindo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link to="/ajuda">Registrar novo pedido</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="mailto:suporte@itesam.org">Conversar com o suporte</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suporte;
