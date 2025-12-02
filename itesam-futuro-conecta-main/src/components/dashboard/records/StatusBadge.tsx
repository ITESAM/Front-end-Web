import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variants?: Record<string, { label?: string; className?: string }>;
  defaultLabel?: string;
}

const DEFAULT_STATUS_STYLES: Record<string, string> = {
  novo: "bg-warning/10 text-warning border-warning/30",
  revisado: "bg-success/10 text-success border-success/30",
  arquivado: "bg-muted text-muted-foreground border-border",
  ativo: "bg-success/10 text-success border-success/30",
  pendente: "bg-warning/10 text-warning border-warning/30",
  "em análise": "bg-primary/10 text-primary border-primary/30",
  resolvido: "bg-success/10 text-success border-success/30",
  publicado: "bg-primary text-primary-foreground",
  rascunho: "bg-secondary text-secondary-foreground",
};

export const StatusBadge = ({ status, variants, defaultLabel }: StatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase();
  const variant = variants?.[normalizedStatus];
  const baseClass = variant?.className ?? DEFAULT_STATUS_STYLES[normalizedStatus] ?? "bg-muted text-muted-foreground";
  const label = variant?.label ?? defaultLabel ?? status;

  return (
    <Badge variant="outline" className={cn("border", baseClass)}>
      {label}
    </Badge>
  );
};
