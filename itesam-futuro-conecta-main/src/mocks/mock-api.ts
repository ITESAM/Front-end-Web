import type { ApiRequestOptions, HttpMethod } from "@/lib/api-client";
import { PaginatedResult, PostRecord, HelpRequestRecord, VolunteerRecord } from "@/types/entities";
import {
  mockForms,
  mockVolunteers,
  mockHelpRequests,
  mockPosts,
  mockUsers,
  mockActivities,
  generateId,
} from "@/mocks/data";
import { getCollectionDefaults, getFormFieldOptionLabel } from "@/config/dashboard";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const PUBLIC_AUTHOR = "Formulário público";

const toTrimmedString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const parseContactValue = (value: unknown) => {
  const contact = toTrimmedString(value);
  if (!contact) {
    return { email: undefined, phone: undefined, raw: undefined };
  }
  if (contact.includes("@")) {
    return { email: contact, phone: undefined, raw: contact };
  }
  return { email: undefined, phone: contact, raw: contact };
};

const mergeTags = (...tagGroups: Array<string[] | undefined>) => {
  const unique = new Set<string>();
  tagGroups.forEach((group) => {
    group?.forEach((tag) => {
      if (tag) unique.add(tag);
    });
  });
  return Array.from(unique);
};

const database = {
  forms: clone(mockForms),
  volunteers: clone(mockVolunteers),
  helpRequests: clone(mockHelpRequests),
  posts: clone(mockPosts),
  users: clone(mockUsers),
  activity: clone(mockActivities),
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const parseNumber = (value: string | number | undefined | null, fallback: number) => {
  const result = typeof value === "string" ? Number.parseInt(value, 10) : typeof value === "number" ? value : fallback;
  return Number.isNaN(result) || result <= 0 ? fallback : result;
};

const parseBody = (body: ApiRequestOptions["body"]) => {
  if (!body) return {} as Record<string, unknown>;
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch (error) {
      console.warn("Não foi possível converter body para JSON", error);
      return {};
    }
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const result: Record<string, unknown> = {};
    body.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (typeof body === "object") {
    return body as Record<string, unknown>;
  }

  return {} as Record<string, unknown>;
};

const withinDateRange = (value: string, start?: string, end?: string) => {
  const current = new Date(value).getTime();
  if (Number.isNaN(current)) return false;
  if (start) {
    const startDate = new Date(start).getTime();
    if (!Number.isNaN(startDate) && current < startDate) return false;
  }
  if (end) {
    const endDate = new Date(end).getTime();
    if (!Number.isNaN(endDate) && current > endDate) return false;
  }
  return true;
};

const paginate = <T>(items: T[], page: number, perPage: number): PaginatedResult<T> => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  return {
    data: items.slice(start, end),
    meta: {
      page: currentPage,
      perPage,
      totalPages,
      totalItems,
    },
  };
};

const registerActivity = (tipo: string, descricao: string, usuario?: string) => {
  database.activity.unshift({
    id: generateId("act"),
    tipo,
    descricao,
    usuario: usuario ?? "Equipe ITESAM",
    criadoEm: new Date().toISOString(),
  });
  database.activity = database.activity.slice(0, 40);
};

const computeFormMetrics = (forms = database.forms) => {
  const total = forms.length;
  const novos = forms.filter((form) => form.status === "novo").length;
  const revisados = forms.filter((form) => form.status === "revisado").length;
  const arquivados = forms.filter((form) => form.status === "arquivado").length;
  return { total, novos, revisados, arquivados };
};

const computeVolunteerMetrics = (volunteers = database.volunteers) => {
  const total = volunteers.length;
  const pendentes = volunteers.filter((vol) => vol.status === "pendente").length;
  const ativos = volunteers.filter((vol) => vol.status === "ativo").length;
  const arquivados = volunteers.filter((vol) => vol.status === "arquivado").length;
  return { total, pendentes, ativos, arquivados };
};

