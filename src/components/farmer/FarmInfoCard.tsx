import { ReactNode } from "react";

interface FarmInfoCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  className?: string;
}

export function FarmInfoCard({ title, value, icon, className = "" }: FarmInfoCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1 group-hover:text-primary/80 transition-colors">{title}</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
