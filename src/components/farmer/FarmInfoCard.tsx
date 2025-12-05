import { ReactNode } from "react";

interface FarmInfoCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  className?: string;
}

export function FarmInfoCard({ title, value, icon, className = "" }: FarmInfoCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}
