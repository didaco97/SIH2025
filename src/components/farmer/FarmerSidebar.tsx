import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, FileText, BarChart3, Sprout } from "lucide-react";

const navItems = [
  { title: "Main Dashboard", url: "/farmer", icon: LayoutDashboard },
  { title: "Claims", url: "/farmer/claims", icon: FileText },
  { title: "Analytics", url: "/farmer/analytics", icon: BarChart3 },
];

export function FarmerSidebar() {
  return (
    <aside className="w-56 min-h-screen bg-card border-r border-border shadow-sidebar">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Kisan Portal" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <h1 className="font-display font-bold text-foreground text-sm">Kisan Portal</h1>
            <p className="text-xs text-muted-foreground">Crop Insurance</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/farmer"}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 text-sm"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
