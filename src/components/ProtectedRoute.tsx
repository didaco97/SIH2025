"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

/**
 * Wrapper component to protect routes that require authentication
 * Optionally restricts access based on user role
 */
export function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = "/login",
}: ProtectedRouteProps) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Not authenticated - redirect to login
            if (!user) {
                router.push(redirectTo);
                return;
            }

            // Check role-based access
            if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
                // Redirect to appropriate dashboard based on role
                if (userProfile.role === "farmer") {
                    router.push("/farmer");
                } else if (userProfile.role === "officer") {
                    router.push("/officer");
                }
            }
        }
    }, [user, userProfile, loading, allowedRoles, router, redirectTo]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    // Role check failed
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        return null;
    }

    return <>{children}</>;
}

/**
 * HOC to wrap a page component with protection
 */
export function withProtectedRoute<P extends object>(
    Component: React.ComponentType<P>,
    options?: {
        allowedRoles?: UserRole[];
        redirectTo?: string;
    }
) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute
                allowedRoles={options?.allowedRoles}
                redirectTo={options?.redirectTo}
            >
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}
