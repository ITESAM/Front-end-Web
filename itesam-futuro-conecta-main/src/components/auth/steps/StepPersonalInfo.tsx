import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight } from "lucide-react";
import { personalInfoSchema, PersonalInfoFormData } from "@/lib/validations";
import { formatCPF } from "@/lib/formatters";
import type { RegistrationStepData } from "../types";
import UploadOptionsDialog from "@/components/shared/UploadOptionsDialog";
import { getUploadLabel, type UploadSource } from "@/lib/uploads";

interface StepPersonalInfoProps {
  onNext: (data: RegistrationStepData) => void;
  onBack: () => void;
  initialData: RegistrationStepData;
}

const StepPersonalInfo = ({ onNext, initialData }: StepPersonalInfoProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, clearErrors } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      ...(initialData as Partial<PersonalInfoFormData>),
      documentType: initialData?.documentType ?? "",
    },
  });

  const selectedDocumentType = watch("documentType");
  const [documentFront, setDocumentFront] = useState<UploadSource | null>(
    initialData?.identityDocumentFront ?? null,
  );
  const [documentBack, setDocumentBack] = useState<UploadSource | null>(
    initialData?.identityDocumentBack ?? null,
  );
  const [documentError, setDocumentError] = useState<string | null>(null);

  const handleDocumentTypeChange = (value: "cpf" | "rg") => {
    setValue("documentType", value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    clearErrors("documentType");
    setDocumentFront(null);
    setDocumentBack(null);
    setDocumentError(null);

    if (value === "cpf") {
      setValue("rg", "");
      clearErrors("rg");
    } else {
      setValue("cpf", "");
      clearErrors("cpf");
    }
  };

  const onSubmit = (data: PersonalInfoFormData) => {
    if (!documentFront || !documentBack) {
      setDocumentError("Anexe a frente e o verso do documento selecionado");
      return;
    }

    setDocumentError(null);
    onNext({
      ...data,
      identityDocumentFront: documentFront,
      identityDocumentBack: documentBack,
    });
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Dados Pessoais</h3>
        <p className="text-sm text-muted-foreground">
          Preencha seus dados pessoais conforme documento oficial
        </p>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-primary uppercase tracking-wide">CPF ou RG</h4>
          <p className="text-sm text-muted-foreground">
            CPF ou RG — selecione qual documento você vai enviar.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input type="hidden" {...register("documentType")} />
        {/* Nome completo */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="fullName">Nome completo *</Label>
          <Input
            id="fullName"
            placeholder="Digite seu nome completo"
            {...register("fullName")}
          />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>

        {/* Seleção de documento */}
        <div className="space-y-2 md:col-span-2">
          <Label>Escolha o documento *</Label>
          <RadioGroup
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            value={selectedDocumentType ?? ""}
            onValueChange={(value) => handleDocumentTypeChange(value as "cpf" | "rg")}
          >
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <RadioGroupItem value="cpf" id="document-cpf" />
              <Label htmlFor="document-cpf" className="font-normal cursor-pointer">
                Enviar CPF
              </Label>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <RadioGroupItem value="rg" id="document-rg" />
              <Label htmlFor="document-rg" className="font-normal cursor-pointer">
                Enviar RG
              </Label>
            </div>
          </RadioGroup>
          {errors.documentType && <p className="text-sm text-destructive">{errors.documentType.message}</p>}
        </div>

        {selectedDocumentType === "cpf" && (
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              maxLength={14}
              {...register("cpf")}
              onChange={(e) => {
                const formatted = formatCPF(e.target.value);
                setValue("cpf", formatted, { shouldValidate: true });
              }}
            />
            {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
          </div>
        )}

        {selectedDocumentType === "rg" && (
          <div className="space-y-2">
            <Label htmlFor="rg">RG *</Label>
            <Input
              id="rg"
              placeholder="Digite seu RG"
              {...register("rg")}
            />
            {errors.rg && <p className="text-sm text-destructive">{errors.rg.message}</p>}
          </div>
        )}

        {selectedDocumentType && (
          <div className="space-y-3 md:col-span-2">
            <Label>Uploads do documento *</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Documento (Frente)</Label>
                <div className="rounded-lg border-2 border-dashed border-primary/20 bg-card/30 p-4">
                  <UploadOptionsDialog
                    title="Enviar documento (frente)"
                    description="Escolha entre enviar o arquivo pelo dispositivo ou informar um link público."
                    accept="image/*,application/pdf"
                    value={documentFront}
                    previewType="file"
                    onChange={(value) => {
                      setDocumentFront(value);
                      if (value && documentBack) {
                        setDocumentError(null);
                      }
                    }}
                  >
                    <Button type="button" variant="outline" className="w-full justify-center">
                      {documentFront ? "Alterar arquivo ou link" : "Selecionar arquivo ou link"}
                    </Button>
                  </UploadOptionsDialog>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {documentFront
                      ? `Selecionado: ${getUploadLabel(documentFront)}`
                      : "Nenhum arquivo ou link selecionado."}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Documento (Verso)</Label>
                <div className="rounded-lg border-2 border-dashed border-primary/20 bg-card/30 p-4">
                  <UploadOptionsDialog
                    title="Enviar documento (verso)"
                    description="Envie a imagem ou PDF diretamente ou cole um link compartilhável."
                    accept="image/*,application/pdf"
                    value={documentBack}
                    previewType="file"
                    onChange={(value) => {
                      setDocumentBack(value);
                      if (value && documentFront) {
                        setDocumentError(null);
                      }
                    }}
                  >
                    <Button type="button" variant="outline" className="w-full justify-center">
                      {documentBack ? "Alterar arquivo ou link" : "Selecionar arquivo ou link"}
                    </Button>
                  </UploadOptionsDialog>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {documentBack
                      ? `Selecionado: ${getUploadLabel(documentBack)}`
                      : "Nenhum arquivo ou link selecionado."}
                  </p>
                </div>
              </div>
            </div>
            {documentError && <p className="text-sm text-destructive">{documentError}</p>}
          </div>
        )}

        {/* Data de nascimento */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento *</Label>
          <Input
            id="birthDate"
            type="date"
            {...register("birthDate")}
          />
          {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate.message}</p>}
        </div>

        {/* Sexo/Identidade */}
        <div className="space-y-2">
          <Label>Sexo / Identidade de gênero *</Label>
          <RadioGroup 
            onValueChange={(value) => setValue("gender", value)}
            defaultValue={initialData?.gender}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="masculino" id="masculino" />
              <Label htmlFor="masculino" className="font-normal cursor-pointer">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="feminino" id="feminino" />
              <Label htmlFor="feminino" className="font-normal cursor-pointer">Feminino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outro" id="outro" />
              <Label htmlFor="outro" className="font-normal cursor-pointer">Outro</Label>
            </div>
          </RadioGroup>
          {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
        </div>

        {/* Nacionalidade */}
        <div className="space-y-2">
          <Label htmlFor="nationality">Nacionalidade *</Label>
          <Input
            id="nationality"
            placeholder="Ex: Brasileira"
            {...register("nationality")}
          />
          {errors.nationality && <p className="text-sm text-destructive">{errors.nationality.message}</p>}
        </div>

        {/* Estado civil */}
        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Estado civil *</Label>
          <Select 
            onValueChange={(value) => setValue("maritalStatus", value)}
            defaultValue={initialData?.maritalStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
              <SelectItem value="casado">Casado(a)</SelectItem>
              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
              <SelectItem value="uniao-estavel">União estável</SelectItem>
            </SelectContent>
          </Select>
          {errors.maritalStatus && <p className="text-sm text-destructive">{errors.maritalStatus.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" size="lg" className="gap-2">
          Próximo
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default StepPersonalInfo;
