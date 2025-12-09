import { ReactNode } from "react";

type ClaimStatus = "pending" | "waiting" | "approved" | "rejected";

interface ClaimCardProps {
  title: string;
  status: ClaimStatus;
  claimId: string;
  amount: string;
  icon: ReactNode;
}

const statusConfig = {
  pending: { label: "Pending", class: "status-pending" },
  waiting: { label: "Under Review", class: "status-waiting" },
  approved: { label: "Approved", class: "status-approved" },
  rejected: { label: "Rejected", class: "status-rejected" },
};

export function ClaimCard({ title, status, claimId, amount, icon }: ClaimCardProps) {
  const config = statusConfig[status];

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground text-sm">{title}</h4>
        <span className={`status-badge ${config.class}`}>{config.label}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">ID: {claimId}</p>
          <p className="text-sm font-semibold text-foreground">Amount: {amount}</p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}
