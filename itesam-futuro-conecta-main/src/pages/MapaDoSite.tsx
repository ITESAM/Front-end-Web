import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const MapaDoSite = () => {
  const siteStructure = [
    {
      title: "Navegação Principal",
      links: [
        { name: "Home", path: "/" },
        { name: "Quem Somos", path: "/quem-somos" },
        { name: "Galeria", path: "/galeria" },
        { name: "Notícias", path: "/noticias" },
        { name: "Contato", path: "/contato" },
        { name: "Mapa do Site", path: "/mapa-do-site" },
      ],
    },
    {
      title: "Institucional",
      links: [
        { name: "Nossa História", path: "/quem-somos#historia" },
        { name: "Missão e Valores", path: "/quem-somos#missao" },
        { name: "Equipe", path: "/quem-somos#equipe" },
        { name: "Estrutura Organizacional", path: "/quem-somos#estrutura" },
      ],
    },
    {
      title: "Serviços e Programas",
      links: [
        { name: "Assistência Social", path: "/#servicos" },
        { name: "Atendimento Médico", path: "/#servicos" },
        { name: "Fisioterapia", path: "/#servicos" },
        { name: "Psicologia", path: "/#servicos" },
        { name: "Fonoaudiologia", path: "/#servicos" },
      ],
    },
    {
      title: "Galeria e Mídia",
      links: [
        { name: "Galeria de Projetos", path: "/galeria" },
        { name: "Ações Sociais", path: "/galeria" },
        { name: "Eventos", path: "/galeria" },
        { name: "Formação e Capacitação", path: "/galeria" },
        { name: "Saúde Comunitária", path: "/galeria" },
      ],
    },
    {
      title: "Comunicação",
      links: [
        { name: "Notícias", path: "/noticias" },
        { name: "Blog", path: "/noticias" },
        { name: "Artigos", path: "/noticias" },
        { name: "Comunicados", path: "/noticias" },
      ],
    },
    {
      title: "Contato e Atendimento",
      links: [
        { name: "Fale Conosco", path: "/contato" },
        { name: "Formulário de Contato", path: "/contato#formulario" },
        { name: "Localização", path: "/contato#localizacao" },
        { name: "Telefones e E-mails", path: "/contato#informacoes" },
      ],
    },
    {
      title: "Transparência",
      links: [
        { name: "Estatuto ITESAM", path: "/documents/estatuto-itesam.pdf", external: true },
        { name: "Documentos Institucionais", path: "/quem-somos#documentos" },
        { name: "Relatórios de Atividades", path: "/quem-somos#relatorios" },
      ],
    },
    {
      title: "Acessibilidade",
      links: [
        { name: "Recursos de Acessibilidade", path: "/#acessibilidade" },
        { name: "Alto Contraste", path: "/#acessibilidade" },
        { name: "Ajuste de Fonte", path: "/#acessibilidade" },
        { name: "Leitura Fácil", path: "/#acessibilidade" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-primary/5 border-b-4 border-primary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Mapa do Site
            </h1>
            <p className="text-lg text-muted-foreground">
              Navegue por todas as páginas e recursos disponíveis no portal do ITESAM
            </p>
          </div>
        </section>

        {/* Sitemap Content */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {siteStructure.map((section, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="border-b-3 border-primary pb-3 mb-4">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        {link.external ? (
                          <a
                            href={link.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 text-base"
                          >
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            {link.name}
                          </a>
                        ) : (
                          <Link
                            to={link.path}
                            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 text-base"
                          >
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <section className="py-8 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-sm">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Se você não encontrou o que procura, entre em{' '}
              <Link to="/contato" className="text-primary hover:underline font-medium">
                contato conosco
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MapaDoSite;
