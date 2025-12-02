import { ReactNode } from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const ServiceCard = ({ title, description, icon }: ServiceCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-primary/10">
          <span className="text-primary transition-colors duration-300 group-hover:text-secondary">{icon}</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/60">ITESAM</span>
      </div>
    </div>
  );
};

export default ServiceCard;
