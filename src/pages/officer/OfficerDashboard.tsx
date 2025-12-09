"use client";

import { OfficerSidebar } from "@/components/officer/OfficerSidebar";
import { StatCard } from "@/components/officer/StatCard";
import { HeatmapViewer } from "@/components/officer/HeatmapViewer";
import { Droplets, Leaf, CloudSun, Bell, User, Moon, Sun, Globe, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { PMFBYChatbot } from "@/components/chatbot/PMFBYChatbot";

export default function OfficerDashboard() {
  const { setTheme, theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-background">
      <OfficerSidebar />

      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-foreground font-display">{t('dashboard.officer')}</h1>

          <div className="flex items-center gap-3">
            <Link href="/farmer/claims">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                <FilePlus className="w-4 h-4" />
                {t('btn.file_claim')}
              </Button>
            </Link>

            <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1.5 px-3 shadow-sm">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>

            <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
              <SelectTrigger className="w-[130px] bg-card border-border shadow-sm">
                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
                <SelectItem value="gu">Gujarati</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Officer Info Bar */}
        <div className="bg-card rounded-lg shadow-sm border border-border px-4 py-3 mb-6">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('officer.name')}</span>
              <span className="font-semibold text-foreground">Ramesh Patel</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t('officer.district')}</span>
              <span className="font-semibold text-foreground">Nashik</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<Droplets className="w-7 h-7 text-moisture" />}
            label={t('stat.moisture')}
            value="65% (Avg)"
            iconBgClass="bg-sky-light"
          />
          <StatCard
            icon={<Leaf className="w-7 h-7 text-vegetation" />}
            label={t('stat.ndvi')}
            value="0.78 (Good)"
            iconBgClass="bg-[hsl(var(--status-approved-bg))]"
          />
          <StatCard
            icon={<CloudSun className="w-7 h-7 text-golden" />}
            label={t('stat.weather')}
            value="28°C, 5mm Rain"
            iconBgClass="bg-[hsl(var(--status-pending-bg))]"
          />
        </div>

        {/* Heatmap Viewer */}
        <HeatmapViewer />
      </main>

      {/* PMFBY Chatbot */}
      <PMFBYChatbot role="officer" />
    </div>
  );
}
