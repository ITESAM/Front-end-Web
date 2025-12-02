import Cookies from "js-cookie";

export const isAuthenticated = (): boolean => {
  const userRole = Cookies.get("userRole");
  const userId = Cookies.get("usuario_id");

  // Só deixa passar se tiver ID e for admin
  return !!userId && userRole === "admin";
};
