"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function CleanupPage() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ claims: number; farms: number } | null>(null);

    const clearClaims = async () => {
        setLoading(true);
        try {
            const claimsRef = collection(db, 'claims');
            const snapshot = await getDocs(claimsRef);

            console.log(`Deleting ${snapshot.docs.length} claims...`);

            const deletePromises = snapshot.docs.map(document =>
                deleteDoc(doc(db, 'claims', document.id))
            );

            await Promise.all(deletePromises);
            toast.success(`Deleted ${snapshot.docs.length} claims`);
            setStats(prev => ({ ...prev, claims: snapshot.docs.length, farms: prev?.farms || 0 }));
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearFarms = async () => {
        setLoading(true);
        try {
            const farmsRef = collection(db, 'segmented_farms');
            const snapshot = await getDocs(farmsRef);

            console.log(`Deleting ${snapshot.docs.length} farms...`);

            const deletePromises = snapshot.docs.map(document =>
                deleteDoc(doc(db, 'segmented_farms', document.id))
            );

            await Promise.all(deletePromises);
            toast.success(`Deleted ${snapshot.docs.length} segmented farms`);
            setStats(prev => ({ claims: prev?.claims || 0, farms: snapshot.docs.length }));
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearAll = async () => {
        setLoading(true);
        try {
            // Delete claims
            const claimsRef = collection(db, 'claims');
            const claimsSnapshot = await getDocs(claimsRef);
            const claimsPromises = claimsSnapshot.docs.map(d =>
                deleteDoc(doc(db, 'claims', d.id))
            );
            await Promise.all(claimsPromises);

            // Delete farms
            const farmsRef = collection(db, 'segmented_farms');
            const farmsSnapshot = await getDocs(farmsRef);
            const farmsPromises = farmsSnapshot.docs.map(d =>
                deleteDoc(doc(db, 'segmented_farms', d.id))
            );
            await Promise.all(farmsPromises);

            toast.success(`Deleted ${claimsSnapshot.docs.length} claims and ${farmsSnapshot.docs.length} farms`);
            setStats({ claims: claimsSnapshot.docs.length, farms: farmsSnapshot.docs.length });
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Database Cleanup</h1>
                    <p className="text-muted-foreground mt-2">
                        Remove all test data from Firestore
                    </p>
                </div>

                {stats && (
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">
                                    Deleted: {stats.claims} claims, {stats.farms} farms
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-red-500/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <CardTitle className="text-red-500">Danger Zone</CardTitle>
                        </div>
                        <CardDescription>
                            Click any button below to immediately delete data. No confirmation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">Clear All Claims</h3>
                                <p className="text-sm text-muted-foreground">
                                    Delete all claims from Firestore
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={clearClaims}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Claims
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">Clear All Segmented Farms</h3>
                                <p className="text-sm text-muted-foreground">
                                    Delete all segmented farms from Firestore
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={clearFarms}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Farms
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg bg-red-500/5">
                            <div>
                                <h3 className="font-medium text-red-500">Clear Everything</h3>
                                <p className="text-sm text-muted-foreground">
                                    Delete ALL claims and segmented farms
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={clearAll}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete All Data
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
