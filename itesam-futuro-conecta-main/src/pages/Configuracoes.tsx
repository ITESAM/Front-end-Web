import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemoAuth } from "@/contexts/DemoAuthContext";
import UploadOptionsDialog from "@/components/shared/UploadOptionsDialog";
import { getUploadLabel, type UploadSource } from "@/lib/uploads";

interface ConfigFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string;
  password: string;
}

const initialState: ConfigFormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  avatarUrl: "",
  password: "",
};

const Configuracoes = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useDemoAuth();
  const [formState, setFormState] = useState<ConfigFormState>(initialState);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [avatarSource, setAvatarSource] = useState<UploadSource | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setFormState({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address ?? "",
      avatarUrl: user.avatarUrl ?? "",
      password: "",
    });
    if (user.avatarUrl) {
      setAvatarSource({ kind: "url", url: user.avatarUrl });
    } else {
      setAvatarSource(null);
    }
  }, [user, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    updateUser({
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      address: formState.address || undefined,
      avatarUrl: formState.avatarUrl || undefined,
    });

    setFormState((previous) => ({
      ...previous,
      password: "",
    }));

    setShowSuccessMessage(true);
  };

  const handleChange = (field: keyof ConfigFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
    setShowSuccessMessage(false);

    if (field === "avatarUrl") {
      if (value.trim()) {
        setAvatarSource({ kind: "url", url: value.trim() });
      } else {
        setAvatarSource(null);
      }
    }
  };

  const handleAvatarSelection = (value: UploadSource | null) => {
    setAvatarSource(value);
    setShowSuccessMessage(false);

    if (!value) {
      setFormState((previous) => ({
        ...previous,
        avatarUrl: "",
      }));
      return;
    }

    if (value.kind === "file") {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setFormState((previous) => ({
            ...previous,
            avatarUrl: result,
          }));
        }
      };
      reader.readAsDataURL(value.file);
    } else {
      setFormState((previous) => ({
        ...previous,
        avatarUrl: value.url,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold text-primary tracking-tight">Configurações da Conta</h1>
            <p className="text-muted-foreground">
              Visualize as informações do usuário fictício e personalize os campos como desejar.
            </p>
          </div>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">Dados do perfil</CardTitle>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={formState.name}
                      onChange={handleChange("name")}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formState.phone}
                      onChange={handleChange("phone")}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço (opcional)</Label>
                    <Input
                      id="address"
                      value={formState.address}
                      onChange={handleChange("address")}
                      placeholder="Rua, número, cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Foto do perfil</Label>
                    <div className="space-y-3">
                      <Input
                        id="avatarUrl"
                        value={formState.avatarUrl}
                        onChange={handleChange("avatarUrl")}
                        placeholder="https://..."
                      />
                      <div className="space-y-3">
                        <UploadOptionsDialog
                          title="Atualizar foto do perfil"
                          description="Abra a janela para enviar uma imagem do dispositivo ou colar um link público."
                          accept="image/*"
                          value={avatarSource}
                          previewType="image"
                          onChange={handleAvatarSelection}
                        >
                          <Button type="button" variant="outline" className="w-full sm:w-auto">
                            Abrir opções de upload
                          </Button>
                        </UploadOptionsDialog>
                        <p className="text-sm text-muted-foreground">
                          Use o botão acima para escolher um arquivo do dispositivo ou selecione a galeria do aparelho.
                        </p>
                        {avatarSource && (
                          <p className="text-sm text-muted-foreground">
                            Origem atual: {getUploadLabel(avatarSource)}
                          </p>
                        )}
                      </div>
                      {formState.avatarUrl && (
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-full border border-primary/20">
                            <img
                              src={formState.avatarUrl}
                              alt="Pré-visualização da foto do perfil"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">Pré-visualização</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha (nova senha, opcional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formState.password}
                      onChange={handleChange("password")}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button type="submit" className="w-full md:w-auto">
                    Salvar alterações
                  </Button>

                  {showSuccessMessage && (
                    <p className="text-sm font-medium text-green-600">Alterações salvas com sucesso.</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Configuracoes;
