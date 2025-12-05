import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  iconBgClass?: string;
}

export function StatCard({ icon, label, value, subValue, iconBgClass = "bg-sky-light" }: StatCardProps) {
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconBgClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground font-display">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </div>
    </div>
  );
}
