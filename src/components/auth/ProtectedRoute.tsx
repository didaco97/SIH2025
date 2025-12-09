"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) {
    const { user, userProfile, loading, isConfigured } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isConfigured) {
            // Firebase not configured - allow access for development
            return;
        }

        if (!loading) {
            if (!user) {
                // Not authenticated - redirect to login
                router.push(redirectTo);
            } else if (requiredRole && userProfile?.role !== requiredRole) {
                // Wrong role - redirect to appropriate dashboard
                const dashboardPath = userProfile?.role === 'farmer' ? '/farmer' : '/officer';
                router.push(dashboardPath);
            }
        }
    }, [user, userProfile, loading, requiredRole, router, redirectTo, isConfigured]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    // If not configured, allow access
    if (!isConfigured) {
        return <>{children}</>;
    }

    // If not authenticated, show nothing (redirect will happen)
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    // If wrong role, show nothing (redirect will happen)
    if (requiredRole && userProfile?.role !== requiredRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
