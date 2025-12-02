import { DashboardConfig, FormDefinition, FormField } from "@/types/dashboard-config";

export const dashboardConfig: DashboardConfig = {
  version: "1.0.0",
  appId: "itesam-dashboard",
  i18nDefaultLocale: "pt-BR",
  routes: [
    {
      path: "/pedir-ajuda",
      title: "Pedir ajuda",
      component: "FormPage",
      formRef: "form_pedir_ajuda",
    },
    {
      path: "/voluntariado",
      title: "Quero ser voluntário",
      component: "FormPage",
      formRef: "form_voluntariado",
    },
  ],
  collections: [
    {
      name: "help_requests",
      primaryKey: "id",
      indexes: ["created_at", "categoria_ajuda", "status"],
      schema: {
        id: "uuid",
        nome_completo: "string",
        contato: "string",
        categoria_ajuda: "string",
        descricao_ajuda: "string",
        consentimento_lgpd: "boolean",
        status: "string",
        created_at: "datetime",
        updated_at: "datetime",
        tags: "string[]",
      },
      defaults: {
        status: "aberto",
        tags: ["help_request", "canal:dashboard", "origem:itesam", "fluxo:pedir_ajuda"],
      },
    },
    {
      name: "volunteers",
      primaryKey: "id",
      indexes: ["created_at", "modalidade_ajuda"],
      schema: {
        id: "uuid",
        nome_completo: "string",
        contato: "string",
        modalidade_ajuda: "string[]",
        descricao_contribuicao: "string",
        disponibilidade: "string",
        consentimento_lgpd: "boolean",
        created_at: "datetime",
        updated_at: "datetime",
        tags: "string[]",
      },
      defaults: {
        tags: ["volunteer", "canal:dashboard", "origem:itesam", "fluxo:voluntariado"],
      },
    },
  ],
  forms: [
    {
      key: "form_pedir_ajuda",
      title: "Pedir ajuda",
      description: "Informe o tipo de ajuda que você precisa e como podemos contatar você.",
      on_submit: {
        action: "db.insert",
        collection: "help_requests",
      },
      fields: [
        {
          name: "nome_completo",
          label: "Nome completo",
          type: "text",
          required: true,
          validation: { minLength: 3 },
        },
        {
          name: "contato",
          label: "Contato (telefone ou e-mail)",
          type: "text",
          required: true,
          validation: {
            regexAny: ["^\\+?[0-9()\\-\\s]{8,}$", "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"],
          },
        },
        {
          name: "categoria_ajuda",
          label: "Tipo de ajuda que preciso",
          type: "select",
          required: true,
          options: [
            { value: "alimentacao", label: "Alimentação" },
            { value: "roupas", label: "Roupas" },
            { value: "medicamentos", label: "Medicamentos" },
            { value: "apoio_psicologico", label: "Orientação ou apoio psicológico" },
            { value: "saude", label: "Atendimento em saúde" },
            { value: "suporte_educacional", label: "Suporte educacional" },
            { value: "apoio_tecnologico", label: "Apoio tecnológico" },
            { value: "cursos_treinamentos", label: "Participação em cursos, palestras ou treinamentos" },
            { value: "inclusao_acessibilidade", label: "Apoio para inclusão e acessibilidade" },
            { value: "ajuda_financeira_doacoes", label: "Ajuda financeira ou doações" },
            { value: "projetos_sociais_ambientais", label: "Participação em projetos sociais ou ambientais" },
            { value: "outras_necessidades", label: "Outras necessidades" },
          ],
          telemetry_tags: ["select:tipo_ajuda", "ux:pedir_ajuda"],
        },
        {
          name: "descricao_ajuda",
          label: "Descreva sua necessidade",
          type: "textarea",
          placeholder: "Explique de forma objetiva o que você precisa.",
          required: false,
          validation: { maxLength: 1000 },
        },
        {
          name: "consentimento_lgpd",
          label: "Autorizo o uso dos meus dados para contato e encaminhamento do pedido.",
          type: "checkbox",
          required: true,
        },
      ],
      ui_overrides: {
        replace_text: {
          "Cadastrar-se como associado": "Pedir ajuda",
        },
      },
      submit_button: {
        label: "Enviar pedido de ajuda",
      },
      success_toast: "Seu pedido foi registrado. Em breve entraremos em contato.",
    },
    {
      key: "form_voluntariado",
      title: "Quero ser voluntário",
      description: "Cadastre-se para contribuir com ações do ITESAM.",
      on_submit: {
        action: "db.insert",
        collection: "volunteers",
      },
      fields: [
        {
          name: "nome_completo",
          label: "Nome completo",
          type: "text",
          required: true,
          validation: { minLength: 3 },
        },
        {
          name: "contato",
          label: "Contato (telefone ou e-mail)",
          type: "text",
          required: true,
          validation: {
            regexAny: ["^\\+?[0-9()\\-\\s]{8,}$", "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"],
          },
        },
        {
          name: "modalidade_ajuda",
          label: "Como deseja ajudar",
          type: "multiselect",
          required: true,
          options: [
            { value: "doacao_alimentos", label: "Doação de alimentos" },
            { value: "doacao_roupas", label: "Doação de roupas" },
            { value: "apoio_eventos_acoes", label: "Apoio em eventos e ações sociais" },
            { value: "atendimento_orientacao", label: "Atendimento ou orientação (psicológica, médica, jurídica, educacional)" },
            { value: "apoio_tecnologico_logistico", label: "Apoio tecnológico ou logístico" },
            { value: "transporte_distribuicao", label: "Transporte ou distribuição" },
            { value: "voluntariado_geral", label: "Voluntariado geral" },
          ],
          telemetry_tags: ["select:modalidade_ajuda", "ux:voluntariado"],
        },
        {
          name: "descricao_contribuicao",
          label: "Descreva como pode contribuir",
          type: "textarea",
          placeholder: "Conte suas habilidades, recursos e áreas de interesse.",
          required: false,
          validation: { maxLength: 1000 },
        },
        {
          name: "disponibilidade",
          label: "Disponibilidade",
          type: "select",
          required: false,
          options: [
            { value: "manha", label: "Manhã" },
            { value: "tarde", label: "Tarde" },
            { value: "noite", label: "Noite" },
            { value: "finais_de_semana", label: "Finais de semana" },
          ],
        },
        {
          name: "consentimento_lgpd",
          label: "Autorizo o uso dos meus dados para contato e atividades de voluntariado.",
          type: "checkbox",
          required: true,
        },
      ],
      submit_button: {
        label: "Enviar cadastro de voluntário",
      },
      success_toast: "Cadastro de voluntário enviado. Obrigado por se disponibilizar!",
    },
  ],
  permissions: {
    public: [
      { resource: "routes:/pedir-ajuda", actions: ["read"] },
      { resource: "routes:/voluntariado", actions: ["read"] },
      { resource: "collections:help_requests", actions: ["create"] },
      { resource: "collections:volunteers", actions: ["create"] },
    ],
    admin: [
      { resource: "collections:help_requests", actions: ["read", "update", "export"] },
      { resource: "collections:volunteers", actions: ["read", "update", "export"] },
    ],
  },
  telemetry: {
    events: [
      { name: "help_request_submitted", on: "form_pedir_ajuda.submit" },
      { name: "volunteer_submitted", on: "form_voluntariado.submit" },
    ],
    dimensions: ["categoria_ajuda", "modalidade_ajuda", "canal", "origem", "fluxo"],
    default_tags: ["produto:itesam", "ambiente:prod", "plataforma:web"],
  },
  uiTextReplacements: [
    {
      target: "Cadastrar-se como associado",
      replacement: "Pedir ajuda",
    },
  ],
};

export const getFormDefinition = (key: string): FormDefinition | undefined =>
  dashboardConfig.forms.find((form) => form.key === key);

export const getFormFieldDefinition = (formKey: string, fieldName: string): FormField | undefined =>
  getFormDefinition(formKey)?.fields.find((field) => field.name === fieldName);

export const getFormFieldOptionLabel = (formKey: string, fieldName: string, value: string): string => {
  const field = getFormFieldDefinition(formKey, fieldName);
  const option = field?.options?.find((item) => item.value === value);
  return option?.label ?? value;
};

export const getCollectionDefaults = (collectionName: string): Record<string, unknown> =>
  dashboardConfig.collections.find((collection) => collection.name === collectionName)?.defaults ?? {};
