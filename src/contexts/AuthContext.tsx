"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
    Auth,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

export type UserRole = 'farmer' | 'officer';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: UserRole;
    district?: string;
    village?: string;
    phone?: string;
    createdAt?: Date;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    isConfigured: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
    signInWithGoogle: (role?: UserRole) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

// Helper to check auth is available
function getAuth(): Auth {
    if (!auth) {
        throw new Error('Firebase Auth is not configured. Please set up your .env.local file.');
    }
    return auth;
}

// Helper to check db is available
function getDb(): Firestore {
    if (!db) {
        throw new Error('Firebase Firestore is not configured. Please set up your .env.local file.');
    }
    return db;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
        try {
            const userDoc = await getDoc(doc(getDb(), 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    uid,
                    email: data.email,
                    displayName: data.displayName,
                    role: data.role,
                    district: data.district,
                    village: data.village,
                    phone: data.phone,
                    createdAt: data.createdAt?.toDate(),
                };
            }
            return null;
        } catch (err) {
            console.error('Error fetching user profile:', err);
            return null;
        }
    };

    // Create user profile in Firestore
    const createUserProfile = async (
        uid: string,
        email: string,
        displayName: string,
        role: UserRole
    ) => {
        await setDoc(doc(getDb(), 'users', uid), {
            email,
            displayName,
            role,
            createdAt: serverTimestamp(),
        });
    };

    // Listen to auth state changes
    useEffect(() => {
        // If Firebase is not configured, just mark as not loading
        if (!isFirebaseConfigured || !auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                const profile = await fetchUserProfile(firebaseUser.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sign in with email/password
    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            await signInWithEmailAndPassword(getAuth(), email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign up with email/password
    const signUp = async (email: string, password: string, name: string, role: UserRole) => {
        try {
            setError(null);
            setLoading(true);

            const result = await createUserWithEmailAndPassword(getAuth(), email, password);

            // Update display name
            await updateProfile(result.user, { displayName: name });

            // Create user profile in Firestore
            await createUserProfile(result.user.uid, email, name, role);

            // Fetch the profile
            const profile = await fetchUserProfile(result.user.uid);
            setUserProfile(profile);
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign in with Google
    const signInWithGoogle = async (role: UserRole = 'farmer') => {
        try {
            setError(null);
            setLoading(true);

            const result = await signInWithPopup(getAuth(), googleProvider);

            // Check if user profile exists
            const existingProfile = await fetchUserProfile(result.user.uid);

            if (!existingProfile) {
                // Create new profile for first-time Google users
                await createUserProfile(
                    result.user.uid,
                    result.user.email || '',
                    result.user.displayName || '',
                    role
                );
            }

            const profile = await fetchUserProfile(result.user.uid);
            setUserProfile(profile);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(getAuth());
            setUserProfile(null);
        } catch (err: any) {
            setError(err.message || 'Failed to sign out');
            throw err;
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await sendPasswordResetEmail(getAuth(), email);
        } catch (err: any) {
            setError(err.message || 'Failed to send password reset email');
            throw err;
        }
    };

    // Clear error
    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        error,
        isConfigured: !!isFirebaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
