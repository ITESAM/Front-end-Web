import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Target, Eye, Heart } from "lucide-react";

const QuemSomos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-accent to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">Quem Somos</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Instituto de Tecnologia, Ensino e Saúde da Amazônia - ITESAM
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
              Uma associação civil comprometida com o cuidado integral, educação e desenvolvimento 
              social de indivíduos e comunidades na Amazônia
            </p>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Missão</h3>
                <p className="text-muted-foreground">
                  Promover o cuidado integral e o desenvolvimento social através de
                  serviços especializados em saúde, educação e assistência social,
                  contribuindo para a construção de uma sociedade mais justa e inclusiva.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
                  <Eye className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Visão</h3>
                <p className="text-muted-foreground">
                  Ser referência nacional em cuidado integral e desenvolvimento social,
                  reconhecidos pela excelência, inovação e impacto positivo na vida das
                  pessoas e comunidades que atendemos.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Valores</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Respeito e dignidade humana</li>
                  <li>• Compromisso com a excelência</li>
                  <li>• Empatia e acolhimento</li>
                  <li>• Ética e transparência</li>
                  <li>• Inclusão e diversidade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-foreground text-center mb-12">
              Nossa História
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Fundação</h3>
                <p className="text-muted-foreground mb-4">
                  O Instituto de Tecnologia, Ensino e Saúde da Amazônia (ITESAM) foi 
                  constituído em 08 de novembro de 2008, como uma associação civil pessoa 
                  jurídica de direito privado, sem fins lucrativos e de duração indeterminada, 
                  com sede em Manaus-AM.
                </p>
                <p className="text-muted-foreground">
                  Nasceu da união de profissionais dedicados ao cuidado e ao desenvolvimento 
                  humano, com o objetivo de criar um espaço que oferecesse atendimento integral 
                  e de qualidade para indivíduos e famílias em situação de vulnerabilidade social.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Áreas de Atuação</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Pesquisa experimental e desenvolvimento tecnológico</li>
                  <li>• Educação Superior (Graduação e Pós-Graduação)</li>
                  <li>• Capacitação profissional e cursos livres</li>
                  <li>• Tecnologia da informação e inovação</li>
                  <li>• Promoção de voluntariado</li>
                  <li>• Consultoria em gestão empresarial e ambiental</li>
                  <li>• Serviços de saúde e assistência social</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Presente</h3>
                <p className="text-muted-foreground mb-4">
                  Ao longo dos anos, consolidamos nossa atuação através de projetos inovadores 
                  e parcerias estratégicas, sempre mantendo o foco no ser humano e em suas 
                  necessidades fundamentais. Nossa equipe multidisciplinar trabalha de forma 
                  integrada para proporcionar cuidado holístico e transformador.
                </p>
                <p className="text-muted-foreground">
                  Hoje, somos reconhecidos pelo impacto positivo de nossas ações e pela 
                  dedicação incansável em construir um futuro melhor para todos aqueles que 
                  atendemos na região amazônica.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <a 
                  href="/documents/estatuto-itesam.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2"
                >
                  📄 Consultar Estatuto Social Completo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-foreground text-center mb-4">
              Estrutura Organizacional
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
              Uma equipe comprometida com a gestão, a transparência e o desenvolvimento de projetos de impacto
            </p>

            {/* Diretoria Executiva */}
            <div className="max-w-5xl mx-auto mb-16">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                  Diretoria Executiva
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">MA</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Manoel de Assis Monteiro
                  </h4>
                  <p className="text-sm text-primary font-medium">Diretor-Presidente</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">PS</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Paulo Roberto Pessoa Sampaio
                  </h4>
                  <p className="text-sm text-primary font-medium">
                    Diretor Administrativo-Financeiro
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">AD</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Adalberto Rodrigues Diniz
                  </h4>
                  <p className="text-sm text-primary font-medium">
                    Diretor de Projetos e Desenvolvimento de Negócios
                  </p>
                </div>
              </div>
            </div>

            {/* Conselho Fiscal */}
            <div className="max-w-5xl mx-auto mb-16">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                  Conselho Fiscal
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-secondary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-secondary">NM</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Najara Andrade Miranda Menezes
                  </h4>
                  <p className="text-sm text-secondary font-medium">Conselheira Fiscal</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-secondary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-secondary">AS</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    André Rodrigues da Silva
                  </h4>
                  <p className="text-sm text-secondary font-medium">Conselheiro Fiscal</p>
                </div>
              </div>
            </div>

            {/* Equipe de Apoio */}
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                  Equipe de Apoio e Coordenação
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground">AC</span>
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Ana Carla dos Santos Souza
                  </h4>
                  <p className="text-sm text-muted-foreground">Assessoria de Imprensa</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground">JT</span>
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Jozenete Trindade dos Santos
                  </h4>
                  <p className="text-sm text-muted-foreground">Coordenação Social</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground">BA</span>
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Beatriz Guimarães Ataíde
                  </h4>
                  <p className="text-sm text-muted-foreground">Administração</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground">GM</span>
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Glícia Martins
                  </h4>
                  <p className="text-sm text-muted-foreground">Assistência Social</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default QuemSomos;
