export interface DashboardRoute {
  path: string;
  title: string;
  component: "FormPage" | string;
  formRef?: string;
}

export interface CollectionSchema {
  name: string;
  primaryKey: string;
  indexes?: string[];
  schema: Record<string, string>;
  defaults?: Record<string, unknown>;
}

export type FieldOption = {
  value: string;
  label: string;
};

export type FieldValidation = {
  minLength?: number;
  maxLength?: number;
  regexAny?: string[];
};

export type FormField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
  telemetry_tags?: string[];
};

export interface FormSubmitConfig {
  action: string;
  collection: string;
}

export interface FormDefinition {
  key: string;
  title: string;
  description?: string;
  on_submit: FormSubmitConfig;
  fields: FormField[];
  ui_overrides?: {
    replace_text?: Record<string, string>;
  };
  submit_button?: {
    label?: string;
  };
  success_toast?: string;
}

export interface DashboardPermissions {
  public?: Array<{ resource: string; actions: string[] }>;
  admin?: Array<{ resource: string; actions: string[] }>;
}

export interface DashboardTelemetry {
  events?: Array<{ name: string; on: string }>;
  dimensions?: string[];
  default_tags?: string[];
}

export interface UiTextReplacement {
  target: string;
  replacement: string;
}

export interface DashboardConfig {
  version: string;
  appId: string;
  i18nDefaultLocale: string;
  routes: DashboardRoute[];
  collections: CollectionSchema[];
  forms: FormDefinition[];
  permissions: DashboardPermissions;
  telemetry?: DashboardTelemetry;
  uiTextReplacements?: UiTextReplacement[];
}
