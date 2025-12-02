import { AuthUser } from "@/types/auth";

interface DefaultAdminCredentials {
  email: string;
  password: string;
  token: string;
  user: AuthUser;
}

const email = (import.meta.env.VITE_DEFAULT_ADMIN_EMAIL ?? "admin@itesam.org").toLowerCase();
const password = import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD ?? "Itesam@123";

export const DEFAULT_ADMIN_CREDENTIALS: DefaultAdminCredentials = {
  email,
  password,
  token: "default-admin-token",
  user: {
    id: "admin-default",
    nome: "Administrador Geral",
    email,
    role: "admin",
  },
};
