import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, CheckCircle2, Edit, FileText, LinkIcon } from "lucide-react";
import { helpTypeLabels, HelpTypeValue } from "@/lib/validations";
import { getUploadLabel, isUrlSource } from "@/lib/uploads";
import type { RegistrationStepData } from "../types";

interface StepReviewProps {
  formData: RegistrationStepData;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

const StepReview = ({ formData, onBack, onEdit, onSubmit }: StepReviewProps) => {
  const resolveHelpTypeLabel = (value: unknown) => {
    if (typeof value === "string" && value in helpTypeLabels) {
      return helpTypeLabels[value as HelpTypeValue];
    }

    return value;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Revisar dados</h3>
        <p className="text-sm text-muted-foreground">
          Confira todas as informações antes de concluir o cadastro
        </p>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary">Dados Pessoais</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              className="gap-2"
              aria-label="Editar dados pessoais"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Nome completo</dt>
              <dd className="mt-1">{formData.fullName}</dd>
            </div>
            {formData.documentType && (
              <div>
                <dt className="font-medium text-muted-foreground">Documento selecionado</dt>
                <dd className="mt-1 uppercase">{formData.documentType}</dd>
              </div>
            )}
            {formData.documentType === "cpf" && (
              <div>
                <dt className="font-medium text-muted-foreground">CPF</dt>
                <dd className="mt-1">{formData.cpf}</dd>
              </div>
            )}
            {formData.documentType === "rg" && (
              <div>
                <dt className="font-medium text-muted-foreground">RG</dt>
                <dd className="mt-1">{formData.rg}</dd>
              </div>
            )}
            {(formData.identityDocumentFront || formData.identityDocumentBack) && (
              <div className="md:col-span-2 space-y-2">
                <dt className="font-medium text-muted-foreground">Arquivos do documento</dt>
                {formData.identityDocumentFront && (
                  <dd className="mt-1 flex items-center gap-2">
                    {isUrlSource(formData.identityDocumentFront) ? (
                      <LinkIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                    <span>
                      Frente: {getUploadLabel(formData.identityDocumentFront)}
                    </span>
                  </dd>
                )}
                {formData.identityDocumentBack && (
                  <dd className="flex items-center gap-2">
                    {isUrlSource(formData.identityDocumentBack) ? (
                      <LinkIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                    <span>
                      Verso: {getUploadLabel(formData.identityDocumentBack)}
                    </span>
                  </dd>
                )}
              </div>
            )}
            <div>
              <dt className="font-medium text-muted-foreground">Data de nascimento</dt>
              <dd className="mt-1">{new Date(formData.birthDate).toLocaleDateString('pt-BR')}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Sexo/Identidade</dt>
              <dd className="mt-1 capitalize">{formData.gender}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Nacionalidade</dt>
              <dd className="mt-1">{formData.nationality}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Estado civil</dt>
              <dd className="mt-1 capitalize">{formData.maritalStatus}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary">Endereço</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="gap-2"
              aria-label="Editar endereço"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="md:col-span-2">
              <dt className="font-medium text-muted-foreground">Endereço completo</dt>
              <dd className="mt-1">
                {formData.street}, {formData.number} - {formData.neighborhood}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">CEP</dt>
              <dd className="mt-1">{formData.zipCode}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Cidade/Estado</dt>
              <dd className="mt-1">{formData.city}/{formData.state}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary">Contato</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              className="gap-2"
              aria-label="Editar contato"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Telefone</dt>
              <dd className="mt-1">{formData.phone}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">E-mail</dt>
              <dd className="mt-1">{formData.email}</dd>
            </div>
            {formData.helpType && (
              <div className="md:col-span-2">
                <dt className="font-medium text-muted-foreground">Tipo de ajuda</dt>
                <dd className="mt-1">{resolveHelpTypeLabel(formData.helpType)}</dd>
              </div>
            )}
            {formData.helpDescription && (
              <div className="md:col-span-2">
                <dt className="font-medium text-muted-foreground">Descrição da ajuda</dt>
                <dd className="mt-1 whitespace-pre-line">{formData.helpDescription}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Foto do rosto */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary">Foto do rosto</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(4)}
              className="gap-2"
              aria-label="Editar foto do rosto"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            {formData.profilePhoto ? (
              <div className="flex items-center gap-2">
                {isUrlSource(formData.profilePhoto) ? (
                  <LinkIcon className="h-4 w-4 text-primary" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <span>{getUploadLabel(formData.profilePhoto)}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Nenhuma foto enviada</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-5 w-5" />
          Voltar
        </Button>
        <Button type="button" size="lg" onClick={onSubmit}>
          Concluir cadastro
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
