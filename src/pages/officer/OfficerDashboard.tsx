import { OfficerSidebar } from "@/components/officer/OfficerSidebar";
import { StatCard } from "@/components/officer/StatCard";
import { HeatmapViewer } from "@/components/officer/HeatmapViewer";
import { Droplets, Leaf, CloudSun, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfficerDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <OfficerSidebar />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground font-display">Main Dashboard</h1>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-zone rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-secondary">
              <User className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<Droplets className="w-7 h-7 text-moisture" />}
            label="Soil Moisture:"
            value="65% (Avg)"
            iconBgClass="bg-sky-light"
          />
          <StatCard
            icon={<Leaf className="w-7 h-7 text-vegetation" />}
            label="NDVI Score:"
            value="0.78 (Good)"
            iconBgClass="bg-[hsl(var(--status-approved-bg))]"
          />
          <StatCard
            icon={<CloudSun className="w-7 h-7 text-golden" />}
            label="Weather Summary:"
            value="28°C, 5mm Rain"
            iconBgClass="bg-[hsl(var(--status-pending-bg))]"
          />
        </div>
        
        {/* Heatmap Viewer */}
        <HeatmapViewer />
      </main>
    </div>
  );
}
