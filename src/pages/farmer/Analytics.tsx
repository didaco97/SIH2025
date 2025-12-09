"use client";

import { FarmerSidebar } from "@/components/farmer/FarmerSidebar";
import { Activity, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const rainfallData = [
    { month: 'Jan', amount: 12 },
    { month: 'Feb', amount: 18 },
    { month: 'Mar', amount: 25 },
    { month: 'Apr', amount: 45 },
    { month: 'May', amount: 80 },
    { month: 'Jun', amount: 150 },
    { month: 'Jul', amount: 320 },
    { month: 'Aug', amount: 290 },
    { month: 'Sep', amount: 180 },
    { month: 'Oct', amount: 90 },
    { month: 'Nov', amount: 30 },
    { month: 'Dec', amount: 15 },
];

export default function Analytics() {
    return (
        <div className="flex min-h-screen bg-background">
            <FarmerSidebar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground font-display mb-2">Farm Analytics</h1>
                    <p className="text-sm text-muted-foreground">Insights and performance metrics for your farm</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Crop Health</h3>
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">92%</div>
                        <p className="text-xs text-muted-foreground">+2% from last week</p>
                        <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[92%]" />
                        </div>
                    </div>

                    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Yield Prediction</h3>
                            <TrendingUp className="w-5 h-5 text-golden" />
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">4.2 Tons</div>
                        <p className="text-xs text-muted-foreground">Estimated for this season</p>
                        <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-golden w-[75%]" />
                        </div>
                    </div>

                    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Growth Stage</h3>
                            <Calendar className="w-5 h-5 text-sky" />
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">Vegetative</div>
                        <p className="text-xs text-muted-foreground">Day 45 of 120</p>
                        <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-sky w-[40%]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-foreground">Rainfall History</h3>
                            <Button variant="outline" size="sm">Yearly View</Button>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={rainfallData}>
                                    <defs>
                                        <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        unit="mm"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--primary))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRain)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-foreground">Soil Moisture Levels</h3>
                            <Button variant="outline" size="sm">Live Data</Button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: "Surface (0-10cm)", value: 78, color: "bg-sky" },
                                { label: "Root Zone (10-30cm)", value: 65, color: "bg-primary" },
                                { label: "Deep Soil (30-60cm)", value: 82, color: "bg-forest" },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <span className="font-medium text-foreground">{item.value}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-secondary/30 rounded-lg border border-border/50">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Recommendation:</strong> Soil moisture is optimal for the current growth stage. No irrigation required for the next 2 days.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
