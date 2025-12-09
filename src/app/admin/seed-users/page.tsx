"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

// Test users to create
const testUsers = [
    {
        email: "officer@krishisense.com",
        password: "Officer@123",
        displayName: "Rahul Officer",
        role: "officer",
        district: "Nashik",
    },
    {
        email: "farmer1@krishisense.com",
        password: "Farmer@123",
        displayName: "Rajesh Kumar",
        role: "farmer",
        village: "Palkhed",
        district: "Nashik",
    },
    {
        email: "farmer2@krishisense.com",
        password: "Farmer@123",
        displayName: "Suresh Patil",
        role: "farmer",
        village: "Sinnar",
        district: "Nashik",
    },
];

export default function SeedUsersPage() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [results, setResults] = useState<{ email: string; success: boolean; message: string }[]>([]);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => setDebugLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const copyCredentials = (email: string, password: string) => {
        navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
        alert("Credentials copied to clipboard!");
    };

    const seedUsers = async () => {
        if (!isFirebaseConfigured || !auth || !db) {
            alert("Firebase is not configured!");
            return;
        }

        setIsSeeding(true);
        setResults([]);
        setDebugLog([]);
        addLog("Starting user creation...");

        for (const user of testUsers) {
            try {
                addLog(`Creating ${user.role}: ${user.email}...`);

                // Create Firebase Auth user
                const credential = await createUserWithEmailAndPassword(auth, user.email, user.password);

                // Update display name
                await updateProfile(credential.user, { displayName: user.displayName });

                // Create Firestore profile
                await setDoc(doc(db, "users", credential.user.uid), {
                    uid: credential.user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.role,
                    district: user.district,
                    village: user.village || null,
                    createdAt: serverTimestamp(),
                });

                addLog(`✅ Created ${user.email}`);
                setResults((prev) => [...prev, { email: user.email, success: true, message: "Created successfully!" }]);
            } catch (error: any) {
                addLog(`❌ Failed ${user.email}: ${error.code || error.message}`);
                setResults((prev) => [
                    ...prev,
                    {
                        email: user.email,
                        success: false,
                        message: error.code === "auth/email-already-in-use" ? "Already exists (use these credentials)" : error.message,
                    },
                ]);
            }
        }

        addLog("User seeding complete!");
        setIsSeeding(false);
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Seed Test Users</h1>
                <p className="text-muted-foreground mb-8">Create Firebase Auth users with login credentials for testing</p>

                {/* Credentials Card */}
                <Card className="mb-6 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardHeader>
                        <CardTitle className="text-lg">📋 Test Credentials</CardTitle>
                        <CardDescription>Use these credentials to log in after seeding</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {testUsers.map((user) => (
                            <div
                                key={user.email}
                                className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-lg border"
                            >
                                <div>
                                    <p className="font-medium">
                                        {user.displayName}{" "}
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded ${user.role === "officer"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Password:</strong> {user.password}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyCredentials(user.email, user.password)}
                                    className="gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Seed Button */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Create Users in Firebase Auth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={seedUsers} disabled={isSeeding} className="w-full gap-2" size="lg">
                            {isSeeding ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Users...
                                </>
                            ) : (
                                <>
                                    <Users className="w-5 h-5" />
                                    Create Test Users
                                </>
                            )}
                        </Button>

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="space-y-2 mt-4">
                                {results.map((r) => (
                                    <div
                                        key={r.email}
                                        className={`p-3 rounded-lg flex items-center gap-2 ${r.success
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                            }`}
                                    >
                                        {r.success ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4" />
                                        )}
                                        <span className="font-medium">{r.email}:</span> {r.message}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Debug Log */}
                        {debugLog.length > 0 && (
                            <pre className="mt-4 p-3 bg-black text-green-400 rounded-lg text-xs font-mono max-h-48 overflow-y-auto">
                                {debugLog.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </pre>
                        )}
                    </CardContent>
                </Card>

                <p className="text-sm text-muted-foreground mt-4 text-center">
                    After creating users, go to{" "}
                    <a href="/login" className="text-primary underline">
                        /login
                    </a>{" "}
                    to sign in.
                </p>
            </div>
        </div>
    );
}
