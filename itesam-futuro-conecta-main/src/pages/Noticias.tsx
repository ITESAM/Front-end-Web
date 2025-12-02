import { useEffect, KeyboardEvent, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/api/api";
import { useToast } from "@/hooks/use-toast";

const normalize = (v?: string) => (v ?? "").toString().trim().toLowerCase();



const Noticias = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // 🧠 Estados principais
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; label: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; nome: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; nome: string }[]>([]);
  const [publishedNews, setPublishedNews] = useState<any[]>([]);

  // ⚙️ Estados de filtro e busca
  // padrão: usamos os mesmos valores que populamos em `categories` / `subcategories` / `authors`
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("Todas");
  const [activeAuthor, setActiveAuthor] = useState<string>("Todos");
  const [search, setSearch] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 🔥 Carregar dados da API
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [categoriasRes, subcategoriasRes, autoresRes, tagRes, noticiasRes] = await Promise.all([
          api.get("categoria/get_list_categoria.php"),
          api.get("subcategoria/get_categoria_subcategoria.php"),
          api.get("autores/get_autores.php"),
          api.get("tags/get_list_tags.php"), // ✅ usa o endpoint correto
          api.get("postagens/get_list_ative_postagens.php", { params: { status: "ativo" } }),
        ]);

        // 🟨 Categorias — aqui usamos id = cat.nome para consistência nas comparações
        if (categoriasRes.data?.status && categoriasRes.data.data?.length > 0) {
          const categoriasComTodas = [
            { id: "Todas", label: "Todas" },
            ...categoriasRes.data.data.map((cat: any) => ({
              id: String(cat.nome ?? cat.id),
              label: cat.nome,
            })),
          ];
          setCategories(categoriasComTodas);
          // garante valor padrão somente se não houver escolha feita manualmente
          setActiveCategory((current) => (current ? current : "Todas"));
        } else {
          setCategories([{ id: "Todas", label: "Todas" }]);
          setActiveCategory("Todas");
        }

        // 🟧 Subcategorias
        if (subcategoriasRes.data?.status && subcategoriasRes.data.data?.length > 0) {
          const subsComTodas = [
            { id: "Todas", label: "Todas" },
            ...subcategoriasRes.data.data.map((sub: any) => ({
              id: String(sub.nome ?? sub.id),
              label: sub.nome,
            })),
          ];
          setSubcategories(subsComTodas);
          setActiveSubcategory((current) => (current ? current : "Todas"));
        } else {
          setSubcategories([{ id: "Todas", label: "Todas" }]);
          setActiveSubcategory("Todas");
        }

        // 🟦 Autores
        if (autoresRes.data?.status && autoresRes.data.data?.length > 0) {
          const autoresComTodos = [
            { id: "Todos", nome: "Todos" },
            ...autoresRes.data.data.map((autor: any) => ({
              id: String(autor.nome ?? autor.id),
              nome: autor.nome,
            })),
          ];
          setAuthors(autoresComTodos);
          setActiveAuthor((current) => (current ? current : "Todos"));
        } else {
          setAuthors([{ id: "Todos", nome: "Todos" }]);
          setActiveAuthor("Todos");
        }

        // 🟩 Tags
        if (tagRes.data?.sucesso && tagRes.data.dados?.length > 0) {
          setTags(
            tagRes.data.dados.map((tag: any) => ({
              id: String(tag.id),
              nome: tag.nome,
            }))
          );
        } else {
          setTags([]);
        }

        // 🟥 Notícias
        const formattedNews = noticiasRes.data.data.map((item: any) => {
          const imageUrl = item.image
            ? `https://itesam.org.br/api/${item.image}`
            : "https://placehold.co/600x400";

          // Converte para string no formato "dd/mm/yyyy"
          // Converte para string no formato "dd/mm/yyyy"
          let formattedDate = "";
          if (item.createdAt) {
            const d = new Date(item.createdAt);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toLocaleDateString("pt-BR");
            } else {
              // fallback caso venha algo inesperado
              formattedDate = String(item.createdAt).split(" ")[0].split("-").reverse().join("/");
            }
          }


          return {
            id: item.id,
            title: item.titulo,
            excerpt: item.subtitulo || (item.descricao ? item.descricao.substring(0, 120) + "..." : ""),
            image: imageUrl,
            date: formattedDate,
            category: item.categoryLabel ?? "Outros",
            subcategory: item.subcategory ?? "Geral",
            author: item.author ?? "Anônimo",
            tags: item.tags || [],
            content: item.content,
            slug: item.slug ?? String(item.id),
            featuredQuote: item.featuredQuote,
            highlights: item.highlights,
            likes: item.likes,
            views: item.views,
            status: item.status,
            sources: item.sources
          };
        });
        setPublishedNews(formattedNews);
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Verifique sua conexão ou tente novamente mais tarde.",
          variant: "destructive",
        });
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchAllData();
  }, [toast]);


  // 🔄 Atualiza tags selecionadas (mantive sua lógica URLSearchParams)
  const updateTags = (newTags: string[]) => {
    setSelectedTags(newTags);
    const params = new URLSearchParams(searchParams);
    if (newTags.length) {
      params.set("tags", newTags.map((tag) => encodeURIComponent(tag)).join(","));
    } else {
      params.delete("tags");
      params.delete("tag");
    }
    setSearchParams(params, { replace: true });
  };

  // 🔘 Limpar filtros (use valores id consistentes)
  const clearFilters = () => {
    setActiveCategory("Todas");
    setActiveSubcategory("Todas");
    setActiveAuthor("Todos");
    setSearch("");
    updateTags([]);
  };

  // 🏷️ Alternar tags
  const toggleTag = (tag: string) => {
    const tagExists = selectedTags.includes(tag);
    const newTags = tagExists ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag];
    updateTags(newTags);
  };

  // 🔍 Filtragem de notícias — comparações normalizadas
  const filteredNews = useMemo(() => {
    const searchTerm = normalize(search);
    const categoryTerm = normalize(activeCategory);
    const subcategoryTerm = normalize(activeSubcategory);
    const authorTerm = normalize(activeAuthor);
    const selectedTagsNorm = selectedTags.map((t) => normalize(t));

    return publishedNews.filter((news) => {
      // normaliza propriedades da notícia
      const newsCategory = normalize(news.category);
      const newsSubcategory = normalize(news.subcategory);
      const newsAuthor = normalize(news.author);
      const newsTags = (news.tags ?? []).map((t: string) => normalize(t));

      if (categoryTerm && categoryTerm !== normalize("Todas") && newsCategory !== categoryTerm) return false;
      if (subcategoryTerm && subcategoryTerm !== normalize("Todas") && newsSubcategory !== subcategoryTerm) return false;
      if (authorTerm && authorTerm !== normalize("Todos") && newsAuthor !== authorTerm) return false;

      if (selectedTagsNorm.length && !selectedTagsNorm.every((tag) => newsTags.includes(tag))) return false;

      if (!searchTerm) return true;

      const searchable = [
        news.title,
        news.excerpt,
        (news.content ?? []).join(" "),
        (news.tags ?? []).join(" "),
        news.author ?? "",
        news.subcategory ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(searchTerm);
    });
  }, [publishedNews, activeCategory, activeSubcategory, activeAuthor, selectedTags, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-accent to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">Notícias & Comunicados</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Fique por dentro das últimas novidades e comunicados do Instituto ITESAM
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6">
              {/* Categorias */}
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Busca e Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <Input
                    id="search-news"
                    placeholder="Busque por título, conteúdo ou tags"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select value={activeSubcategory} onValueChange={(v) => setActiveSubcategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={activeAuthor} onValueChange={(v) => setActiveAuthor(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.nome}>
                        {author.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2" aria-label="Filtrar por tags">
                {tags.map((tag) => {
                  const isActive = selectedTags.includes(tag.nome);
                  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleTag(tag.nome);
                    }
                  };

                  return (
                    <Badge
                      key={tag.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      variant={isActive ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.nome)}
                      onKeyDown={handleKeyDown}
                    >
                      #{tag.nome}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            {filteredNews.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map((news) => (
                  <NewsCard key={news.id} {...news} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted/40 p-12 text-center">
                <p className="text-lg text-muted-foreground">
                  Nenhuma notícia encontrada com os filtros selecionados. Ajuste os critérios ou limpe os filtros.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Noticias;
