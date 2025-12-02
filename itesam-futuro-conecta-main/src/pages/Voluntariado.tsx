import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import UploadOptionsDialog from "@/components/shared/UploadOptionsDialog";
import { getUploadLabel, type UploadSource } from "@/lib/uploads";
import { api } from "@/api/api";
import { getCookie } from "@/utils/cookies";

const helpOptions = [
  { value: "distribuicao", label: "Distribuição de alimentos e roupas" },
  { value: "acolhimento", label: "Acolhimento e escuta" },
  { value: "transporte", label: "Transporte e logística" },
  { value: "coleta", label: "Coleta de doações" },
  { value: "triagem", label: "Triagem e organização" },
  { value: "atendimento", label: "Atendimento social ou jurídico" },
  { value: "saude", label: "Saúde e primeiros socorros" },
  { value: "traducao", label: "Tradução / Comunicação com estrangeiros" },
  { value: "educacao", label: "Ações educativas e recreativas" },
  { value: "apoio-digital", label: "Apoio digital (cadastros, formulários, registros)" },
  { value: "outro", label: "Outro (especifique abaixo)" },
];

const dayOptions = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

type VolunteerFormData = {
  name: string;
  email: string;
  phone: string;
  livesInManaus: "" | "sim" | "nao";
  neighborhood: string;
  remoteSupport: string;
  helpAreas: string[];
  otherHelp: string;
  training: string;
  previousExperience: "" | "sim" | "nao";
  experienceDetails: string;
  availableDays: string[];
  preferredShift: "" | "manha" | "tarde" | "noite";
  referral:
  | ""
  | "redes-sociais"
  | "indicacao"
  | "instituicao"
  | "evento"
  | "outro";
  referralOther: string;
  motivation: string;
};

const createInitialFormData = (): VolunteerFormData => ({
  name: "",
  email: "",
  phone: "",
  livesInManaus: "",
  neighborhood: "",
  remoteSupport: "",
  helpAreas: [],
  otherHelp: "",
  training: "",
  previousExperience: "",
  experienceDetails: "",
  availableDays: [],
  preferredShift: "",
  referral: "",
  referralOther: "",
  motivation: "",
});

const steps = [
  { id: "dados", title: "Dados do Voluntário" },
  { id: "localizacao", title: "Localização" },
  { id: "areas", title: "Áreas de Atuação" },
  { id: "capacitacao", title: "Capacitação e Experiência" },
  { id: "disponibilidade", title: "Disponibilidade" },
  { id: "interesse", title: "Interesse e Motivação" },
  { id: "documentacao", title: "Documentação opcional" },
];