const computeHelpMetrics = (requests = database.helpRequests) => {
  const total = requests.length;
  const novos = requests.filter((request) => request.status === "novo").length;
  const emAnalise = requests.filter((request) => request.status === "em análise").length;
  const resolvidos = requests.filter((request) => request.status === "resolvido").length;
  const arquivados = requests.filter((request) => request.status === "arquivado").length;
  return { total, novos, emAnalise, resolvidos, arquivados };
};

const computePostMetrics = (posts = database.posts) => {
  const publicadas = posts.filter((post) => post.status === "publicado").length;
  const rascunhos = posts.filter((post) => post.status === "rascunho").length;
  const emRevisao = posts.filter((post) => post.status === "em_revisao").length;
  const arquivadas = posts.filter((post) => post.status === "arquivado").length;
  const visualizacoes = posts.reduce((total, post) => total + (post.visualizacoes ?? 0), 0);
  return { publicadas, rascunhos, emRevisao, arquivadas, visualizacoes };
};

const getDashboardOverview = () => {
  const formsMetrics = computeFormMetrics();
  const volunteerMetrics = computeVolunteerMetrics();
  const helpMetrics = computeHelpMetrics();
  const postMetrics = computePostMetrics();

  const recentSubmissions = clone(
    [...database.forms]
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, 6)
  );

  const activity = clone(database.activity.slice(0, 8));

  return {
    metrics: {
      forms: formsMetrics,
      volunteers: {
        total: volunteerMetrics.total,
        novos: volunteerMetrics.pendentes,
        revisados: volunteerMetrics.ativos,
        arquivados: volunteerMetrics.arquivados,
        ativos: volunteerMetrics.ativos,
      },
      help: {
        total: helpMetrics.total,
        novos: helpMetrics.novos,
        revisados: helpMetrics.resolvidos,
        arquivados: helpMetrics.arquivados,
        emAnalise: helpMetrics.emAnalise,
        resolvidos: helpMetrics.resolvidos,
      },
      posts: postMetrics,
    },
    recentSubmissions,
    activity,
  };
};

