"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, limit, getDocs, onSnapshot, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { ClaimData } from "@/lib/firestore";

interface UseClaimsOptions {
    limitCount?: number;
    realtime?: boolean;
    farmerId?: string;
}

export function useClaims(options: UseClaimsOptions = {}) {
    const { limitCount = 50, realtime = true, farmerId } = options;

    const [claims, setClaims] = useState<ClaimData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchClaims = useCallback(async () => {
        if (!isFirebaseConfigured || !db) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const claimsRef = collection(db, "claims");
            const q = query(claimsRef, orderBy("createdAt", "desc"), limit(limitCount * 2)); // Get more to allow filtering
            const snapshot = await getDocs(q);
            let fetchedClaims: ClaimData[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ClaimData));

            // Filter by farmerId or userId if provided
            if (farmerId) {
                fetchedClaims = fetchedClaims.filter(claim =>
                    claim.farmerId === farmerId || claim.userId === farmerId
                );
            }

            setClaims(fetchedClaims.slice(0, limitCount));
            setError(null);
        } catch (err) {
            console.error("Failed to fetch claims", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [limitCount, farmerId]);

    useEffect(() => {
        if (!isFirebaseConfigured || !db) {
            setLoading(false);
            return;
        }

        if (realtime) {
            // Setup realtime listener
            const claimsRef = collection(db, "claims");
            const q = query(claimsRef, orderBy("createdAt", "desc"), limit(limitCount * 2));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    let fetchedClaims: ClaimData[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as ClaimData));

                    // Filter by farmerId or userId if provided
                    if (farmerId) {
                        fetchedClaims = fetchedClaims.filter(claim =>
                            claim.farmerId === farmerId || claim.userId === farmerId
                        );
                    }

                    setClaims(fetchedClaims.slice(0, limitCount));
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    console.error("Claims listener error", err);
                    setError(err as Error);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } else {
            fetchClaims();
        }
    }, [limitCount, realtime, farmerId, fetchClaims]);

    return {
        claims,
        loading,
        error,
        refetch: fetchClaims,
    };
}
