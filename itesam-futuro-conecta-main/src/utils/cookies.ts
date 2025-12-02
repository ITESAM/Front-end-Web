export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";").map(c => c.trim());
  const found = cookies.find(c => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
}