const listForms = (options?: ApiRequestOptions) => {
  const params = options?.params ?? {};
  const page = parseNumber(params.page as string, 1);
  const perPage = parseNumber(params.perPage as string, 10);
  const status = (params.status as string | undefined)?.toLowerCase();
  const tag = params.tag as string | undefined;
  const type = params.type as string | undefined;
  const search = params.q as string | undefined;
  const startDate = params.startDate as string | undefined;
  const endDate = params.endDate as string | undefined;

  const filtered = database.forms
    .filter((form) => {
      if (status && form.status !== status) return false;
      if (tag && !form.tags?.some((item) => item.toLowerCase() === tag.toLowerCase())) return false;
      if (type && form.tipo !== type) return false;
      if (!withinDateRange(form.criadoEm, startDate, endDate)) return false;
      if (search) {
        const term = search.toLowerCase();
        const combined = [
          form.nome,
          form.email,
          form.telefone,
          form.tipo,
          ...(form.tags ?? []),
          ...Object.values(form.dados ?? {}).map((value) => String(value)),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());
        if (!combined.some((value) => value.includes(term))) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const metrics = computeFormMetrics(filtered);
  const paginated = paginate(filtered, page, perPage);

  return {
    ...paginated,
    metrics: {
      total: metrics.total,
      novos: metrics.novos,
      revisados: metrics.revisados,
      arquivados: metrics.arquivados,
    },
  };
};

const updateForm = (path: string, options?: ApiRequestOptions) => {
  const id = path.split("/").at(-1);
  if (!id) throw new Error("Formulário não encontrado");
  const payload = parseBody(options?.body);
  const form = database.forms.find((item) => item.id === id);
  if (!form) throw new Error("Formulário não encontrado");

  const now = new Date().toISOString();
  const updatedBy = (payload.updatedBy as string) ?? "Equipe ITESAM";

  if (payload.status && typeof payload.status === "string" && payload.status !== form.status) {
    form.status = payload.status;
    form.historico = [...(form.historico ?? []), { status: payload.status, data: now, por: updatedBy }];
  }

  if (Array.isArray(payload.tags)) {
    form.tags = payload.tags as string[];
  }

  form.atualizadoEm = now;
  form.atualizadoPor = updatedBy;

  registerActivity("form", `atualizou o formulário de ${form.nome}` , updatedBy);

  return clone(form);
};

const listVolunteers = (options?: ApiRequestOptions) => {
  const params = options?.params ?? {};
  const page = parseNumber(params.page as string, 1);
  const perPage = parseNumber(params.perPage as string, 10);
  const status = (params.status as string | undefined)?.toLowerCase();
  const tag = params.tag as string | undefined;
  const search = params.q as string | undefined;
  const startDate = params.startDate as string | undefined;
  const endDate = params.endDate as string | undefined;

  const filtered = database.volunteers
    .filter((volunteer) => {
      if (status && volunteer.status !== status) return false;
      if (tag && !volunteer.tags?.some((item) => item.toLowerCase() === tag.toLowerCase())) return false;
      if (!withinDateRange(volunteer.criadoEm, startDate, endDate)) return false;
      if (search) {
        const term = search.toLowerCase();
        const fields = [
          volunteer.nome,
          volunteer.email,
          volunteer.telefone,
          volunteer.contato,
          volunteer.cidade,
          volunteer.bairro,
          volunteer.areaAtuacao,
          volunteer.turno,
          ...(volunteer.tags ?? []),
          ...(volunteer.diasDisponiveis ?? []),
          ...(volunteer.modalidadeAjuda ?? []),
          volunteer.experiencia,
          volunteer.motivacao,
          volunteer.descricaoContribuicao,
          volunteer.disponibilidade,
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());
        if (!fields.some((value) => value.includes(term))) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const metrics = computeVolunteerMetrics(filtered);
  const paginated = paginate(filtered, page, perPage);

  return {
    ...paginated,
    metrics: {
      total: metrics.total,
      pendentes: metrics.pendentes,
      ativos: metrics.ativos,
      arquivados: metrics.arquivados,
    },
  };
};

const updateVolunteer = (path: string, options?: ApiRequestOptions) => {
  const id = path.split("/").at(-1);
  if (!id) throw new Error("Voluntário não encontrado");
  const payload = parseBody(options?.body);
  const volunteer = database.volunteers.find((item) => item.id === id);
  if (!volunteer) throw new Error("Voluntário não encontrado");

  const now = new Date().toISOString();
  const updatedBy = (payload.updatedBy as string) ?? "Equipe ITESAM";

  if (payload.status && typeof payload.status === "string" && payload.status !== volunteer.status) {
    volunteer.status = payload.status as typeof volunteer.status;
    volunteer.historico = [...(volunteer.historico ?? []), { status: payload.status as string, data: now, por: updatedBy }];
  }

  if (Array.isArray(payload.tags)) {
    volunteer.tags = payload.tags as string[];
  }

  volunteer.atualizadoEm = now;
  volunteer.atualizadoPor = updatedBy;

  registerActivity("volunteer", `atualizou o cadastro de ${volunteer.nome}`, updatedBy);

  return clone(volunteer);
};

const createHelpRequest = (options?: ApiRequestOptions) => {
  const payload = parseBody(options?.body);
  const now = new Date().toISOString();
  const id = generateId("help");
  const nome = toTrimmedString(payload.nome_completo) || "Contato anônimo";
  const contact = parseContactValue(payload.contato);
  const categoriaValue = toTrimmedString(payload.categoria_ajuda);
  const categoriaLabel = categoriaValue
    ? getFormFieldOptionLabel("form_pedir_ajuda", "categoria_ajuda", categoriaValue)
    : undefined;
  const descricaoAjuda = toTrimmedString(payload.descricao_ajuda);
  const defaults = getCollectionDefaults("help_requests");
  const defaultTags = Array.isArray(defaults.tags) ? (defaults.tags as string[]) : [];
  const defaultStatus = typeof defaults.status === "string" ? defaults.status : undefined;
  const allowedStatuses: HelpRequestRecord["status"][] = ["novo", "em análise", "resolvido", "arquivado"];
  const status: HelpRequestRecord["status"] = allowedStatuses.includes(
    defaultStatus as HelpRequestRecord["status"],
  )
    ? (defaultStatus as HelpRequestRecord["status"])
    : "novo";

  const payloadTags = Array.isArray(payload.tags)
    ? (payload.tags as unknown[]).filter((tag): tag is string => typeof tag === "string")
    : [];

  const record: HelpRequestRecord = {
    id,
    nome,
    email: contact.email,
    telefone: contact.phone,
    contato: contact.raw,
    status,
    tags: mergeTags(defaultTags, payloadTags),
    criadoEm: now,
    tipoAjuda: (categoriaLabel ?? categoriaValue) || undefined,
    categoriaAjuda: categoriaValue || undefined,
    descricao: descricaoAjuda || undefined,
    descricaoAjuda: descricaoAjuda || undefined,
    consentimentoLgpd: Boolean(payload.consentimento_lgpd),
    historico: [{ status, data: now, por: PUBLIC_AUTHOR }],
  };

  database.helpRequests.unshift(record);
  registerActivity("help", `recebeu um novo pedido de ${record.nome}`, PUBLIC_AUTHOR);

  return clone(record);
};

const createVolunteer = (options?: ApiRequestOptions) => {
  const payload = parseBody(options?.body);
  const now = new Date().toISOString();
  const id = generateId("vol");
  const nome = toTrimmedString(payload.nome_completo) || "Cadastro sem nome";
  const contact = parseContactValue(payload.contato);
  const modalidadeValues = Array.isArray(payload.modalidade_ajuda)
    ? (payload.modalidade_ajuda as unknown[]).filter((item): item is string => typeof item === "string")
    : [];
  const modalidadeLabels = modalidadeValues.map((value) =>
    getFormFieldOptionLabel("form_voluntariado", "modalidade_ajuda", value)
  );
  const descricaoContribuicao = toTrimmedString(payload.descricao_contribuicao);
  const disponibilidadeValue = toTrimmedString(payload.disponibilidade);
  const disponibilidadeLabel = disponibilidadeValue
    ? getFormFieldOptionLabel("form_voluntariado", "disponibilidade", disponibilidadeValue)
    : undefined;
  const defaults = getCollectionDefaults("volunteers");
  const defaultTags = Array.isArray(defaults.tags) ? (defaults.tags as string[]) : [];
  const disponibilidadeDisplay = disponibilidadeLabel || (disponibilidadeValue || undefined);

  const payloadTags = Array.isArray(payload.tags)
    ? (payload.tags as unknown[]).filter((tag): tag is string => typeof tag === "string")
    : [];

  const record: VolunteerRecord = {
    id,
    nome,
    email: contact.email,
    telefone: contact.phone,
    contato: contact.raw,
    status: "pendente",
    tags: mergeTags(defaultTags, payloadTags),
    criadoEm: now,
    areaAtuacao: modalidadeLabels.length ? modalidadeLabels.join(", ") : undefined,
    modalidadeAjuda: modalidadeValues.length ? modalidadeValues : undefined,
    descricaoContribuicao: descricaoContribuicao || undefined,
    experiencia: descricaoContribuicao || undefined,
    motivacao: modalidadeLabels.length ? modalidadeLabels.join(", ") : undefined,
    origem: PUBLIC_AUTHOR,
    diasDisponiveis: disponibilidadeDisplay ? [disponibilidadeDisplay] : undefined,
    disponibilidade: disponibilidadeDisplay,
    turno: disponibilidadeDisplay,
    consentimentoLgpd: Boolean(payload.consentimento_lgpd),
    historico: [{ status: "pendente", data: now, por: PUBLIC_AUTHOR }],
  };

  database.volunteers.unshift(record);
  registerActivity("volunteer", `recebeu um novo cadastro de ${record.nome}`, PUBLIC_AUTHOR);

  return clone(record);
};

const listHelpRequests = (options?: ApiRequestOptions) => {
  const params = options?.params ?? {};
  const page = parseNumber(params.page as string, 1);
  const perPage = parseNumber(params.perPage as string, 10);
  const status = (params.status as string | undefined)?.toLowerCase();
  const tag = params.tag as string | undefined;
  const search = params.q as string | undefined;
  const startDate = params.startDate as string | undefined;
  const endDate = params.endDate as string | undefined;

  const filtered = database.helpRequests
    .filter((request) => {
      if (status && request.status !== status) return false;
      if (tag && !request.tags?.some((item) => item.toLowerCase() === tag.toLowerCase())) return false;
      if (!withinDateRange(request.criadoEm, startDate, endDate)) return false;
      if (search) {
        const term = search.toLowerCase();
        const fields = [
          request.nome,
          request.email,
          request.telefone,
          request.contato,
          request.tipoAjuda,
          request.categoriaAjuda,
          request.descricao,
          request.descricaoAjuda,
          ...(request.tags ?? []),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());
        if (!fields.some((value) => value.includes(term))) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const metrics = computeHelpMetrics(filtered);
  const paginated = paginate(filtered, page, perPage);

  return {
    ...paginated,
    metrics: {
      total: metrics.total,
      novos: metrics.novos,
      emAnalise: metrics.emAnalise,
      resolvidos: metrics.resolvidos,
      arquivados: metrics.arquivados,
    },
  };
};

const updateHelpRequest = (path: string, options?: ApiRequestOptions) => {
  const id = path.split("/").at(-1);
  if (!id) throw new Error("Pedido de ajuda não encontrado");
  const payload = parseBody(options?.body);
  const request = database.helpRequests.find((item) => item.id === id);
  if (!request) throw new Error("Pedido de ajuda não encontrado");

  const now = new Date().toISOString();
  const updatedBy = (payload.updatedBy as string) ?? "Equipe ITESAM";

  if (payload.status && typeof payload.status === "string" && payload.status !== request.status) {
    request.status = payload.status as typeof request.status;
    request.historico = [...(request.historico ?? []), { status: payload.status as string, data: now, por: updatedBy }];
  }

  if (Array.isArray(payload.tags)) {
    request.tags = payload.tags as string[];
  }

  request.atualizadoEm = now;
  request.atualizadoPor = updatedBy;

  registerActivity("help", `atualizou o pedido de ${request.nome}`, updatedBy);

  return clone(request);
};

const toSlug = (value: unknown) =>
  toTrimmedString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "on";
  }
  return false;
};

const parseTagsValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => toTrimmedString(item)).filter(Boolean);
  }

  const text = toTrimmedString(value);
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => toTrimmedString(item)).filter(Boolean);
    }
  } catch (error) {
    // ignore JSON parse errors and fallback to splitting by comma
  }

  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const ensureUniqueSlug = (slug: string, excludeId?: string) => {
  if (!slug) {
    throw new Error("Slug é obrigatório");
  }

  const exists = database.posts.some((post) => post.slug === slug && post.id !== excludeId);
  if (exists) {
    throw new Error("Slug já está em uso");
  }
};

const listPosts = (options?: ApiRequestOptions) => {
  const params = options?.params ?? {};
  const page = parseNumber(params.page as string, 1);
  const perPage = parseNumber(params.perPage as string, 10);
  const status = (params.status as string | undefined)?.toLowerCase();
  const search = params.q as string | undefined;

  const filtered = database.posts
    .filter((post) => {
      if (status && status !== "todos" && post.status !== status) return false;
      if (search) {
        const term = search.toLowerCase();
        const fields = [
          post.titulo,
          post.autor,
          post.categoria,
          post.subcategoria,
          post.resumo,
          post.conteudo,
          post.slug,
          ...(post.tags ?? []),
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase());
        if (!fields.some((value) => value.includes(term))) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const paginated = paginate(filtered, page, perPage);

  return {
    ...paginated,
    metrics: computePostMetrics(filtered),
  };
};

const savePost = (options?: ApiRequestOptions) => {
  const payload = parseBody(options?.body);
  const now = new Date().toISOString();
  const autor = (payload.autor as string) ?? "Equipe ITESAM";
  const status = (payload.status as PostRecord["status"]) ?? "rascunho";
  const slug = toSlug(payload.slug ?? payload.titulo ?? "");
  ensureUniqueSlug(slug);

  const newPost: PostRecord = {
    id: generateId("post"),
    slug,
    titulo: (payload.titulo as string) ?? "Nova publicação",
    autor,
    status,
    visualizacoes: Number(payload.visualizacoes ?? Math.floor(Math.random() * 500)),
    curtidas: Number(payload.curtidas ?? Math.floor(Math.random() * 150)),
    criadoEm: now,
    atualizadoEm: now,
    atualizadoPor: (payload.updatedBy as string) ?? autor,
    resumo: (payload.resumo ?? payload.descricaoCurta ?? "") as string,
    conteudo: (payload.conteudo as string) ?? "",
    categoria: (payload.categoria as string) ?? "Institucional",
    subcategoria: payload.subcategoria ? String(payload.subcategoria) : undefined,
    dataPublicacao: (payload.dataPublicacao as string) ?? now,
    agendamentoPublicacao: payload.agendamentoPublicacao ? String(payload.agendamentoPublicacao) : undefined,
    imagem: typeof payload.imagem === "string" ? (payload.imagem as string) : undefined,
    altImagem: payload.altImagem ? String(payload.altImagem) : undefined,
    destaque: parseBoolean(payload.destaque),
    tags: parseTagsValue(payload.tags),
    blocosEspeciais: payload.blocosEspeciais ? String(payload.blocosEspeciais) : undefined,
    fonte: payload.fonte ? String(payload.fonte) : undefined,
  };

  database.posts.unshift(newPost);
  registerActivity("post", `publicou ${newPost.titulo}` , newPost.autor);

  return clone(newPost);
};

const updatePost = (path: string, options?: ApiRequestOptions) => {
  const id = path.split("/").at(-1);
  if (!id) throw new Error("Postagem não encontrada");
  const payload = parseBody(options?.body);
  const post = database.posts.find((item) => item.id === id);
  if (!post) throw new Error("Postagem não encontrada");

  const now = new Date().toISOString();
  const updatedBy = (payload.updatedBy as string) ?? post.atualizadoPor ?? post.autor;

  if (payload.status && typeof payload.status === "string") {
    post.status = payload.status as PostRecord["status"];
  }

  if (payload.slug) {
    const newSlug = toSlug(payload.slug);
    ensureUniqueSlug(newSlug, post.id);
    post.slug = newSlug;
  }

  if (payload.titulo) post.titulo = payload.titulo as string;
  if (payload.resumo) post.resumo = payload.resumo as string;
  if (payload.conteudo) post.conteudo = payload.conteudo as string;
  if (payload.categoria) post.categoria = payload.categoria as string;
  if (payload.subcategoria) post.subcategoria = payload.subcategoria as string;
  if (payload.dataPublicacao) post.dataPublicacao = payload.dataPublicacao as string;
  if (payload.agendamentoPublicacao) post.agendamentoPublicacao = payload.agendamentoPublicacao as string;
  if (payload.autor) post.autor = payload.autor as string;
  if (payload.imagem && typeof payload.imagem === "string") post.imagem = payload.imagem;
  if (payload.altImagem) post.altImagem = payload.altImagem as string;
  if (payload.destaque !== undefined) post.destaque = parseBoolean(payload.destaque);
  if (payload.tags !== undefined) post.tags = parseTagsValue(payload.tags);
  if (payload.blocosEspeciais !== undefined) post.blocosEspeciais = payload.blocosEspeciais as string;
  if (payload.fonte !== undefined) post.fonte = payload.fonte as string;

  post.atualizadoEm = now;
  post.atualizadoPor = updatedBy;

  registerActivity("post", `atualizou ${post.titulo}` , updatedBy);

  return clone(post);
};

const patchPost = (path: string, options?: ApiRequestOptions) => {
  const id = path.split("/").at(-1);
  if (!id) throw new Error("Postagem não encontrada");
  const payload = parseBody(options?.body);
  const post = database.posts.find((item) => item.id === id);
  if (!post) throw new Error("Postagem não encontrada");

  const now = new Date().toISOString();
  const updatedBy = (payload.updatedBy as string) ?? post.atualizadoPor ?? "Equipe ITESAM";

  if (payload.status && typeof payload.status === "string") {
    post.status = payload.status as PostRecord["status"];
    post.historico = [...(post.historico ?? []), { status: payload.status as string, data: now, por: updatedBy }];
  }

  post.atualizadoEm = now;
  post.atualizadoPor = updatedBy;

  registerActivity("post", `alterou o status de ${post.titulo}` , updatedBy);

  return clone(post);
};

const listUsers = (options?: ApiRequestOptions) => {
  const params = options?.params ?? {};
  const page = parseNumber(params.page as string, 1);
  const perPage = parseNumber(params.perPage as string, 10);
  const search = params.q as string | undefined;

  const filtered = database.users
    .filter((user) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return [user.nome, user.email, user.role].some((field) => field.toLowerCase().includes(term));
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return paginate(filtered, page, perPage);
};

const updateUserRole = (path: string, options?: ApiRequestOptions) => {
  const id = path.split("/").at(-1);
  if (!id) throw new Error("Usuário não encontrado");
  const payload = parseBody(options?.body);
  const user = database.users.find((item) => item.id === id);
  if (!user) throw new Error("Usuário não encontrado");

  const now = new Date().toISOString();
  const updatedBy = (payload.updatedBy as string) ?? "Equipe ITESAM";

  if (payload.role && typeof payload.role === "string") {
    user.role = payload.role as typeof user.role;
  }

  user.atualizadoEm = now;
  user.atualizadoPor = updatedBy;

  registerActivity("user", `ajustou as permissões de ${user.nome}` , updatedBy);

  return clone(user);
};

const notFound = (method: HttpMethod, path: string) => {
  throw new Error(`Endpoint não encontrado: ${method} ${path}`);
};

export const mockApi = {
  async handle<T>(path: string, method: HttpMethod, options?: ApiRequestOptions): Promise<T> {
    await delay();

    if (method === "GET" && path === "/dashboard/overview") {
      return getDashboardOverview() as T;
    }

    if (path.startsWith("/forms")) {
      if (method === "GET" && path === "/forms") {
        return listForms(options) as T;
      }
      if (method === "PATCH") {
        return updateForm(path, options) as T;
      }
      return notFound(method, path);
    }

    if (path.startsWith("/volunteers")) {
      if (method === "GET" && path === "/volunteers") {
        return listVolunteers(options) as T;
      }
      if (method === "POST" && path === "/volunteers") {
        return createVolunteer(options) as T;
      }
      if (method === "PATCH") {
        return updateVolunteer(path, options) as T;
      }
      return notFound(method, path);
    }

    if (path.startsWith("/help")) {
      if (method === "GET" && path === "/help") {
        return listHelpRequests(options) as T;
      }
      if (method === "POST" && path === "/help") {
        return createHelpRequest(options) as T;
      }
      if (method === "PATCH") {
        return updateHelpRequest(path, options) as T;
      }
      return notFound(method, path);
    }

    if (path.startsWith("/posts")) {
      if (method === "GET" && path === "/posts") {
        return listPosts(options) as T;
      }
      if (method === "POST" && path === "/posts") {
        return savePost(options) as T;
      }
      if (method === "PUT") {
        return updatePost(path, options) as T;
      }
      if (method === "PATCH") {
        return patchPost(path, options) as T;
      }
      return notFound(method, path);
    }

    if (path.startsWith("/users")) {
      if (method === "GET" && path === "/users") {
        return listUsers(options) as T;
      }
      if (method === "PATCH") {
        return updateUserRole(path, options) as T;
      }
      return notFound(method, path);
    }

    return notFound(method, path);
  },
};
