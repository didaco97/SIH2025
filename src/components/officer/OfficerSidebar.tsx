import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, FileText, BarChart3, Settings, Leaf } from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/officer", icon: LayoutDashboard },
  { title: "Claims Monitoring", url: "/officer/claims", icon: FileText },
  { title: "Analytics", url: "/officer/analytics", icon: BarChart3 },
  { title: "Settings", url: "/officer/settings", icon: Settings },
];

export function OfficerSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border shadow-sidebar">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground">YES-TECH</h1>
            <p className="text-xs text-muted-foreground">Agri Monitor</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/officer"}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
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