const Voluntariado = () => {
  const { toast } = useToast();
  const [tipoAjuda, setPosts] = useState(helpOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VolunteerFormData>(
    createInitialFormData(),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [supportingDocument, setSupportingDocument] = useState<UploadSource | null>(null);

  const totalSteps = steps.length;

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const id = localStorage.getItem("Id");
    if (!id) {
      toast({
        variant: "destructive",
        title: "Acesso restrito",
        description: "Você precisa estar logado para enviar o formulário de voluntário.",
      });
    }
    setUserId(id);
  }, [toast]);

  useEffect(() => {
    const fetchPosts = async () => {

      try {
        const response = await api.get("tipoAjuda/get_list_tipoAjuda_voluntario_copy.php",);
        const data = response.data;

        if (data.status) {
          setPosts(data.ajudas);
        } else {
          toast({ title: "Erro ao carregar postagens", description: data.message });
        }
      } catch (error) {
        toast({ title: "Erro de conexão", description: "Não foi possível carregar as postagens." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts(); // 🚀 Executa assim que a página é aberta
  }, [toast]);

  const handleCheckboxChange = (
    field: "helpAreas" | "availableDays",
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      if (checked) {
        if (current.includes(value)) {
          return prev;
        }
        return { ...prev, [field]: [...current, value] };
      }
      const updatedValues = current.filter((item) => item !== value);
      if (field === "helpAreas" && value === "outro") {
        return { ...prev, helpAreas: updatedValues, otherHelp: "" };
      }
      return { ...prev, [field]: updatedValues };
    });
  };

  const showValidationErrors = (messages: string[]) => {
    if (!messages.length) {
      return false;
    }

    toast({
      variant: "destructive",
      title: "Revise os campos obrigatórios",
      description: messages.join(" \n"),
    });

    return true;
  };

  const getStepValidationErrors = (stepIndex: number): string[] => {
    switch (steps[stepIndex]?.id) {
      case "dados": {
        const messages: string[] = [];
        if (!formData.name.trim()) {
          messages.push("Informe seu nome completo.");
        }
        if (!formData.email.trim()) {
          messages.push("Informe um e-mail de contato válido.");
        }
        return messages;
      }
      case "localizacao": {
        const messages: string[] = [];
        if (!formData.livesInManaus) {
          messages.push("Informe se você mora em Manaus.");
        }
        if (formData.livesInManaus === "sim" && !formData.neighborhood.trim()) {
          messages.push("Informe o bairro onde mora.");
        }
        if (formData.livesInManaus === "nao" && !formData.remoteSupport.trim()) {
          messages.push("Descreva como pode ajudar à distância.");
        }
        return messages;
      }
      case "areas": {
        const messages: string[] = [];
        if (!formData.helpAreas.length) {
          messages.push("Selecione ao menos uma área em que pode ajudar.");
        }
        if (
          formData.helpAreas.includes("outro") &&
          !formData.otherHelp.trim()
        ) {
          messages.push("Descreva como pode ajudar na opção 'Outro'.");
        }
        return messages;
      }
      case "capacitacao": {
        const messages: string[] = [];
        if (!formData.previousExperience) {
          messages.push("Informe se já participou de ações voluntárias.");
        }
        return messages;
      }
      case "disponibilidade": {
        const messages: string[] = [];
        if (!formData.availableDays.length) {
          messages.push("Escolha pelo menos um dia disponível para atuar.");
        }
        if (!formData.preferredShift) {
          messages.push("Informe o turno preferido de atuação.");
        }
        return messages;
      }
      case "interesse": {
        const messages: string[] = [];
        if (!formData.referral) {
          messages.push("Conte-nos como soube do projeto.");
        }
        if (formData.referral === "outro" && !formData.referralOther.trim()) {
          messages.push("Especifique como soube do projeto na opção 'Outro'.");
        }
        if (!formData.motivation.trim()) {
          messages.push("Compartilhe sua motivação para ser voluntário.");
        }
        return messages;
      }
      default:
        return [];
    }
  };

  const handleNextStep = () => {
    const errors = getStepValidationErrors(currentStep);
    if (showValidationErrors(errors)) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const stepErrors = steps.map((_, index) => ({
      index,
      errors: getStepValidationErrors(index),
    }));
    const allErrors = stepErrors.flatMap((item) => item.errors);

    if (showValidationErrors(allErrors)) {
      const firstErrorStep = stepErrors.find((item) => item.errors.length > 0);
      if (firstErrorStep) {
        setCurrentStep(firstErrorStep.index);
      }
      return;
    }

    try {
      const response = await api.post(
        "voluntario/post_voluntario.php",
        {
          usuario_id: userId, // 👈 adiciona aqui
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          moraManaus: formData.livesInManaus,
          bairro: formData.neighborhood,
          ajudaDistancia: formData.remoteSupport,
          formasAjuda: formData.helpAreas,
          outraAjuda: formData.otherHelp,
          graduacao: formData.training,
          jaVoluntario: formData.previousExperience,
          experienciaVoluntario: formData.experienceDetails,
          disponibilidade: formData.availableDays,
          disponibilidadeTurno: formData.preferredShift,
          comoSoube: formData.referral,
          comoSoubeOutro: formData.referralOther,
          motivo: formData.motivation
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === true) {
        toast({
          title: "Login bem-sucedido",
          description: response.data.message,
        });
        // window.location.href = "/dashboard";
      } else {
        toast({
          title: "Erro",
          description: response.data.message || "Credenciais inválidas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      switch (error.response.status) {
        case 400:
          toast({
            title: "Erro no formulario!",
            description: `${error.response.data.message}\nÉ obrigatorio preenhcher todos os dados`,
            variant: "destructive",
          });
          break;
        case 401:
          toast({
            title: "Erro no formulario!",
            description: `Email ou senha incorretos!`,
            variant: "destructive",
          });
          break;
        case 404:
          toast({
            title: "Usuário não encontrado!",
            description: `${error.response.data.message}\nRealizar o cadastro!`,
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "Erro no servidor",
            description: `Por favor, entre em contato com o suporte`,
            variant: "destructive",
          });
      }
      toast({
        title: "Inscrição enviada!",
        description: "Agradecemos sua disponibilidade. Entraremos em contato em breve.",
      });

      setFormData(createInitialFormData());
      setSupportingDocument(null);
      setCurrentStep(0);
    };
  };

  const renderStepContent = () => {
    switch (steps[currentStep]?.id) {
      case "dados":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">Dados do Voluntário</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail de contato *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>
        );
      case "localizacao":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">Localização</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Você mora em Manaus? *</Label>
                <RadioGroup
                  value={formData.livesInManaus}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      livesInManaus: value as VolunteerFormData["livesInManaus"],
                      neighborhood: "",
                      remoteSupport: "",
                    }));
                  }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="sim" id="lives-manaus-sim" />
                    <Label htmlFor="lives-manaus-sim" className="font-normal">
                      Sim, moro em Manaus
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="nao" id="lives-manaus-nao" />
                    <Label htmlFor="lives-manaus-nao" className="font-normal">
                      Não, sou de outro estado
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.livesInManaus === "sim" && (
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro onde mora *</Label>
                  <Input
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    autoComplete="address-level2"
                  />
                </div>
              )}

              {formData.livesInManaus === "nao" && (
                <div className="space-y-2">
                  <Label htmlFor="remoteSupport">Como pode ajudar mesmo à distância? *</Label>
                  <Textarea
                    id="remoteSupport"
                    name="remoteSupport"
                    value={formData.remoteSupport}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Exemplo: divulgação online, doação, coordenação remota, suporte digital etc."
                  />
                </div>
              )}
            </div>
          </div>
        );
      case "areas":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">Áreas de Atuação</h2>
            <div className="space-y-3">
              <Label>No que você pode ajudar? *</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {tipoAjuda.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-4 transition hover:border-primary/60"
                  >
                    <Checkbox
                      checked={formData.helpAreas.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "helpAreas",
                          option.id,
                          Boolean(checked),
                        )
                      }
                      className="mt-1"
                    />
                    <span className="text-sm leading-relaxed text-foreground">
                      {option.nome}
                    </span>
                  </label>
                ))}
              </div>
              {formData.helpAreas.includes("outro") && (
                <div className="space-y-2">
                  <Label htmlFor="otherHelp">
                    Se marcou “Outro”, descreva como pode ajudar
                  </Label>
                  <Textarea
                    id="otherHelp"
                    name="otherHelp"
                    value={formData.otherHelp}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        );
      case "capacitacao":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Capacitação e Experiência
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="training">
                  Você possui alguma capacitação, curso ou experiência que possa contribuir?
                </Label>
                <Textarea
                  id="training"
                  name="training"
                  value={formData.training}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Já participou de ações voluntárias antes? *</Label>
                <RadioGroup
                  value={formData.previousExperience}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      previousExperience:
                        value as VolunteerFormData["previousExperience"],
                      experienceDetails: "",
                    }))
                  }
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="sim" id="experience-yes" />
                    <Label htmlFor="experience-yes" className="font-normal">
                      Sim
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="nao" id="experience-no" />
                    <Label htmlFor="experience-no" className="font-normal">
                      Não
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.previousExperience === "sim" && (
                <div className="space-y-2">
                  <Label htmlFor="experienceDetails">
                    Se sim, descreva brevemente onde e como
                  </Label>
                  <Textarea
                    id="experienceDetails"
                    name="experienceDetails"
                    value={formData.experienceDetails}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        );
      case "disponibilidade":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">Disponibilidade</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Dias disponíveis para atuar *</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dayOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-start gap-3 rounded-lg border border-border p-4 transition hover:border-primary/60"
                    >
                      <Checkbox
                        checked={formData.availableDays.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "availableDays",
                            option.value,
                            Boolean(checked),
                          )
                        }
                        className="mt-1"
                      />
                      <span className="text-sm leading-relaxed text-foreground">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Turno preferido *</Label>
                <RadioGroup
                  value={formData.preferredShift}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredShift: value as VolunteerFormData["preferredShift"],
                    }))
                  }
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="manha" id="shift-morning" />
                    <Label htmlFor="shift-morning" className="font-normal">
                      Manhã
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="tarde" id="shift-afternoon" />
                    <Label htmlFor="shift-afternoon" className="font-normal">
                      Tarde
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="noite" id="shift-night" />
                    <Label htmlFor="shift-night" className="font-normal">
                      Noite
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );
      case "interesse":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Interesse e Motivação
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral">Como você soube do projeto? *</Label>
                <Select
                  value={formData.referral}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      referral: value as VolunteerFormData["referral"],
                      referralOther: "",
                    }))
                  }
                >
                  <SelectTrigger id="referral">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redes-sociais">Redes sociais</SelectItem>
                    <SelectItem value="indicacao">Indicação de amigo</SelectItem>
                    <SelectItem value="instituicao">Escola / instituição</SelectItem>
                    <SelectItem value="evento">Evento ou ação local</SelectItem>
                    <SelectItem value="outro">Outro (especifique)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.referral === "outro" && (
                <div className="space-y-2">
                  <Label htmlFor="referralOther">
                    Especifique como soube do projeto *
                  </Label>
                  <Input
                    id="referralOther"
                    name="referralOther"
                    value={formData.referralOther}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="motivation">Por que deseja ser voluntário? *</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>
            </div>
          </div>
        );
      case "documentacao":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Documentação opcional
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Se desejar, envie algum documento ou comprovante de curso que comprove sua capacitação ou vínculo institucional.
              </p>
              <div className="space-y-3 rounded-lg border-2 border-dashed border-primary/20 bg-card/30 p-4">
                <UploadOptionsDialog
                  title="Adicionar documentação opcional"
                  description="Anexe um arquivo do seu dispositivo ou informe um link público."
                  accept=".pdf,.jpg,.jpeg,.png"
                  value={supportingDocument}
                  previewType="file"
                  onChange={(value) => setSupportingDocument(value)}
                >
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    {supportingDocument ? "Alterar arquivo ou link" : "Selecionar arquivo ou link"}
                  </Button>
                </UploadOptionsDialog>
                <p className="text-sm text-muted-foreground">
                  {supportingDocument
                    ? `Selecionado: ${getUploadLabel(supportingDocument)}`
                    : "Nenhum arquivo ou link selecionado."}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Ao enviar o formulário, você concorda em ser contatado pela equipe ITESAM.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* 🔒 Bloqueio de acesso se não estiver logado */}
      {!userId ? (
        <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-3xl font-semibold mb-4 text-primary">
            Faça login para se tornar voluntário
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Você precisa estar logado para preencher o formulário de voluntariado.
          </p>
          <Button onClick={() => (window.location.href = "/login")}>
            Ir para Login
          </Button>
        </main>
      ) : (
        <>
          <main className="flex-1">
            <section className="py-20 bg-gradient-to-b from-accent to-background text-center">
              <div className="container mx-auto px-4 max-w-3xl">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/80">
                  Faça parte da mudança
                </p>
                <h1 className="text-5xl font-bold text-foreground mt-4 mb-6">
                  Seja Voluntário
                </h1>
                <p className="text-lg text-muted-foreground">
                  Faça parte da nossa rede de apoio e ajude a transformar vidas.
                  Preencha as informações abaixo para sabermos como você pode contribuir.
                </p>
              </div>
            </section>

            <section className="py-20 bg-background">
              <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-12">
                  <div className="mb-10">
                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                      <span>Etapa {currentStep + 1} de {totalSteps}</span>
                      <span>{steps[currentStep]?.title}</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    {renderStepContent()}

                    <div className="flex flex-col gap-4 border-t border-border pt-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        {currentStep > 0 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePreviousStep}
                          >
                            Voltar
                          </Button>
                        ) : (
                          <span />
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
                          {currentStep < totalSteps - 1 ? (
                            <Button type="button" onClick={handleNextStep}>
                              Continuar
                            </Button>
                          ) : (
                            <Button type="submit" size="lg" className="uppercase tracking-wide">
                              Enviar inscrição
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Voluntariado;
