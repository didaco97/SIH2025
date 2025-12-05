import { OfficerSidebar } from "@/components/officer/OfficerSidebar";
import { Bell, User, TrendingUp, TrendingDown, Droplets, Leaf, CloudRain, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const ndviData = [
  { month: "Jan", value: 0.45 },
  { month: "Feb", value: 0.52 },
  { month: "Mar", value: 0.58 },
  { month: "Apr", value: 0.65 },
  { month: "May", value: 0.72 },
  { month: "Jun", value: 0.78 },
  { month: "Jul", value: 0.82 },
  { month: "Aug", value: 0.75 },
  { month: "Sep", value: 0.68 },
  { month: "Oct", value: 0.62 },
  { month: "Nov", value: 0.55 },
  { month: "Dec", value: 0.48 },
];

const rainfallData = [
  { month: "Jan", rainfall: 12 },
  { month: "Feb", rainfall: 8 },
  { month: "Mar", rainfall: 15 },
  { month: "Apr", rainfall: 25 },
  { month: "May", rainfall: 45 },
  { month: "Jun", rainfall: 180 },
  { month: "Jul", rainfall: 320 },
  { month: "Aug", rainfall: 280 },
  { month: "Sep", rainfall: 150 },
  { month: "Oct", rainfall: 65 },
  { month: "Nov", rainfall: 20 },
  { month: "Dec", rainfall: 10 },
];

const cropDistribution = [
  { name: "Rice", value: 35, color: "hsl(142, 60%, 45%)" },
  { name: "Wheat", value: 25, color: "hsl(45, 90%, 55%)" },
  { name: "Cotton", value: 20, color: "hsl(200, 70%, 50%)" },
  { name: "Sugarcane", value: 12, color: "hsl(30, 70%, 50%)" },
  { name: "Others", value: 8, color: "hsl(150, 30%, 60%)" },
];

const soilMoistureData = [
  { week: "W1", zone1: 65, zone2: 58, zone3: 72 },
  { week: "W2", zone1: 62, zone2: 55, zone3: 68 },
  { week: "W3", zone1: 70, zone2: 62, zone3: 75 },
  { week: "W4", zone1: 68, zone2: 60, zone3: 71 },
];

export default function OfficerAnalytics() {
  return (
    <div className="flex min-h-screen bg-background">
      <OfficerSidebar />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive agricultural data insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select defaultValue="2023">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-secondary">
              <User className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-5 h-5 text-vegetation" />
              <span className="flex items-center text-xs text-vegetation">
                <TrendingUp className="w-3 h-3 mr-1" /> +5.2%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Avg NDVI Score</p>
            <p className="text-2xl font-bold text-foreground">0.72</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="w-5 h-5 text-moisture" />
              <span className="flex items-center text-xs text-danger-zone">
                <TrendingDown className="w-3 h-3 mr-1" /> -8.1%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Soil Moisture</p>
            <p className="text-2xl font-bold text-foreground">62%</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <CloudRain className="w-5 h-5 text-sky" />
              <span className="flex items-center text-xs text-vegetation">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Rainfall (YTD)</p>
            <p className="text-2xl font-bold text-foreground">1,130mm</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="w-5 h-5 text-golden" />
              <span className="flex items-center text-xs text-muted-foreground">
                Normal
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Avg Temperature</p>
            <p className="text-2xl font-bold text-foreground">28°C</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* NDVI Trend */}
          <div className="bg-card rounded-2xl shadow-card p-5">
            <h3 className="text-lg font-semibold text-foreground font-display mb-4">NDVI Trend (Monthly)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={ndviData}>
                <defs>
                  <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(120, 15%, 88%)',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="value" stroke="hsl(142, 60%, 45%)" fill="url(#ndviGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rainfall Chart */}
          <div className="bg-card rounded-2xl shadow-card p-5">
            <h3 className="text-lg font-semibold text-foreground font-display mb-4">Rainfall Distribution (mm)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rainfallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(120, 15%, 88%)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="rainfall" fill="hsl(200, 70%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crop Distribution */}
          <div className="bg-card rounded-2xl shadow-card p-5">
            <h3 className="text-lg font-semibold text-foreground font-display mb-4">Crop Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {cropDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soil Moisture by Zone */}
          <div className="bg-card rounded-2xl shadow-card p-5 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground font-display mb-4">Soil Moisture by Zone (Weekly)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={soilMoistureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 15%, 88%)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <YAxis domain={[40, 100]} tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(120, 15%, 88%)',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="zone1" stroke="hsl(142, 60%, 45%)" strokeWidth={2} dot={{ fill: 'hsl(142, 60%, 45%)' }} name="Zone 1" />
                <Line type="monotone" dataKey="zone2" stroke="hsl(45, 90%, 55%)" strokeWidth={2} dot={{ fill: 'hsl(45, 90%, 55%)' }} name="Zone 2" />
                <Line type="monotone" dataKey="zone3" stroke="hsl(200, 70%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(200, 70%, 50%)' }} name="Zone 3" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-0.5 bg-vegetation rounded" />
                <span className="text-muted-foreground">Zone 1</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-0.5 bg-golden rounded" />
                <span className="text-muted-foreground">Zone 2</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-0.5 bg-sky rounded" />
                <span className="text-muted-foreground">Zone 3</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
