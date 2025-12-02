import newsImage1 from "@/assets/IMG_1522.jpg";
import newsImage2 from "@/assets/IMG_1524.jpg";
import newsImage3 from "@/assets/IMG_1525.jpg";
import newsImage4 from "@/assets/IMG_1526.jpg";
import newsImage5 from "@/assets/IMG_1528.jpg";
import newsImage6 from "@/assets/IMG_1529.jpg";

export type NewsCategory = "noticias" | "comunicados";

export interface NewsSource {
  label: string;
  url?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  date: string;
  publishAt: string;
  author: string;
  category: NewsCategory;
  categoryLabel: string;
  subcategory: string;
  tags: string[];
  content: string[];
  highlights: string[];
  featuredQuote: string;
  sources: NewsSource[];
  isHighlighted?: boolean;
}

const rawNewsItems: NewsItem[] = [
  {
    id: "1",
    slug: "festa-dia-das-criancas-encanta-com-muita-cor",
    title: "Festa do Dia das Crianças encanta com muita cor",
    excerpt:
      "Crianças atendidas pelo Instituto ITESAM aproveitaram oficinas artísticas e levaram para casa lembranças cheias de carinho.",
    image: newsImage1,
    imageAlt: "Crianças pintando em uma grande folha colorida durante a festa do Dia das Crianças do Instituto ITESAM",
    date: "12 Out 2023",
    publishAt: "2023-10-12T09:00:00-04:00",
    author: "Equipe ITESAM",
    category: "noticias",
    categoryLabel: "Notícias",
    subcategory: "Eventos",
    tags: ["Infância", "Arte", "Inclusão"],
    content: [
      "O pátio do Instituto ITESAM amanheceu tomado por cores, sorrisos e muita música no Dia das Crianças. A programação especial contou com oficinas de pintura, contação de histórias e experiências sensoriais preparadas para acolher diferentes faixas etárias.",
      "Logo na chegada, as famílias foram recebidas com um mural colaborativo. Cada criança deixou a sua marca com tintas laváveis e escreveu um desejo para os próximos meses. Ao lado, voluntárias da comunidade indígena Tukano montaram uma roda de conversas para apresentar cantigas tradicionais.",
      "Para fechar a manhã, a equipe pedagógica organizou uma vivência de leitura com tapetes interativos. Enquanto as crianças exploravam as histórias, mães e responsáveis receberam orientações sobre como criar pequenos rituais de leitura em casa sem precisar de muitos materiais.",
    ],
    highlights: [
      "Mais de 80 crianças participaram das oficinas artísticas.",
      "Voluntárias indígenas apresentaram cantigas e brincadeiras tradicionais.",
      "Famílias receberam um kit com livros e sugestões de atividades para casa.",
    ],
    featuredQuote:
      "Quando a gente vê cada criança experimentando novas texturas e levando um livro para casa, entende que a leitura é uma festa diária.",
    sources: [
      {
        label: "Relatório interno ITESAM – outubro/2023",
      },
    ],
    isHighlighted: true,
  },
  {
    id: "2",
    slug: "equipe-prepara-kits-de-brincadeiras-para-as-familias",
    title: "Equipe prepara kits de brincadeiras para as famílias",
    excerpt:
      "Voluntários se reuniram para montar cestas e atividades lúdicas, garantindo um atendimento acolhedor às crianças da região.",
    image: newsImage2,
    imageAlt: "Voluntários organizando kits de brincadeiras com brinquedos educativos sobre uma mesa",
    date: "10 Out 2023",
    publishAt: "2023-10-10T09:00:00-04:00",
    author: "Comunicação ITESAM",
    category: "noticias",
    categoryLabel: "Notícias",
    subcategory: "Ações comunitárias",
    tags: ["Voluntariado", "Brincar", "Sustentabilidade"],
    content: [
      "Em clima de mutirão, voluntários e moradores parceiros passaram a tarde separando materiais pedagógicos que serão entregues às crianças nos próximos encontros. A ação faz parte da preparação para a Semana do Brincar, iniciativa que pretende reforçar a importância da ludicidade na infância.",
      "Cada kit contém itens recicláveis reaproveitados, instruções simples para construir brinquedos e cartões com desafios para a família realizar junta. A ideia é mostrar que brincar pode ser acessível, sustentável e cheio de significado.",
      "Durante o encontro, a equipe de psicologia do instituto também orientou os voluntários sobre como acolher as famílias que chegam ao projeto pela primeira vez, reforçando um atendimento humanizado em todas as etapas.",
    ],
    highlights: [
      "Foram montados 120 kits de brincadeiras sustentáveis.",
      "Cada kit traz instruções de jogos cooperativos para fazer em casa.",
      "Voluntários receberam formação sobre acolhimento e escuta ativa.",
    ],
    featuredQuote:
      "O kit é só o começo. O que importa é a conversa que acontece quando a família abre a sacola e começa a construir memórias.",
    sources: [
      {
        label: "Semana do Brincar – planejamento pedagógico",
      },
    ],
    isHighlighted: true,
  },
  {
    id: "3",
    slug: "balao-magico-leva-alegria-e-esperanca-a-manaus",
    title: "Balão Mágico leva alegria e esperança a Manaus",
    excerpt:
      "Famílias indígenas participaram de um momento especial com distribuição de brinquedos e apoio socioemocional.",
    image: newsImage3,
    imageAlt: "Crianças indígenas segurando balões coloridos durante ação social do Instituto ITESAM",
    date: "08 Out 2023",
    publishAt: "2023-10-08T09:00:00-04:00",
    author: "Comunicação ITESAM",
    category: "noticias",
    categoryLabel: "Notícias",
    subcategory: "Projetos especiais",
    tags: ["Cultura", "Primeira infância", "Acolhimento"],
    content: [
      "O projeto Balão Mágico desembarcou na zona norte de Manaus levando brinquedos, livros e atividades de fortalecimento de vínculos. A ação foi construída em parceria com lideranças indígenas que vivem na região metropolitana e que sonham com espaços mais acolhedores para as crianças.",
      "Além da entrega dos brinquedos, o dia foi marcado por rodas de conversa com psicólogos e assistentes sociais. As famílias puderam compartilhar desafios e trocar estratégias para manter as crianças estudando e brincando com segurança.",
      "Ao final, as crianças foram convidadas a escrever recados de incentivo para si mesmas. As mensagens ficarão expostas no espaço cultural do instituto durante todo o mês, lembrando que elas são protagonistas de suas próprias histórias.",
    ],
    highlights: [
      "A ação atendeu 60 famílias indígenas que vivem na capital.",
      "Profissionais voluntários ofereceram rodas de conversa e acolhimento.",
      "As crianças deixaram mensagens de incentivo que ficarão expostas no instituto.",
    ],
    featuredQuote:
      "Cada balão que sobe leva um recado de esperança. É a infância dizendo que merece ser celebrada todos os dias.",
    sources: [
      {
        label: "Registro audiovisual da ação Balão Mágico",
      },
    ],
  },
  {
    id: "4",
    slug: "comunicado-programacao-especial-de-voluntariado",
    title: "Comunicado: programação especial de voluntariado",
    excerpt:
      "Confira os horários estendidos para receber voluntários durante nossa semana de atividades comemorativas.",
    image: newsImage4,
    imageAlt: "Voluntários conversando em auditório durante treinamento",
    date: "05 Out 2023",
    publishAt: "2023-10-05T09:00:00-04:00",
    author: "Equipe de Voluntariado",
    category: "comunicados",
    categoryLabel: "Comunicados",
    subcategory: "Avisos importantes",
    tags: ["Voluntariado", "Formação", "Programação"],
    content: [
      "Durante a semana comemorativa do instituto, teremos uma programação ampliada para acolher voluntários que desejam contribuir com as atividades culturais e de apoio às famílias.",
      "Os turnos extras foram organizados para atender quem só consegue participar no período da noite. Também estamos abrindo horários para capacitações rápidas, com foco em escuta ativa, primeiros socorros emocionais e mediação de leitura.",
      "Para garantir um fluxo tranquilo, pedimos que os interessados realizem a inscrição antecipada pelo formulário oficial. Assim, conseguimos organizar os grupos e oferecer a melhor experiência possível a quem doa seu tempo.",
    ],
    highlights: [
      "Turnos noturnos disponíveis de terça a quinta-feira.",
      "Minicapacitações presenciais sobre escuta e leitura acolhedora.",
      "Inscrições devem ser feitas até 48h antes da atividade.",
    ],
    featuredQuote:
      "O voluntariado transforma quem recebe e quem oferece apoio. Organizar os horários é a chave para que todos vivam essa experiência.",
    sources: [
      {
        label: "Formulário de inscrição de voluntariado",
        url: "https://itesam.org.br/formulario-voluntariado",
      },
    ],
  },
  {
    id: "5",
    slug: "voluntarias-celebram-conquistas-com-as-familias",
    title: "Voluntárias celebram conquistas com as famílias",
    excerpt:
      "Time de mulheres inspiradoras reforçou a importância da rede de apoio durante o encerramento das atividades.",
    image: newsImage5,
    imageAlt: "Grupo de mulheres reunidas em círculo sorrindo durante sarau comunitário",
    date: "03 Out 2023",
    publishAt: "2023-10-03T09:00:00-04:00",
    author: "Equipe ITESAM",
    category: "noticias",
    categoryLabel: "Notícias",
    subcategory: "Rede de apoio",
    tags: ["Mulheres", "Comunidade", "Arte"],
    content: [
      "O encerramento do ciclo de oficinas de artesanato foi marcado por depoimentos emocionantes de mulheres que se reconheceram como referência em suas comunidades. As voluntárias destacaram a importância de manter encontros constantes para fortalecer a autoestima coletiva.",
      "Ao longo do mês, foram construídos painéis colaborativos que mostram a trajetória das famílias atendidas pelo instituto. Cada peça exposta revela um pouco da história de superação e da rede de apoio que vem se formando.",
      "O evento terminou com um sarau intimista. Poemas, músicas autorais e receitas compartilhadas mostraram que construir comunidade é um trabalho afetivo e cheio de criatividade.",
    ],
    highlights: [
      "Mulheres compartilharam histórias de transformação e afeto.",
      "Painéis colaborativos contarão com exposição permanente no instituto.",
      "Sarau de encerramento reuniu música, poesia e culinária afetiva.",
    ],
    featuredQuote:
      "Quando nos reconhecemos umas nas outras, abrimos espaço para que as crianças também cresçam acreditando em seus sonhos.",
    sources: [
      {
        label: "Sarau Rede de Apoio – registros internos",
      },
    ],
  },
  {
    id: "6",
    slug: "comunicado-agenda-de-recreacao-inclusiva",
    title: "Comunicado: agenda de recreação inclusiva",
    excerpt:
      "Nossas atividades musicais seguem abertas para todas as crianças inscritas. Garanta a participação da sua família.",
    image: newsImage6,
    imageAlt: "Crianças participando de roda musical com instrumentos inclusivos",
    date: "01 Out 2023",
    publishAt: "2023-10-01T09:00:00-04:00",
    author: "Equipe Pedagógica",
    category: "comunicados",
    categoryLabel: "Comunicados",
    subcategory: "Programação",
    tags: ["Inclusão", "Música", "Família"],
    content: [
      "Estamos com inscrições abertas para a nova temporada da recreação inclusiva. As atividades musicais serão adaptadas para atender crianças com diferentes necessidades de comunicação e mobilidade.",
      "Os encontros acontecerão aos sábados, em dois horários, e contarão com apoio de intérpretes de Libras e profissionais de psicomotricidade. As famílias também participarão de rodas de conversa sobre como criar ambientes brincantes acessíveis em casa.",
      "Para participar, basta preencher o formulário disponível no site e aguardar a confirmação da equipe pedagógica. As vagas são limitadas para garantir um atendimento atencioso e personalizado.",
    ],
    highlights: [
      "Atividades com intérprete de Libras e apoio de psicomotricistas.",
      "Turmas divididas em dois horários aos sábados.",
      "Famílias receberão materiais para adaptar brincadeiras em casa.",
    ],
    featuredQuote:
      "A brincadeira fica completa quando todas as crianças conseguem participar com alegria e segurança.",
    sources: [
      {
        label: "Edital Recreação Inclusiva 2023",
      },
    ],
  },
  {
    id: "7",
    slug: "agendamento-mutirao-saude-da-familia",
    title: "Mutirão de saúde da família começa em dezembro",
    excerpt:
      "Nova edição do mutirão ampliará atendimentos médicos e odontológicos com foco em famílias ribeirinhas.",
    image: newsImage2,
    imageAlt: "Profissionais de saúde organizando equipamentos para mutirão",
    date: "10 Dez 2025",
    publishAt: "2025-12-10T09:00:00-04:00",
    author: "Coordenação de Saúde",
    category: "noticias",
    categoryLabel: "Notícias",
    subcategory: "Saúde",
    tags: ["Saúde", "Interior", "Atendimento"],
    content: [
      "O Instituto ITESAM está organizando uma nova edição do Mutirão de Saúde da Família para ampliar o acesso a consultas médicas e odontológicas nas comunidades ribeirinhas atendidas pelo programa.",
      "A mobilização prevê viagens quinzenais com equipes multidisciplinares e ações educativas em prevenção de doenças crônicas e saúde bucal.",
      "As atividades começam na segunda semana de dezembro e seguem até o final de janeiro, com foco especial nas famílias que estão em processo de acompanhamento psicossocial.",
    ],
    highlights: [
      "Agendamento automático para 150 famílias ribeirinhas.",
      "Equipe multidisciplinar com médicos, dentistas e psicólogos.",
      "Atendimentos organizados por distrito para facilitar a logística das viagens.",
    ],
    featuredQuote:
      "A cada viagem, reforçamos que saúde integral precisa chegar a todas as margens do rio.",
    sources: [
      {
        label: "Plano Operacional Mutirão Saúde 2025",
      },
    ],
    isHighlighted: true,
  },
];

const isPublished = (news: NewsItem) => new Date(news.publishAt).getTime() <= Date.now();

export const newsItems = rawNewsItems;

export const getPublishedNews = () =>
  rawNewsItems
    .filter(isPublished)
    .sort((a, b) => {
      if (a.isHighlighted && !b.isHighlighted) {
        return -1;
      }
      if (!a.isHighlighted && b.isHighlighted) {
        return 1;
      }
      return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
    });

export const getNewsBySlug = (slug: string) =>
  rawNewsItems.find((news) => news.slug === slug && isPublished(news));

export const getUpcomingNews = () => rawNewsItems.filter((news) => !isPublished(news));
