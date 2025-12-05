import { OfficerSidebar } from "@/components/officer/OfficerSidebar";
import { Bell, User, Search, Filter, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const claimsData = [
  { id: "CLM-2023-001", farmer: "Rajesh Kumar", village: "Palkhed", crop: "Rice", area: "2.5 Acres", amount: "₹15,000", status: "pending", date: "15 Oct 2023" },
  { id: "CLM-2023-002", farmer: "Suresh Patil", village: "Nashik", crop: "Wheat", area: "3.0 Acres", amount: "₹22,000", status: "approved", date: "12 Oct 2023" },
  { id: "CLM-2023-003", farmer: "Amit Sharma", village: "Niphad", crop: "Cotton", area: "4.2 Acres", amount: "₹35,000", status: "waiting", date: "10 Oct 2023" },
  { id: "CLM-2023-004", farmer: "Vikram Singh", village: "Sinnar", crop: "Sugarcane", area: "5.0 Acres", amount: "₹45,000", status: "rejected", date: "08 Oct 2023" },
  { id: "CLM-2023-005", farmer: "Prakash Jadhav", village: "Yeola", crop: "Onion", area: "1.8 Acres", amount: "₹12,000", status: "pending", date: "05 Oct 2023" },
  { id: "CLM-2023-006", farmer: "Mahesh Deshmukh", village: "Malegaon", crop: "Grape", area: "2.0 Acres", amount: "₹28,000", status: "approved", date: "02 Oct 2023" },
];

const statusConfig = {
  pending: { label: "Pending", class: "status-pending", icon: Clock },
  waiting: { label: "Under Review", class: "status-waiting", icon: Eye },
  approved: { label: "Approved", class: "status-approved", icon: CheckCircle },
  rejected: { label: "Rejected", class: "status-rejected", icon: XCircle },
};

export default function OfficerClaimsMonitoring() {
  return (
    <div className="flex min-h-screen bg-background">
      <OfficerSidebar />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Claims Monitoring</h1>
            <p className="text-muted-foreground mt-1">Review and process farmer insurance claims</p>
          </div>
          
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

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Claims</p>
            <p className="text-2xl font-bold text-foreground">248</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-golden">42</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-vegetation">156</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-danger-zone">50</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl shadow-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by farmer name or claim ID..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="waiting">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="nashik">Nashik</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="ahmednagar">Ahmednagar</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Claim ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Farmer</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Village</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Crop</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Area</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claimsData.map((claim, index) => {
                  const config = statusConfig[claim.status as keyof typeof statusConfig];
                  return (
                    <tr key={claim.id} className={`border-b border-border ${index % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
                      <td className="py-4 px-4 font-medium text-primary">{claim.id}</td>
                      <td className="py-4 px-4">{claim.farmer}</td>
                      <td className="py-4 px-4 text-muted-foreground">{claim.village}</td>
                      <td className="py-4 px-4">{claim.crop}</td>
                      <td className="py-4 px-4 text-muted-foreground">{claim.area}</td>
                      <td className="py-4 px-4 font-semibold">{claim.amount}</td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${config.class}`}>{config.label}</span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{claim.date}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {claim.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-vegetation hover:text-vegetation">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-danger-zone hover:text-danger-zone">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Showing 1-6 of 248 claims</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
