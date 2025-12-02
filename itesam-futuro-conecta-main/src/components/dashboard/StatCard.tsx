import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  sparkline?: number[];
}

export const StatCard = ({ title, value, icon: Icon, trend, iconColor = "bg-primary", sparkline }: StatCardProps) => {
  const maxValue = sparkline ? Math.max(...sparkline, 1) : 1;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColor)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex items-end justify-between gap-0.5 h-8 mt-4">
          {sparkline && sparkline.map((val, i) => (
            <div
              key={i}
              className={cn("flex-1 rounded-t transition-all", iconColor, "opacity-40")}
              style={{ height: `${(val / maxValue) * 100}%` }}
            />
          ))}
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-xs font-medium",
            trend.isPositive ? "text-success" : trend.value === 0 ? "text-muted-foreground" : "text-destructive"
          )}>
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend.value === 0 ? (
              <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend.value === 0 ? "Sem variação" : `${Math.abs(trend.value)}%`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
