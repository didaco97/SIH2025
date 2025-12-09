"use client";

import { FarmerSidebar } from "@/components/farmer/FarmerSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Shield, User, Globe, LogOut, Sprout, CreditCard, Smartphone, FileText } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export default function Settings() {
    return (
        <div className="flex min-h-screen bg-background">
            <FarmerSidebar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground font-display mb-2">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your account preferences and app settings</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column: Settings Forms (Span 7) */}
                    <div className="xl:col-span-7 space-y-8">
                        {/* Profile Section */}
                        <section className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Profile Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue="Rajesh Kumar" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" defaultValue="rajesh.kumar@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" defaultValue="+91 98765 43210" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Village / District</Label>
                                    <Input id="location" defaultValue="Nashik, Maharashtra" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button>Save Changes</Button>
                            </div>
                        </section>

                        {/* Notifications Section */}
                        <section className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-golden" />
                                Notifications
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">Weather Alerts</p>
                                        <p className="text-sm text-muted-foreground">Get notified about severe weather conditions</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">Claim Updates</p>
                                        <p className="text-sm text-muted-foreground">Receive updates on your insurance claim status</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">Market Prices</p>
                                        <p className="text-sm text-muted-foreground">Daily updates on crop market prices</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </section>



                        {/* Security Section */}
                        <section className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-destructive" />
                                Security
                            </h2>
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full justify-start">Change Password</Button>
                                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Government Schemes Bento Grid (Span 5) */}
                    <div className="xl:col-span-5">
                        <div className="bg-card/50 rounded-xl border border-border/50 p-6 h-full">
                            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-primary" />
                                Government Schemes
                            </h2>
                            <BentoGrid className="grid-cols-1 md:grid-cols-2 gap-4">
                                {schemes.map((item, i) => (
                                    <BentoGridItem
                                        key={i}
                                        title={item.title}
                                        description={item.description}
                                        header={item.header}
                                        icon={item.icon}
                                        className={i === 0 || i === 3 ? "md:col-span-2" : ""}
                                    />
                                ))}
                            </BentoGrid>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const schemes = [
    {
        title: "PM-KISAN",
        description: "Direct income support of ₹6,000 per year for farmers.",
        header: <img src="/schemes/pm-kisan.png" alt="PM-KISAN" className="w-full h-32 object-cover rounded-xl" />,
        icon: <User className="h-4 w-4 text-primary" />,
    },
    {
        title: "Soil Health Card",
        description: "Crop-wise recommendations of nutrients and fertilizers.",
        header: <img src="/schemes/soil-health.png" alt="Soil Health Card" className="w-full h-32 object-cover rounded-xl" />,
        icon: <Sprout className="h-4 w-4 text-forest" />,
    },
    {
        title: "e-NAM",
        description: "Online trading platform for agricultural commodities.",
        header: <img src="/schemes/enam.png" alt="e-NAM" className="w-full h-32 object-cover rounded-xl" />,
        icon: <Smartphone className="h-4 w-4 text-sky" />,
    },
    {
        title: "Kisan Credit Card",
        description: "Adequate and timely credit support from banking system.",
        header: <img src="/schemes/kcc.png" alt="KCC" className="w-full h-32 object-cover rounded-xl" />,
        icon: <CreditCard className="h-4 w-4 text-golden" />,
    },
];
