import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import StepPersonalInfo from "./steps/StepPersonalInfo";
import StepAddress from "./steps/StepAddress";
import StepContact from "./steps/StepContact";
import StepDocuments from "./steps/StepDocuments";
import StepReview from "./steps/StepReview";
import type { RegistrationStepData } from "./types";
import { api } from "@/api/api";

const TOTAL_STEPS = 5;

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationStepData>({});
  const { toast } = useToast();

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = (data: RegistrationStepData) => {
    setFormData((previous) => ({ ...previous, ...data }));
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleFinalSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      // Converte todos os campos do formData em pares chave/valor
      formDataToSend.append("documentType",  formData.documentType);
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("cpf", formData.cpf);
      formDataToSend.append("rg", formData.rg);
      formDataToSend.append("birthDate", formData.birthDate);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("nationality", formData.nationality);
      formDataToSend.append("maritalStatus", formData.maritalStatus);
      formDataToSend.append("identityDocumentFront", formData.identityDocumentFront.file);
      formDataToSend.append("identityDocumentBack", formData.identityDocumentBack.file);
      formDataToSend.append("street", formData.state);
      formDataToSend.append("number", formData.number);
      formDataToSend.append("neighborhood", formData.neighborhood);
      formDataToSend.append("zipCode", formData.zipCode);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("helpType", formData.helpType);
      formDataToSend.append("helpDescription", formData.helpDescription);
      formDataToSend.append("profilePhoto", formData.profilePhoto.file);

      const response = await api.post("usuario/register.php", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === true) {
        toast({
          title: "Cadastro concluído!",
          description: response.data.message || "Seu cadastro foi enviado com sucesso.",
        });
        console.log("Usuário cadastrado:", response.data);
      } else {
        toast({
          title: "Erro ao cadastrar",
          description: response.data.message || "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Etapa {currentStep} de {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}% concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <StepPersonalInfo
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        )}
        {currentStep === 2 && (
          <StepAddress
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        )}
        {currentStep === 3 && (
          <StepContact
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        )}
        {currentStep === 4 && (
          <StepDocuments
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData}
          />
        )}
        {currentStep === 5 && (
          <StepReview
            formData={formData}
            onBack={handleBack}
            onEdit={handleEditStep}
            onSubmit={handleFinalSubmit}
          />
        )}
      </div>

      {/* Navigation Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t overflow-x-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentStep === 1 ? 'bg-primary' : 'bg-muted'}`} />
            <span className="whitespace-nowrap">Dados Pessoais</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentStep === 2 ? 'bg-primary' : 'bg-muted'}`} />
            <span className="whitespace-nowrap">Endereço</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentStep === 3 ? 'bg-primary' : 'bg-muted'}`} />
            <span className="whitespace-nowrap">Contato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentStep === 4 ? 'bg-primary' : 'bg-muted'}`} />
            <span className="whitespace-nowrap">Documentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentStep === 5 ? 'bg-primary' : 'bg-muted'}`} />
            <span className="whitespace-nowrap">Revisar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
