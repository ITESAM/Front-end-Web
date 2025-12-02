import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import type { RegistrationStepData } from "../types";
import UploadOptionsDialog from "@/components/shared/UploadOptionsDialog";
import { getUploadLabel, type UploadSource } from "@/lib/uploads";

interface StepDocumentsProps {
  onNext: (data: RegistrationStepData) => void;
  onBack: () => void;
  initialData: RegistrationStepData;
}

const StepDocuments = ({ onNext, onBack, initialData }: StepDocumentsProps) => {
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = useState<UploadSource | null>(
    initialData?.profilePhoto ?? null,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profilePhoto) {
      toast({
        title: "Foto obrigatória",
        description: "Por favor, anexe uma foto do rosto para finalizar o cadastro.",
        variant: "destructive",
      });
      return;
    }

    onNext({
      profilePhoto,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Foto do rosto</h3>
        <p className="text-sm text-muted-foreground">
          Envie uma foto nítida do seu rosto para concluirmos o cadastro.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Foto do rosto *</Label>
        <div className="rounded-lg border-2 border-dashed border-primary/20 bg-card/30 p-4">
          <UploadOptionsDialog
            title="Adicionar foto do rosto"
            description="Envie a imagem direto do seu dispositivo ou informe um link público."
            accept="image/*"
            value={profilePhoto}
            previewType="image"
            onChange={(value) => setProfilePhoto(value)}
          >
            <Button type="button" variant="outline" className="w-full justify-center">
              {profilePhoto ? "Alterar foto" : "Selecionar arquivo ou link"}
            </Button>
          </UploadOptionsDialog>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            {profilePhoto ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{getUploadLabel(profilePhoto)}</span>
              </>
            ) : (
              <span>Nenhum arquivo ou link selecionado.</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-5 w-5" />
          Voltar
        </Button>
        <Button type="submit" size="lg">
          Concluir cadastro
        </Button>
      </div>
    </form>
  );
};

export default StepDocuments;
