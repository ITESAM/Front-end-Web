export type StatusTipoFormulario = "contato" | "voluntario";
export type StatusFormulario = "novo" | "revisado" | "arquivado";

export interface BaseRecord {
  id: string;
  nome: string;
  email?: string;
  status: string;
  tags: string[];
  criadoEm: string;
  atualizadoEm?: string;
  atualizadoPor?: string;
  contato?: string;
  historico?: Array<{
    status: string;
    data: string;
    por: string;
  }>;
}

export interface FormularioRecord extends BaseRecord {
  tipo: StatusTipoFormulario;
  telefone?: string;
  dados?: Record<string, unknown>;
}

export type VolunteerStatus = "ativo" | "pendente" | "arquivado";

export interface VolunteerRecord extends BaseRecord {
  telefone?: string;
  cidade?: string;
  bairro?: string;
  areaAtuacao?: string;
  diasDisponiveis?: string[];
  turno?: string;
  experiencia?: string;
  motivacao?: string;
  origem?: string;
  documentos?: {
    rg?: string;
    cpf?: string;
    selfie?: string;
  };
  status: VolunteerStatus;
  modalidadeAjuda?: string[];
  descricaoContribuicao?: string;
  disponibilidade?: string;
  consentimentoLgpd?: boolean;
}

export type HelpStatus = "novo" | "em análise" | "resolvido" | "arquivado";

export interface HelpRequestRecord extends BaseRecord {
  telefone?: string;
  tipoAjuda?: string;
  descricao?: string;
  status: HelpStatus;
  categoriaAjuda?: string;
  descricaoAjuda?: string;
  consentimentoLgpd?: boolean;
}

export type PostStatus = "rascunho" | "em_revisao" | "publicado" | "arquivado";

export interface PostRecord {
  id: string;
  slug: string;
  titulo: string;
  autor: string;
  criadoEm: string;
  status: PostStatus;
  visualizacoes: number;
  curtidas: number;
  atualizadoEm?: string;
  atualizadoPor?: string;
  resumo?: string;
  conteudo?: string;
  categoria?: string;
  subcategoria?: string;
  dataPublicacao?: string;
  agendamentoPublicacao?: string;
  imagem?: string;
  altImagem?: string;
  destaque?: boolean;
  tags?: string[];
  blocosEspeciais?: string;
  fonte?: string;
}

export type UserRole = "admin" | "editor" | "visualizador";

export interface AdminUserRecord {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ultimoAcesso?: string;
  atualizadoEm?: string;
  atualizadoPor?: string;
}

export interface MetricsSummary {
  [key: string]: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
  metrics?: MetricsSummary;
}
