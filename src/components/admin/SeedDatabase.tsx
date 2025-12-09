"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

// Mock farmers data
const mockFarmers = [
    { id: "FARMER001", name: "Rajesh Kumar", village: "Palkhed", district: "Nashik" },
    { id: "FARMER002", name: "Suresh Patil", village: "Sinnar", district: "Nashik" },
    { id: "FARMER003", name: "Amit Sharma", village: "Niphad", district: "Nashik" },
    { id: "FARMER004", name: "Vikram Singh", village: "Yeola", district: "Nashik" },
    { id: "FARMER005", name: "Prakash Jadhav", village: "Malegaon", district: "Nashik" },
    { id: "FARMER006", name: "Mahesh Deshmukh", village: "Dindori", district: "Nashik" },
    { id: "FARMER007", name: "Sanjay More", village: "Chandwad", district: "Nashik" },
    { id: "FARMER008", name: "Ganesh Wagh", village: "Kalwan", district: "Nashik" },
];

const cropTypes = ["Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Onion", "Grape", "Soybean"];
const lossTypes = ["drought", "flood", "pest", "fire", "landslide", "hailstorm"];
const cropStages = ["sowing", "vegetative", "flowering", "maturity"];
const statuses = ["pending", "waiting", "approved", "rejected"];

// Generate random date in past 3 months
const randomDate = () => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
};

// Generate claim number
const generateClaimNumber = (index: number) => {
    const year = new Date().getFullYear();
    return `CLM-${year}-${String(index + 1).padStart(4, '0')}`;
};

// Generate mock claims
const generateMockClaims = (count: number) => {
    const claims = [];
    for (let i = 0; i < count; i++) {
        const farmer = mockFarmers[Math.floor(Math.random() * mockFarmers.length)];
        const lossDate = randomDate();
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const claim: Record<string, any> = {
            claimNumber: generateClaimNumber(i),
            farmerId: farmer.id,
            farmerName: farmer.name,
            userId: farmer.id,
            filedBy: Math.random() > 0.7 ? "officer" : "farmer",
            village: farmer.village,
            district: farmer.district,
            taluka: farmer.village,
            cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
            area: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
            areaUnit: "acres",
            policyNumber: `PMFBY-2023-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
            lossType: lossTypes[Math.floor(Math.random() * lossTypes.length)],
            lossDate: Timestamp.fromDate(lossDate),
            cropStage: cropStages[Math.floor(Math.random() * cropStages.length)],
            description: `Crop damage due to ${lossTypes[Math.floor(Math.random() * lossTypes.length)]} conditions. Estimated loss of ${Math.floor(Math.random() * 80 + 20)}% of expected yield.`,
            amount: Math.floor(Math.random() * 50000 + 5000),
            status: status,
            documents: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (status === "approved") {
            claim.officerNotes = "Claim verified and approved.";
            claim.processedBy = "OFFICER001";
        } else if (status === "rejected") {
            claim.officerNotes = "Insufficient evidence provided.";
            claim.processedBy = "OFFICER001";
        } else if (status === "waiting") {
            claim.processedBy = "OFFICER001";
        }

        claims.push(claim);
    }
    return claims;
};

export default function SeedDatabase() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [progress, setProgress] = useState(0);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const testConnection = async () => {
        addLog("Testing Firestore connection...");
        try {
            if (!db) throw new Error("Database instance is null");
            const testRef = collection(db, "connection_test");
            await addDoc(testRef, { timestamp: serverTimestamp(), type: "test" });
            addLog("✅ Connection successful! Write operation worked.");
            alert("Connection successful!");
        } catch (error: any) {
            console.error("Connection test failed:", error);
            addLog(`❌ Connection failed: ${error.message}`);
            if (error.code) addLog(`Error Code: ${error.code}`);
        }
    };

    const seedClaims = async () => {
        if (!isFirebaseConfigured || !db) {
            setResult({
                success: false,
                message: "Firebase is not configured. Please set up .env.local with Firebase credentials."
            });
            addLog("Firebase config missing");
            return;
        }

        setIsSeeding(true);
        setResult(null);
        setProgress(0);
        setDebugLog([]);
        addLog("Starting seed process...");

        try {
            const claims = generateMockClaims(15);
            addLog(`Generated ${claims.length} mock claims`);
            const claimsRef = collection(db, "claims");

            for (let i = 0; i < claims.length; i++) {
                addLog(`Adding claim ${i + 1}/${claims.length}...`);
                await addDoc(claimsRef, claims[i]);
                setProgress(Math.round(((i + 1) / claims.length) * 100));
            }

            addLog("All claims added successfully");
            setResult({
                success: true,
                message: `Successfully added ${claims.length} mock claims to Firestore!`
            });
        } catch (error: any) {
            console.error("Seeding error:", error);
            addLog(`❌ Error: ${error.message}`);
            if (error.code === 'permission-denied') {
                addLog("⚠️ PERMISSION DENIED: Check Firestore Security Rules.");
            }
            setResult({
                success: false,
                message: error.message || "Failed to seed database"
            });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Database Seeder</h1>
                <p className="text-muted-foreground mb-8">
                    Populate Firestore with mock claims data for testing
                </p>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            Seed Mock Claims
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 mb-4">
                            <Button variant="outline" size="sm" onClick={testConnection}>
                                Test Connection
                            </Button>
                        </div>

                        {debugLog.length > 0 && (
                            <div className="bg-slate-950 text-slate-50 p-3 rounded text-xs font-mono max-h-40 overflow-auto mb-4 border border-slate-800">
                                {debugLog.map((log, i) => <div key={i}>{log}</div>)}
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            This will create 15 mock insurance claims with random data including:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>8 different farmers from Nashik district</li>
                            <li>Various crop types (Rice, Wheat, Cotton, etc.)</li>
                            <li>Different loss types (drought, flood, pest, fire)</li>
                            <li>Mixed statuses (pending, approved, rejected)</li>
                            <li>Random claim amounts (₹5,000 - ₹55,000)</li>
                        </ul>

                        {isSeeding && (
                            <div className="space-y-2">
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-center text-muted-foreground">
                                    {progress}% complete
                                </p>
                            </div>
                        )}

                        {result && (
                            <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success
                                ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                                : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                                }`}>
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                )}
                                <p className="text-sm">{result.message}</p>
                            </div>
                        )}

                        <Button
                            onClick={seedClaims}
                            disabled={isSeeding}
                            className="w-full gap-2"
                        >
                            {isSeeding ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Seeding Database...
                                </>
                            ) : (
                                <>
                                    <Database className="w-4 h-4" />
                                    Seed 15 Mock Claims
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            After seeding, go to <strong>/officer/claims</strong> to see the data
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
