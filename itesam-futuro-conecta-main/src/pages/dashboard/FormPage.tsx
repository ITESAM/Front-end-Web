import { useEffect, useMemo, useState } from "react";
import { Control, useForm } from "react-hook-form";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { dashboardConfig, getCollectionDefaults, getFormDefinition } from "@/config/dashboard";
import type { FormField } from "@/types/dashboard-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField as HookFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface FormPageProps {
  formKey: string;
}

const collectionToEndpoint: Record<string, string> = {
  help_requests: "/help",
  volunteers: "/volunteers",
};

const buildValidationRules = (field: FormField) => {
  const rules: Record<string, unknown> = {};

  if (field.required) {
    if (field.type === "checkbox") {
      rules.validate = (value: unknown) => value === true || "Campo obrigatório";
    } else if (field.type === "multiselect") {
      rules.validate = (value: unknown) =>
        Array.isArray(value) && value.length > 0 ? true : "Selecione pelo menos uma opção";
    } else {
      rules.required = "Campo obrigatório";
    }
  }

  if (field.validation?.minLength) {
    rules.minLength = { value: field.validation.minLength, message: `Mínimo de ${field.validation.minLength} caracteres` };
  }

  if (field.validation?.maxLength) {
    rules.maxLength = { value: field.validation.maxLength, message: `Máximo de ${field.validation.maxLength} caracteres` };
  }

  if (field.validation?.regexAny?.length) {
    const patterns = field.validation.regexAny.map((pattern) => new RegExp(pattern));
    const previousValidate = rules.validate;
    rules.validate = (value: unknown) => {
      if (previousValidate) {
        const previousResult = typeof previousValidate === "function" ? previousValidate(value) : true;
        if (previousResult !== true) return previousResult;
      }

      if (typeof value !== "string" || value.trim().length === 0) {
        return field.required ? "Campo obrigatório" : true;
      }

      return patterns.some((pattern) => pattern.test(value)) || "Formato inválido";
    };
  }

  return rules;
};

const buildDefaultValues = (formDefinition?: FormDefinition) => {
  if (!formDefinition) return {};
  return formDefinition.fields.reduce<Record<string, unknown>>((accumulator, field) => {
    if (field.type === "checkbox") {
      accumulator[field.name] = false;
    } else if (field.type === "multiselect") {
      accumulator[field.name] = [];
    } else {
      accumulator[field.name] = "";
    }
    return accumulator;
  }, {});
};

const FormPage = ({ formKey }: FormPageProps) => {
  const formDefinition = getFormDefinition(formKey);
  const routeDefinition = dashboardConfig.routes.find((route) => route.formRef === formKey);
  const [submitted, setSubmitted] = useState(false);

  const defaultValues = useMemo(() => buildDefaultValues(formDefinition), [formDefinition]);

  const form = useForm<Record<string, unknown>>({
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  if (!formDefinition) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>Formulário não encontrado</CardTitle>
            <CardDescription>
              O formulário solicitado não está disponível. Verifique o endereço ou retorne para a página inicial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Voltar para o início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitForm = form.handleSubmit(async (values) => {
    const submitConfig = formDefinition.on_submit;
    const endpoint = collectionToEndpoint[submitConfig.collection];

    if (!endpoint) {
      toast.error("Não foi possível enviar suas informações. Tente novamente mais tarde.");
      return;
    }

    try {
      await apiClient.post(endpoint, values, { skipAuth: true });
      setSubmitted(true);
      form.reset(defaultValues);
      toast.success(formDefinition.success_toast ?? "Formulário enviado com sucesso!");
    } catch (error) {
      setSubmitted(false);
      toast.error("Não foi possível enviar suas informações. Tente novamente mais tarde.");
    }
  });

  const collectionDefaults = getCollectionDefaults(formDefinition.on_submit.collection);
  const defaultTags = Array.isArray(collectionDefaults.tags)
    ? (collectionDefaults.tags as string[])
    : undefined;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{routeDefinition?.title ?? formDefinition.title}</h1>
          {formDefinition.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{formDefinition.description}</p>
          )}
        </div>

        {submitted && (
          <Alert className="border-success/30 bg-success/10 text-success">
            <AlertTitle className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Tudo certo!
            </AlertTitle>
            <AlertDescription>
              {formDefinition.success_toast ?? "Recebemos suas informações e entraremos em contato em breve."}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Complete o formulário</CardTitle>
            <CardDescription>
              Os campos marcados com * são obrigatórios. Seus dados são usados exclusivamente para este atendimento.
            </CardDescription>
            {defaultTags?.length ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {defaultTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={handleSubmitForm} noValidate>
                <div className="grid grid-cols-1 gap-6">
                  {formDefinition.fields.map((field) => (
                    <FieldRenderer key={field.name} field={field} control={form.control} />
                  ))}
                </div>
                <div className="flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ao enviar você concorda com o uso das suas informações conforme a política do ITESAM.
                  </span>
                  <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="min-w-[200px]">
                    {form.formState.isSubmitting ? "Enviando..." : formDefinition.submit_button?.label ?? "Enviar"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <span>
            Já faz parte da equipe? <Link className="text-primary hover:underline" to="/login">Acesse o dashboard</Link>
          </span>
          <Link className="flex items-center gap-1 hover:underline" to="/">
            <ExternalLink className="h-4 w-4" /> Voltar para o site do ITESAM
          </Link>
        </div>
      </div>
    </div>
  );
};

interface FieldRendererProps {
  field: FormField;
  control: Control<Record<string, unknown>>;
}

const FieldRenderer = ({ field, control }: FieldRendererProps) => {
  const validationRules = useMemo(() => buildValidationRules(field), [field]);

  return (
    <HookFormField
      control={control}
      name={field.name}
      rules={validationRules}
      render={({ field: controllerField }) => {
        const label = field.required ? `${field.label} *` : field.label;

        switch (field.type) {
          case "text":
            return (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    {...controllerField}
                    value={(controllerField.value as string) ?? ""}
                    placeholder={field.placeholder}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          case "textarea":
            return (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Textarea
                    {...controllerField}
                    value={(controllerField.value as string) ?? ""}
                    placeholder={field.placeholder}
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          case "select":
            return (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <Select
                  value={controllerField.value ? String(controllerField.value) : undefined}
                  onValueChange={(value) => controllerField.onChange(value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder ?? "Selecione uma opção"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          case "multiselect":
            return (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <div className="space-y-2 rounded-md border border-dashed border-border p-4">
                  <span className="text-xs text-muted-foreground">Selecione uma ou mais opções</span>
                  <div className="grid gap-2">
                    {field.options?.map((option) => {
                      const selectedValues = Array.isArray(controllerField.value)
                        ? (controllerField.value as string[])
                        : [];
                      const checked = selectedValues.includes(option.value);
                      return (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              if (value) {
                                controllerField.onChange([...selectedValues, option.value]);
                              } else {
                                controllerField.onChange(
                                  selectedValues.filter((current) => current !== option.value)
                                );
                              }
                            }}
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            );
          case "checkbox":
            return (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                <FormControl>
                  <Checkbox
                    checked={Boolean(controllerField.value)}
                    onCheckedChange={(value) => controllerField.onChange(Boolean(value))}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium leading-none">{label}</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            );
          default:
            return null;
        }
      }}
    />
  );
};

export default FormPage;
