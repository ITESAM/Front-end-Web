import { useEffect, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock } from "lucide-react";
import { api } from "@/api/api";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  sexo?: string;
  nacionalidade?: string;
  estado_civil?: string;
  telefone?: string;
  foto_perfil_url?: string;
}

const Perfil = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Buscar dados do usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = 1 //Cookies.get("user_id"); // id salvo no cookie
        if (!userId) return;

        const res = await api.get("usuario/get_usuario_by_id.php", {
          params: { id: userId },
        });

        if (res.data.success) {
          setUser(res.data.usuario);
        } else {
          toast.error("Usuário não encontrado.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🧱 Manipular campos de texto
  const handleChange = (field: keyof Usuario, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // 📸 Alterar foto de perfil (com preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  // 💾 Salvar alterações
  const handleSave = async () => {
    if (!user) return;

    try {
      const formData = new FormData();
      formData.append("id", localStorage.getItem('Id'));
      formData.append("nome", user.nome);
      formData.append("email", user.email);
      formData.append("cpf", user.cpf || "");
      formData.append("rg", user.rg || "");
      formData.append("data_nascimento", user.data_nascimento || "");
      formData.append("sexo", user.sexo || "");
      formData.append("nacionalidade", user.nacionalidade || "");
      formData.append("estado_civil", user.estado_civil || "");
      formData.append("telefone", user.telefone || "");
      if (fotoFile) formData.append("foto_perfil", fotoFile);

      const res = await api.post("usuario/update_usuario.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Perfil atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar perfil.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar alterações.");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Carregando perfil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Usuário não encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* 🧍 Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={user.foto_perfil_url || "/default-avatar.png"}
              />
              <AvatarFallback>{user.nome?.[0] || "U"}</AvatarFallback>
            </Avatar>

            <div>
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="foto-upload" className="cursor-pointer">
                  Alterar Foto
                </label>
              </Button>
              <input
                type="file"
                id="foto-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG ou GIF. Máx. 2MB.
              </p>
            </div>
          </div>

          {/* 🧾 Campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={user.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={user.telefone || ""}
                onChange={(e) => handleChange("telefone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nacionalidade">Nacionalidade</Label>
              <Input
                id="nacionalidade"
                value={user.nacionalidade || ""}
                onChange={(e) => handleChange("nacionalidade", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado_civil">Estado Civil</Label>
              <Input
                id="estado_civil"
                value={user.estado_civil || ""}
                onChange={(e) => handleChange("estado_civil", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔐 Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senha-atual">Senha Atual</Label>
            <Input id="senha-atual" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova Senha</Label>
            <Input id="nova-senha" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
            <Input id="confirmar-senha" type="password" placeholder="••••••••" />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => toast.success("Senha alterada (em breve funcional)")}
            >
              Alterar Senha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Perfil;
