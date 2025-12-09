"use client";

import { FarmerSidebar } from "@/components/farmer/FarmerSidebar";
import { FarmInfoCard } from "@/components/farmer/FarmInfoCard";
import { ClaimCard } from "@/components/farmer/ClaimCard";
import { User, MapPin, Calendar, Wheat, Users, Clock, CheckCircle, XCircle, MessageCircle, FileText, FolderOpen, Ruler, Moon, Sun, Globe, FilePlus, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useClaims } from "@/hooks/useClaims";
import Link from "next/link";
import { useMemo } from "react";
import { PMFBYChatbot } from "@/components/chatbot/PMFBYChatbot";

export default function FarmerDashboard() {
  const { setTheme, theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  // Fetch real-time claims for current user
  const { claims, loading } = useClaims({
    farmerId: user?.uid,
    realtime: true
  });

  // Calculate stats from real data
  const claimStats = useMemo(() => {
    const pending = claims.filter(c => c.status === 'pending').length;
    const underReview = claims.filter(c => c.status === 'waiting').length;
    const approved = claims.filter(c => c.status === 'approved').length;
    const rejected = claims.filter(c => c.status === 'rejected').length;

    return { pending, underReview, approved, rejected };
  }, [claims]);

  // Get latest claim for farm info
  const latestClaim = claims[0];

  return (
    <div className="flex min-h-screen bg-background">
      <FarmerSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display mb-2">{t('dashboard.farmer')}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span><strong className="text-foreground">{t('farmer.name')}</strong> {user?.displayName || user?.email || 'Guest'}</span>
                </div>
                {latestClaim && (
                  <>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span><strong className="text-foreground">{t('farmer.village')}</strong> {latestClaim.village || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span><strong className="text-foreground">{t('farmer.season')}</strong> Kharif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4" />
                      <span><strong className="text-foreground">{t('farmer.crop')}</strong> {latestClaim.cropType || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

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
        </div>

        <div className="p-6 pt-0">

          {/* Section 1: Farm Information */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground font-display mb-4">{t('section.farm_info')}</h2>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat-card lg:col-span-1">
                <p className="text-sm text-muted-foreground font-medium mb-2">Farm Boundary</p>
                <div className="aspect-video rounded-lg bg-sage overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-vegetation/30" />
                  <div className="absolute inset-[15%] border-2 border-golden rounded" />
                </div>
              </div>

              <FarmInfoCard
                title={t('card.land_area')}
                value={latestClaim ? `${latestClaim.area} ${latestClaim.areaUnit || 'Acres'}` : "N/A"}
                icon={<Ruler className="w-5 h-5" />}
              />
              <FarmInfoCard
                title={t('card.crop_type')}
                value={latestClaim?.cropType || "N/A"}
                icon={<Wheat className="w-5 h-5" />}
              />
              <FarmInfoCard
                title={t('card.sowing_date')}
                value="N/A"
                icon={<Calendar className="w-5 h-5" />}
              />
              <FarmInfoCard
                title={t('card.district')}
                value={latestClaim ? `${latestClaim.district} / ${latestClaim.village}` : "N/A"}
                icon={<MapPin className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Section 2: Claims Management */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground font-display mb-4">{t('section.claims')}</h2>


            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="file"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    {t('tab.file_new')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  >
                    {t('tab.history')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="p-5">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <ClaimCard
                        title={t('claim.pending')}
                        status="pending"
                        claimId={String(claimStats.pending)}
                        amount="—"
                        icon={<Users className="w-5 h-5" />}
                      />
                      <ClaimCard
                        title={t('claim.waiting')}
                        status="waiting"
                        claimId={String(claimStats.underReview)}
                        amount="—"
                        icon={<Clock className="w-5 h-5" />}
                      />
                      <ClaimCard
                        title={t('claim.approved')}
                        status="approved"
                        claimId={String(claimStats.approved)}
                        amount="—"
                        icon={<CheckCircle className="w-5 h-5" />}
                      />
                      <ClaimCard
                        title={t('claim.rejected')}
                        status="rejected"
                        claimId={String(claimStats.rejected)}
                        amount="—"
                        icon={<XCircle className="w-5 h-5" />}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="p-5">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : claims.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No claims filed yet</p>
                      <Link href="/farmer/claims">
                        <Button className="mt-4">File Your First Claim</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Claim ID</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Crop</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Loss Type</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Report</th>
                          </tr>
                        </thead>
                        <tbody>
                          {claims.map((claim) => (
                            <tr key={claim.id} className="border-b border-border hover:bg-muted/50">
                              <td className="py-3 px-4 font-mono text-xs">{claim.claimNumber || claim.id?.slice(0, 8)}</td>
                              <td className="py-3 px-4">{claim.cropType}</td>
                              <td className="py-3 px-4">{claim.lossType}</td>
                              <td className="py-3 px-4">
                                <span className={`status-badge px-2 py-1 rounded-full text-xs font-semibold ${claim.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  claim.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    claim.status === 'waiting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                  {claim.status === 'waiting' ? 'Under Review' : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {claim.createdAt ? claim.createdAt.toDate().toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1">
                                  {claim.reportUrl ? (
                                    <a
                                      href={claim.reportUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      <FileText className="w-4 h-4 mr-1" />
                                      Download
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground text-xs italic">Pending</span>
                                  )}

                                  {/* Blockchain Verification Hash */}
                                  {claim.blockchainHash && (
                                    <div className="flex items-center text-[10px] text-muted-foreground gap-1 mt-1 font-mono bg-muted/50 p-1 rounded border border-border w-fit" title={`Verified Hash: ${claim.blockchainHash}`}>
                                      <ShieldCheck className="w-3 h-3 text-green-600" />
                                      <span className="truncate max-w-[80px]">{claim.blockchainHash.substring(0, 8)}...</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Section 3: Resources / Support */}
          <section>
            <h2 className="text-lg font-semibold text-foreground font-display mb-4">{t('section.resources')}</h2>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="secondary" className="h-auto py-5 px-6 justify-start gap-4 text-left">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-medium">{t('resource.chatbot')}</span>
              </Button>

              <Button variant="secondary" className="h-auto py-5 px-6 justify-start gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--status-pending-bg))] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-golden" />
                </div>
                <span className="font-medium">{t('resource.guidelines')}</span>
              </Button>

              <Button variant="secondary" className="h-auto py-5 px-6 justify-start gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--status-waiting-bg))] flex items-center justify-center shrink-0">
                  <FolderOpen className="w-6 h-6 text-sky" />
                </div>
                <div>
                  <span className="font-medium block">{t('resource.documents')}</span>
                  <span className="text-xs text-muted-foreground">{t('resource.download')}</span>
                </div>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* PMFBY Chatbot */}
      <PMFBYChatbot role="farmer" />
    </div>
  );
}
