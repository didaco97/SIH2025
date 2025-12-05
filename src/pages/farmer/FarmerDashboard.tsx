import { FarmerSidebar } from "@/components/farmer/FarmerSidebar";
import { FarmInfoCard } from "@/components/farmer/FarmInfoCard";
import { ClaimCard } from "@/components/farmer/ClaimCard";
import { User, MapPin, Calendar, Wheat, Users, Clock, CheckCircle, XCircle, MessageCircle, FileText, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FarmerDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <FarmerSidebar />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground font-display mb-2">Farmer Dashboard</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span><strong className="text-foreground">Farmer:</strong> Rajesh Kumar</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span><strong className="text-foreground">Village:</strong> Nashik</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong className="text-foreground">Season:</strong> Kharif</span>
            </div>
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4" />
              <span><strong className="text-foreground">Crop:</strong> Rice</span>
            </div>
          </div>
        </div>
        
        {/* Section 1: Farm Information */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground font-display mb-4">Section 1: Farm Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="stat-card lg:col-span-1">
              <p className="text-sm text-muted-foreground font-medium mb-2">Farm Boundary</p>
              <div className="aspect-video rounded-lg bg-sage overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-vegetation/30" />
                <div className="absolute inset-[15%] border-2 border-golden rounded" />
              </div>
            </div>
            
            <FarmInfoCard title="Land Area:" value="2.5 Acres" />
            <FarmInfoCard title="Crop Type:" value="Rice" />
            <FarmInfoCard title="Sowing Date:" value="15 June 2023" />
            <FarmInfoCard title="District / Taluka / Village:" value="Nashik / Niphad / Palkhed" />
          </div>
        </section>
        
        {/* Section 2: Claims Management */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground font-display mb-4">Section 2: Claims Management</h2>
          
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="file" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  File New Claim
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Claim Status & History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ClaimCard
                    title="Pending claims"
                    status="pending"
                    claimId="1001"
                    amount="₹5000"
                    icon={<Users className="w-5 h-5" />}
                  />
                  <ClaimCard
                    title="Waiting for approval"
                    status="waiting"
                    claimId="1002"
                    amount="₹10000"
                    icon={<Clock className="w-5 h-5" />}
                  />
                  <ClaimCard
                    title="Approved claims"
                    status="approved"
                    claimId="1003"
                    amount="₹7500"
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                  <ClaimCard
                    title="Rejected claims"
                    status="rejected"
                    claimId="1004"
                    amount="₹2500"
                    icon={<XCircle className="w-5 h-5" />}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Claim ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4">1001</td>
                        <td className="py-3 px-4">₹5000</td>
                        <td className="py-3 px-4"><span className="status-badge status-pending">Pending</span></td>
                        <td className="py-3 px-4 text-muted-foreground">15 Oct 2023</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4">1002</td>
                        <td className="py-3 px-4">₹10000</td>
                        <td className="py-3 px-4"><span className="status-badge status-waiting">Waiting</span></td>
                        <td className="py-3 px-4 text-muted-foreground">20 Oct 2023</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4">1003</td>
                        <td className="py-3 px-4">₹7500</td>
                        <td className="py-3 px-4"><span className="status-badge status-approved">Approved</span></td>
                        <td className="py-3 px-4 text-muted-foreground">25 Oct 2023</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">1004</td>
                        <td className="py-3 px-4">₹2500</td>
                        <td className="py-3 px-4"><span className="status-badge status-rejected">Rejected</span></td>
                        <td className="py-3 px-4 text-muted-foreground">28 Oct 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Section 3: Resources / Support */}
        <section>
          <h2 className="text-lg font-semibold text-foreground font-display mb-4">Section 3: Resources / Support</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="secondary" className="h-auto py-5 px-6 justify-start gap-4 text-left">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-medium">Chatbot for help</span>
            </Button>
            
            <Button variant="secondary" className="h-auto py-5 px-6 justify-start gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--status-pending-bg))] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-golden" />
              </div>
              <span className="font-medium">PMFBY guidelines link</span>
            </Button>
            
            <Button variant="secondary" className="h-auto py-5 px-6 justify-start gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--status-waiting-bg))] flex items-center justify-center shrink-0">
                <FolderOpen className="w-6 h-6 text-sky" />
              </div>
              <div>
                <span className="font-medium block">Previous claims documents</span>
                <span className="text-xs text-muted-foreground">download</span>
              </div>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
