import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { contactSchema, ContactFormData, helpTypeLabels, helpTypeValues, HelpTypeValue } from "@/lib/validations";
import { formatPhone } from "@/lib/formatters";
import type { RegistrationStepData } from "../types";

interface StepContactProps {
  onNext: (data: RegistrationStepData) => void;
  onBack: () => void;
  initialData: RegistrationStepData;
}

const helpTypeOptions = helpTypeValues.map((value) => ({
  value,
  label: helpTypeLabels[value],
}));

const StepContact = ({ onNext, onBack, initialData }: StepContactProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData as Partial<ContactFormData>,
  });

  const selectedHelpType = watch("helpType");

  const onSubmit = (data: ContactFormData) => {
    onNext(data);
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Contato e Senha</h3>
        <p className="text-sm text-muted-foreground">
          Informe seus dados de contato e crie uma senha de acesso
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Contato</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              maxLength={15}
              {...register("phone")}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                setValue("phone", formatted);
              }}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="helpType">Tipo de ajuda que preciso *</Label>
          <Select
            onValueChange={(value) =>
              setValue("helpType", value as HelpTypeValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
            }
            value={selectedHelpType ?? undefined}
          >
            <SelectTrigger id="helpType">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {helpTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register("helpType")} />
          {errors.helpType && <p className="text-sm text-destructive">{errors.helpType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="helpDescription">Descreva sua necessidade</Label>
          <Textarea
            id="helpDescription"
            placeholder="Conte-nos um pouco mais sobre o tipo de ajuda que você precisa"
            rows={4}
            {...register("helpDescription")}
          />
          <p className="text-xs text-muted-foreground">
            Caso não encontre uma opção adequada acima, descreva aqui o tipo de ajuda específico que precisa.
          </p>
          {errors.helpDescription && (
            <p className="text-sm text-destructive">{errors.helpDescription.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-semibold text-primary">Senha de acesso</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
            />
            <p className="text-xs text-muted-foreground">
              A senha deve conter letra maiúscula, número e caractere especial
            </p>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-5 w-5" />
          Voltar
        </Button>
        <Button type="submit" size="lg" className="gap-2">
          Próximo
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default StepContact;
