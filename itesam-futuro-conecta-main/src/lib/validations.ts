import { z } from "zod";

/**
 * Centralized Zod validation schemas for form validation
 */

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(3, "Nome completo é obrigatório"),
  documentType: z.enum(["cpf", "rg"], {
    required_error: "Selecione qual documento deseja enviar",
    invalid_type_error: "Selecione qual documento deseja enviar",
  }),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.string().min(1, "Selecione o sexo/identidade de gênero"),
  nationality: z.string().trim().min(2, "Nacionalidade é obrigatória"),
  maritalStatus: z.string().min(1, "Estado civil é obrigatório"),
}).superRefine((data, ctx) => {
  if (data.documentType === "cpf") {
    if (!data.cpf || data.cpf.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o CPF",
        path: ["cpf"],
      });
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido (formato: 000.000.000-00)",
        path: ["cpf"],
      });
    }
  }

  if (data.documentType === "rg") {
    if (!data.rg || data.rg.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o RG",
        path: ["rg"],
      });
    } else if (data.rg.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RG é obrigatório",
        path: ["rg"],
      });
    }
  }
});

export const addressSchema = z.object({
  street: z.string().trim().min(3, "Rua é obrigatória"),
  number: z.string().trim().min(1, "Número é obrigatório"),
  neighborhood: z.string().trim().min(2, "Bairro é obrigatório"),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido (formato: 00000-000)"),
  city: z.string().trim().min(2, "Cidade é obrigatória"),
  state: z.string().trim().min(2, "Estado é obrigatório").max(2, "Use a sigla do estado (2 letras)"),
});

export const helpTypeValues = [
  "alimentacao",
  "roupas",
  "medicamentos",
  "orientacao-ou-apoio-psicologico",
  "atendimento-em-saude",
  "suporte-educacional",
  "apoio-tecnologico",
  "participacao-em-cursos",
  "apoio-para-inclusao",
  "ajuda-financeira",
  "participacao-em-projetos",
  "outras-necessidades",
] as const;

export type HelpTypeValue = typeof helpTypeValues[number];

export const helpTypeLabels: Record<HelpTypeValue, string> = {
  alimentacao: "Alimentação",
  roupas: "Roupas",
  medicamentos: "Medicamentos",
  "orientacao-ou-apoio-psicologico": "Orientação ou apoio psicológico",
  "atendimento-em-saude": "Atendimento em saúde",
  "suporte-educacional": "Suporte educacional",
  "apoio-tecnologico": "Apoio tecnológico",
  "participacao-em-cursos": "Participação em cursos, palestras ou treinamentos",
  "apoio-para-inclusao": "Apoio para inclusão e acessibilidade",
  "ajuda-financeira": "Ajuda financeira ou doações",
  "participacao-em-projetos": "Participação em projetos sociais ou ambientais",
  "outras-necessidades": "Outras necessidades",
};

export const contactSchema = z.object({
  phone: z.string().min(14, "Telefone inválido"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string().min(8, "Confirme a senha"),
  helpType: z.enum(helpTypeValues, {
    required_error: "Selecione o tipo de ajuda que precisa",
    invalid_type_error: "Selecione o tipo de ajuda que precisa",
  }),
  helpDescription: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "As senhas não coincidem",
    });
  }

  if (
    data.helpType === "outras-necessidades" &&
    (!data.helpDescription || data.helpDescription.trim().length === 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["helpDescription"],
      message: "Descreva o tipo de ajuda que precisa",
    });
  }
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
