import { UserRole } from "./entities";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  perfil: string;
  avatarUrl:string
}

export interface AuthLoginResponse {
  token: string;
  user: AuthUser;
}
