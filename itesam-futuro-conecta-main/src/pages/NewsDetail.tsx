import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/api/api";

// 🧹 Função para sanitizar HTML
function sanitizeHTML(html: string) {
  if (!html) return "";

  return html
    // Remove scripts, estilos e iframes
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/<style.*?>.*?<\/style>/gi, "")
    .replace(/<iframe.*?>.*?<\/iframe>/gi, "")
    // Remove atributos perigosos (onload, onclick, etc.)
    .replace(/on\w+=".*?"/gi, "")
    // Remove espaços extras
    .replace(/\s+/g, " ")
    .trim();
}

// Função para calcular tempo de leitura
const calculateReadingTime = (content: string[] = []) => {
  const totalWords = content.reduce((total, paragraph) => {
    const words = paragraph.trim().split(/\s+/);
    return total + (words[0] === "" ? 0 : words.length);
  }, 0);
  return Math.max(1, Math.round(totalWords / 180));
};

const NewsDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  // 🔹 Estados
  const [article, setArticle] = useState<any | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Hooks sempre declarados antes de qualquer return condicional
  const readingTime = calculateReadingTime(article?.content || []);

  // 🔹 Buscar notícia e artigos relacionados
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);

        // Buscar artigo
        const response = await api.get("postagens/get_postagem_by_slug.php", {
          params: { slug },
        });
        const item = response.data;

        if (!item) {
          setArticle(null);
          return;
        }

        const formatted = {
          id: item.id,
          title: item.titulo,
          excerpt: item.subtitulo || (item.descricao ? item.descricao.substring(0, 120) + "..." : ""),
          image: item.imagem || "https://placehold.co/600x400",
          imageAlt: item.titulo,
          date: item.criado_em ? new Date(item.criado_em).toLocaleDateString("pt-BR") : "",
          categoryLabel: item.categoria_nome ?? "Outros",
          subcategory: item.subcategoria_nome ?? "Geral",
          author: item.autor_nome ?? "Anônimo",
          tags: item.tags || [],
          content: item.descricao ? [item.descricao] : [],
          featuredQuote: item.bloco_especial ?? "",
          highlights: item.destaques?.split("|") || [],
          sources: item.referencia_info
            ? [
              {
                id: item.referencia_info.id,
                label: item.referencia_info.titulo,
                url: `/noticias/${item.referencia_info.url_personalizada}`,
                image: item.referencia_info.imagem,
                date: item.referencia_info.criado_em,
              },
            ]
            : [],
          slug: item.url_personalizada ?? String(item.id),
        };

        setArticle(formatted);

        // Buscar artigos relacionados
        const relatedResponse = await api.get("postagens/get_list_ative_postagens.php");
        const related = relatedResponse.data.data
          .filter((news: any) => news.id !== item.id)
          .slice(0, 3);

        setRelatedArticles(related);
      } catch (err) {
        console.error("Erro ao buscar notícia:", err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticle();
  }, [slug]);

  // 🔹 Atualizar meta tags
  useEffect(() => {
    if (!article) return;

    document.title = `${article.title} | Instituto ITESAM`;

    const ensureMeta = (name: string, content: string) => {
      if (!content) return;
      let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    ensureMeta("description", article.excerpt);
    ensureMeta("keywords", (article.tags || []).join(", "));
  }, [article]);

  // 🔹 Função de clique em tag
  const handleTagClick = (tag: string) => {
    navigate(`/noticias?tag=${encodeURIComponent(tag)}`);
  };

  // 🔹 Renderizar referências
  const renderSource = (sources: any[]) => {
    if (!sources.length) return null;

    return (
      <footer className="mt-12 pt-8 border-t border-border space-y-4" aria-labelledby="referencias-title">
        <h2 id="referencias-title" className="text-xl font-semibold text-foreground">
          Referências
        </h2>
        <ul className="space-y-2 text-muted-foreground text-sm">
          {sources.map((source) => (
            <li key={source.label}>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-dotted underline-offset-4 hover:text-secondary focus:text-secondary"
                >
                  {source.label}
                </a>
              ) : (
                source.label
              )}
            </li>
          ))}
        </ul>
      </footer>
    );
  };

  // 🔹 Renderização condicional
  if (loading) return <div className="p-10 text-center text-muted-foreground">Carregando notícia...</div>;
  if (!article) return <Navigate to="/noticias" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-accent/10 to-background">
          <div className="absolute inset-0">
            <img src={article.image} alt={article.imageAlt} className="w-full h-full object-cover opacity-20" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
          </div>

          <div className="container mx-auto px-4 relative py-24">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="secondary" className="text-xs uppercase tracking-wide">{article.categoryLabel}</Badge>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{article.subcategory}</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar size={16} className="mr-2" />{article.date}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock size={16} className="mr-2" />{readingTime} min de leitura
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground max-w-3xl mb-6">{article.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">{article.excerpt}</p>
            <div className="mt-4 text-sm text-muted-foreground">Por {article.author}</div>

            <div className="mt-10">
              <Button variant="ghost" asChild className="gap-2">
                <Link to="/noticias"><ArrowLeft size={16} /> Voltar para todas as notícias</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Conteúdo principal */}
        <section className="py-16">
          <div className="container mx-auto px-4 grid lg:grid-cols-[2fr_1fr] gap-12">
            <article className="bg-card border border-border rounded-2xl shadow-sm p-8 space-y-8">
              {/* Tags */}
              <div className="-mt-2 flex flex-wrap gap-2" aria-label="Tags">
                {article.tags.map((tag: string) => (
                  <button
                    key={tag}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    onClick={() => handleTagClick(tag)}
                  >
                    <Tag size={12} aria-hidden="true" />
                    {tag}
                  </button>
                ))}
              </div>

              {/* Conteúdo */}

              {article.content.map((paragraph: string, index: number) => (
                <div
                  key={index}
                  className="text-lg leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(paragraph) }}
                />
              ))}

              {/* Destaques */}
              <blockquote className="border-l-4 border-accent pl-6 py-4 bg-accent/5 rounded-r-xl text-lg italic text-foreground">
                “{article.featuredQuote}”
              </blockquote>

              <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Destaques rápidos para levar consigo</h2>
                <p className="text-muted-foreground">
                  Transformamos a notícia em um formato leve para você compartilhar com a família, no estilo blog do instituto.
                </p>
                <ul className="space-y-3">
                  {article.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-secondary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {renderSource(article.sources)}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-3">Como aproveitar esta leitura</h2>
                <p className="text-sm text-muted-foreground">
                  Reserve alguns minutos para ler cada parágrafo com calma. Leia em voz alta com as crianças e faça pausas para comentar os destaques.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Leia também</h2>
                <div className="space-y-3">
                  {relatedArticles.map((news: any) => (
                    <Link
                      key={news.id}
                      to={`/noticias/${news.slug}`}
                      className="block group border border-border rounded-xl overflow-hidden hover:border-secondary transition-colors"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img src={`https://itesam.org.br/api/${news.image}`} alt={news.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{news.categoryLabel} · {news.subcategory}</span>
                          <span>{news.date}</span>
                        </div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-secondary transition-colors">{news.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{news.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Separator className="my-6" />

                {/* Tags */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Filtrar por tema</h2>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: string) => (
                      <Badge key={`tag-filter-${tag}`} variant="outline" className="cursor-pointer" onClick={() => handleTagClick(tag)}>
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
