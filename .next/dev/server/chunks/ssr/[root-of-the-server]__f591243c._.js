module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/app/not-found.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/not-found.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/pages/farmer/Settings.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
```javascript
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

                        {/* App Preferences */}
                        <section className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-sky" />
                                App Preferences
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">Language</p>
                                        <p className="text-sm text-muted-foreground">Select your preferred language</p>
                                    </div>
                                    <select className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Marathi</option>
                                        <option>Gujarati</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">Dark Mode</p>
                                        <p className="text-sm text-muted-foreground">Toggle dark theme</p>
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
```;
}),
"[project]/src/app/farmer/settings/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SettingsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$farmer$2f$Settings$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/pages/farmer/Settings.tsx [app-rsc] (ecmascript)");
;
;
function SettingsPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$farmer$2f$Settings$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/farmer/settings/page.tsx",
        lineNumber: 4,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/app/farmer/settings/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/farmer/settings/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f591243c._.js.map