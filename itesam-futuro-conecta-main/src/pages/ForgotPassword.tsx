import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api/api";
import { Loader2, Mail, Lock } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});
const resetPasswordSchema = z.object({
  nova_senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleEmailSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const res = await api.post("senha/gerar_link.php", { email: data.email });
      if (res.data.status) {
        toast({ title: "Sucesso", description: "Verifique seu e-mail para redefinir a senha!" });
      } else {
        toast({ title: "Erro", description: res.data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao enviar e-mail", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await api.post("senha/resetar_senha.php", { token, nova_senha: data.nova_senha });
      if (res.data.status) {
        toast({ title: "Senha redefinida", description: "Agora você já pode fazer login!" });
        navigate("/login");
      } else {
        toast({ title: "Erro", description: res.data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao redefinir senha", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="max-w-md w-full border-primary/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {token ? "Redefinir senha" : "Recuperar senha"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!token ? (
            <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-4">
              <Label htmlFor="email">Digite seu e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" className="pl-10" {...register("email")} />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 animate-spin" /> Enviando...</> : "Enviar e-mail"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitReset(handleResetSubmit)} className="space-y-4">
              <Label htmlFor="nova_senha">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input id="nova_senha" type="password" className="pl-10" {...registerReset("nova_senha")} />
              </div>
              {resetErrors.nova_senha && <p className="text-sm text-destructive">{resetErrors.nova_senha.message}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 animate-spin" /> Atualizando...</> : "Redefinir senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
