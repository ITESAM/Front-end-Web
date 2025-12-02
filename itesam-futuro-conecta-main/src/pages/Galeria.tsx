import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Eye, User } from "lucide-react";
import { api } from "@/api/api";

const Galeria = () => {
  const [activeCategory, setActiveCategory] = useState("Para você");
  const [projects, setProjects] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [autores, setAutores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaleria = async () => {
      try {
        const response = await api.get("galeria/get_list_front_galeria.php");

        // axios traz response.status (HTTP) e response.data (payload)
        // seu endpoint retorna { status: true, data: [...] }
        if (response.status === 200 && response.data && response.data.status) {
          const items = response.data.data; // <-- o array real

          if (!Array.isArray(items)) {
            console.error("Resposta inesperada: 'data' não é um array", items);
            setProjects([]);
            setCategorias([]);
            setAutores([]);
            return;
          }

          // 🔹 Define os projetos
          setProjects(items);

          // 🔹 Extrai categorias únicas (supondo que a propriedade seja `categoria_id` ou `category`)
          const uniqueCategorias = Array.from(
            new Set(items.map((item: any) => item.categoria_nome || item.categoria_id))
          )
            .filter(Boolean)
            .map((cat: any, idx: number) => ({
              id: idx,
              nome: String(cat),
            }));
          setCategorias(uniqueCategorias);

          // 🔹 Extrai autores únicos
          const uniqueAutores = Array.from(
            new Set(items.map((item: any) => item.author || item.autor))
          )
            .filter(Boolean)
            .map((autor) => ({ nome: autor }));
          setAutores(uniqueAutores);
        } else {
          console.error("Erro ao buscar galeria:", response.data?.message ?? response.statusText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGaleria();
  }, []);

  // 🔹 Cria lista de botões de categoria dinâmicos
  const categories = [
    { id: "todos", label: "Para você" },
    ...categorias.map((cat) => ({
      id: cat.id,
      label: cat.nome,
    })),
  ];

  // 🔹 Filtra os projetos de acordo com a categoria selecionada
  const filteredProjects =
    activeCategory === "Para você"
      ? projects
      : projects.filter((proj) => proj.categoria_nome === activeCategory);

  // 🔹 Define as classes de tamanho (mantido igual)
  const getSizeClass = (size: string) => {
    switch (size) {
      case "large":
        return "md:row-span-2";
      case "medium":
        return "md:row-span-1";
      case "small":
        return "md:row-span-1";
      default:
        return "";
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Galeria de Projetos
            </h1>
            <p className="text-muted-foreground">
              Confira os momentos especiais de nossas ações e eventos
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-6 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.label ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.label)}
                  className="whitespace-nowrap flex-shrink-0 rounded-full"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-center text-muted-foreground">
                Carregando galeria...
              </p>
            ) : filteredProjects.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhuma imagem encontrada nesta categoria.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[280px]">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`group relative overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-all duration-300 ${getSizeClass(
                      project.size
                    )}`}
                  >
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={`https://itesam.org.br/api/${project.url_image}`}
                        alt={project.titulo}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-4 right-4 flex gap-2">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Heart size={14} className="text-white" />
                            <span className="text-white text-sm font-medium">
                              {project.likes}
                            </span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Eye size={14} className="text-white" />
                            <span className="text-white text-sm font-medium">
                              {project.views}
                            </span>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                            {project.titulo}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-0 transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-medium">
                          {project.autor}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Galeria;
