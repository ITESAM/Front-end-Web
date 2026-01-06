import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  Heart,
  HelpingHand,
  Handshake,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  MessageCircle,
  Activity,
  Brain,
  Baby,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import NewsCard from "@/components/NewsCard";
import heroBannerImage from "@/assets/hero-banner.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getPublishedNews } from "@/lib/news";
const Index = () => {
   const [news, setNews] = useState([]);
    // 🔥 1. Buscar notícias reais da API
  useEffect(() => {
    
    const loadNews = async () => {
      try {
        const res = await fetch(
          "https://itesam.org.br/api/postagens/get_list_ative_postagens.php"
        );

        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const BASE_URL = "http://localhost/its-api/";
           // ⬇️ Aqui adicionamos o prefixo nas imagens
          const normalized = json.data.map(item => ({
            ...item,
            image: item.image ? BASE_URL + item.image : null,
          }));
          
          setNews(normalized);
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      }
    };

    loadNews();
  }, []);

  // 🔥 2. Ordenar por data (mais recente primeiro)
  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [news]);

  // 🔥 3. Separar destacadas e não destacadas
  const highlightedNews = useMemo(() => {
    return sortedNews.filter((item) => item.highlights?.length > 0);
  }, [sortedNews]);

  const nonHighlightedNews = useMemo(() => {
    return sortedNews.filter((item) => item.highlights?.length === 0);
  }, [sortedNews]);

  // 🔥 4. Combinar e exibir só as 5 mais recentes
  const gridNews = useMemo(() => {
    const combined = [...highlightedNews, ...nonHighlightedNews];
    return combined.slice(0, 5);
  }, [highlightedNews, nonHighlightedNews]);

  // ---- abaixo continua igual ao seu componente ----

  const services = [
    {
      title: "Médicos",
      description:
        "Atendimento médico especializado com foco em cuidados integrais",
      icon: <Stethoscope className="h-12 w-12" strokeWidth={1.75} />,
    },
    {
      title: "Fonoaudiólogos",
      description:
        "Tratamento e reabilitação da comunicação e funções orofaciais",
      icon: <MessageCircle className="h-12 w-12" strokeWidth={1.75} />,
    },
    {
      title: "Fisioterapeutas",
      description:
        "Reabilitação física e prevenção de lesões para todas as idades",
      icon: <Activity className="h-12 w-12" strokeWidth={1.75} />,
    },
    {
      title: "Psicólogos",
      description:
        "Apoio psicológico e acompanhamento emocional especializado",
      icon: <Brain className="h-12 w-12" strokeWidth={1.75} />,
    },
    {
      title: "Assistentes Sociais",
      description:
        "Orientação e suporte para integração social e direitos",
      icon: <HelpingHand className="h-12 w-12" strokeWidth={1.75} />,
    },
  ];

  const stats = [
    { icon: Users, value: "500+", label: "Famílias Atendidas" },
    { icon: Heart, value: "20+", label: "Projetos Realizados" },
  ];

  const heroHighlights = [
    "Atendimento multidisciplinar integrado",
    "Acolhimento para famílias da Amazônia",
    "Tecnologia a serviço do cuidado social",
  ];

  const pillars = [
    {
      title: "Transparência e ética",
      description:
        "Prestamos contas de cada ação com responsabilidade e compromisso com a comunidade que confia em nós.",
      icon: ShieldCheck,
    },
    {
      title: "Inovação social",
      description:
        "Unimos educação, tecnologia e saúde para desenvolver soluções que ampliam oportunidades e impactam gerações.",
      icon: Sparkles,
    },
    {
      title: "Rede colaborativa",
      description:
        "Articulamos voluntários, famílias e parceiros para garantir suporte contínuo e acolhedor.",
      icon: Handshake,
    },
  ];

  const audiences = [
    { title: "Crianças PCDs e com TEA", icon: Baby },
    { title: "Mulheres e mães", icon: Heart },
    { title: "Idosos 60+", icon: User },
  ];
 
  const publishedNews = useMemo(() => getPublishedNews(), []);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(7,24,52,0.78), rgba(7,24,52,0.88)), url(${heroBannerImage})`,
          }}
        >
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-[-120px] -left-24 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative container mx-auto px-4 py-24 md:py-28">
            <div className="mx-auto max-w-5xl text-center text-white md:text-left space-y-10">
              <span className="inline-flex items-center justify-center md:justify-start gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
                Instituto ITESAM
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                No ITESAM, cuidado e acolhimento são
                <span className="text-secondary"> portas para o futuro.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/85 max-wF-3xl">
                Portas para o futuro com atendimento humanizado, programas educativos e ações sociais que fortalecem famílias em toda a Amazônia.
              </p>
              <div className="flex flex-col items-center gap-8 md:items-start">
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="border-white/30 bg-white text-primary hover:bg-white/90"
                  >
                    <Link to="/contato">
                      Fale conosco <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    asChild
                    className="uppercase tracking-wide font-semibold shadow-xl shadow-primary/40 hover:shadow-2xl"
                  >
                    <Link to="/login?tab=register">Cadastra-se</Link>
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {heroHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-left backdrop-blur-md"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-sm font-semibold text-white">
                      •
                    </span>
                    <span className="text-sm font-medium text-white/90">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 space-y-6">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
                Equipe multiprofissional
              </span>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">Quem atendemos</h3>
                <ul className="grid gap-6 sm:grid-cols-3 max-w-6xl mx-auto">
                  {audiences.map((audience) => {
                    const Icon = audience.icon;
                    return (
                      <li
                        key={audience.title}
                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-12 text-center text-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[190px]"
                      >
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="flex flex-col items-center gap-5">
                          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                            <Icon className="h-7 w-7" />
                          </span>
                          <span className="text-lg font-semibold leading-tight">{audience.title}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-foreground">O que fazemos</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Oferecemos uma gama completa de serviços voltados para o bem-estar e desenvolvimento integral de indivíduos e famílias.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="relative py-24 bg-[hsl(var(--impact-bg))]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="relative container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
                Impacto social
              </span>
              <h2 className="text-4xl font-bold text-foreground">Nosso impacto em números</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Resultados construídos com transparência, dedicação e uma rede comprometida em ampliar o acesso a cuidados integrais.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-3xl border border-primary/10 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(24,64,149,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_80px_-45px_rgba(24,64,149,0.5)]"
                  >
                    <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">ITESAM</span>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-primary">{stat.value}</div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid items-start gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
                  Nossa essência
                </span>
                <h2 className="text-4xl font-bold text-foreground leading-tight">
                  Valores que guiam cada projeto e cada atendimento
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  O ITESAM nasce do desejo de criar oportunidades e oferecer cuidado integral. Conheça os pilares que sustentam nossas ações e garantem atendimento humanizado para quem mais precisa.
                </p>
                <div>
                  <Button variant="outline" asChild className="border-primary/40 text-primary hover:bg-primary/10">
                    <Link to="/quem-somos">
                      Conheça nossa história <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-5">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </span>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-foreground">{pillar.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 space-y-4">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
                Atualizações
              </span>
              <h2 className="text-4xl font-bold text-foreground">Últimas notícias</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Fique por dentro das nossas ações, eventos e conquistas ao longo do ano.
              </p>
            </div>
            {highlightedNews.length ? (
              <div className="mb-12">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Destaques do Instituto</h3>
                <Carousel className="relative" opts={{ align: "start" }}>
                  <CarouselContent>
                    {highlightedNews.map((news) => (
                      <CarouselItem key={news.id} className="md:basis-2/3 lg:basis-1/2">
                        <NewsCard {...news} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-6" aria-label="Ver notícia anterior" />
                  <CarouselNext className="-right-6" aria-label="Ver próxima notícia" />
                </Carousel>
              </div>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {gridNews.map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/noticias">Ver todas as notícias</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[hsl(var(--hero-gradient-start))] via-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))] text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                Vamos conversar
              </span>
              <h2 className="text-4xl font-bold">Quer saber mais?</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Entre em contato e descubra como podemos caminhar juntos em projetos de saúde, ensino e tecnologia para a nossa região.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-white/60 bg-white text-primary hover:bg-white/90"
                >
                  <Link to="/contato">Fale conosco</Link>
                </Button>
                <Button variant="hero" size="lg" asChild className="bg-secondary text-white hover:bg-secondary/90">
                  <Link to="/voluntariado">Seja voluntário</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
