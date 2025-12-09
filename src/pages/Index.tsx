"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Shield, Sprout, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const router = useRouter();
  const { signIn, signUp, error, clearError } = useAuth();
  const [activeRole, setActiveRole] = useState<"officer" | "farmer">("officer");

  // Officer login state
  const [officerEmail, setOfficerEmail] = useState("");
  const [officerPassword, setOfficerPassword] = useState("");

  // Farmer signup state
  const [farmerName, setFarmerName] = useState("");
  const [farmerEmail, setFarmerEmail] = useState("");
  const [farmerPassword, setFarmerPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!officerEmail || !officerPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await signIn(officerEmail, officerPassword);
      router.push("/officer");
    } catch (err) {
      // Error is set in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!farmerName || !farmerEmail || !farmerPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (farmerPassword.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await signUp(farmerEmail, farmerPassword, farmerName, "farmer");
      router.push("/farmer");
    } catch (err) {
      // Error is set in context
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sage/30 via-background to-forest/20">
      {/* Liquid Effect Background */}
      <LiquidEffectAnimation />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-vegetation/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-golden/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="KrishiSense" className="w-10 h-10 rounded-xl object-contain" />
          <span className="font-display font-bold text-2xl text-foreground">KrishiSense</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">AI-Powered Agricultural Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground font-display leading-tight">
              Agricultural Monitoring &{" "}
              <span className="bg-gradient-to-r from-primary via-vegetation to-golden bg-clip-text text-transparent">
                Crop Insurance
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Empowering farmers and officers with AI-powered analytics, real-time satellite heatmaps, and streamlined PMFBY insurance claim management.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-10 h-10 rounded-lg bg-sky-light flex items-center justify-center">
                  <span className="text-2xl">🛰️</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Satellite Maps</p>
                  <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-approved-bg))] flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">AI Analytics</p>
                  <p className="text-xs text-muted-foreground">NDVI & health data</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-pending-bg))] flex items-center justify-center">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Crop Insurance</p>
                  <p className="text-xs text-muted-foreground">PMFBY claims</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-waiting-bg))] flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Fast Processing</p>
                  <p className="text-xs text-muted-foreground">Quick approvals</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Signup Forms */}
          <div className="animate-slide-in flex flex-col relative">
            <div className="relative h-full rounded-3xl border p-2">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-8 flex-1 flex flex-col min-h-[600px] relative z-10">
                <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as "officer" | "farmer")} className="w-full flex flex-col flex-1">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50">
                    <TabsTrigger value="officer" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md">
                      <Shield className="w-4 h-4" />
                      Officer
                    </TabsTrigger>
                    <TabsTrigger value="farmer" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md">
                      <Sprout className="w-4 h-4" />
                      Farmer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="officer" className="space-y-6 mt-0">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-foreground font-display mb-2">Officer Portal</h2>
                      <p className="text-sm text-muted-foreground">Monitor and manage agricultural claims</p>
                    </div>

                    {displayError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{displayError}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleOfficerLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="officer-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="officer-email"
                            type="email"
                            placeholder="officer@example.com"
                            className="pl-10"
                            value={officerEmail}
                            onChange={(e) => setOfficerEmail(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="officer-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="officer-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={officerPassword}
                            onChange={(e) => setOfficerPassword(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full gradient-primary text-primary-foreground gap-2 group hover:shadow-lg transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In as Officer
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-primary font-medium hover:underline">
                          Sign Up
                        </Link>
                      </p>

                      <div className="mt-6 rounded-xl overflow-hidden h-32 w-full">
                        <img src="/auth-footer.jpg" alt="Agricultural Scene" className="w-full h-full object-cover object-top" />
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="farmer" className="space-y-6 mt-0">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-foreground font-display mb-2">Kisan Portal</h2>
                      <p className="text-sm text-muted-foreground">Manage your farm and file claims</p>
                    </div>

                    {displayError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{displayError}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleFarmerSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmer-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="farmer-name"
                            type="text"
                            placeholder="Your full name"
                            className="pl-10"
                            value={farmerName}
                            onChange={(e) => setFarmerName(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="farmer-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="farmer-email"
                            type="email"
                            placeholder="farmer@example.com"
                            className="pl-10"
                            value={farmerEmail}
                            onChange={(e) => setFarmerEmail(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="farmer-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="farmer-password"
                            type="password"
                            placeholder="Create a password"
                            className="pl-10"
                            value={farmerPassword}
                            onChange={(e) => setFarmerPassword(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full gradient-primary text-primary-foreground gap-2 group hover:shadow-lg transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Sign Up as Farmer
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                          Sign In
                        </Link>
                      </p>

                      <div className="mt-6 rounded-xl overflow-hidden h-32 w-full">
                        <img src="/auth-footer.jpg" alt="Agricultural Scene" className="w-full h-full object-cover object-top" />
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>PMFBY Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border/50 mt-16 py-6 text-center text-sm text-muted-foreground bg-card/30 backdrop-blur-sm">
          <p>© 2025 KrishiSense - Team Graviton</p>
        </footer>

        {/* Demo Fill Button */}
        <Button
          onClick={() => {
            if (activeRole === "officer") {
              const email = document.getElementById("officer-email") as HTMLInputElement;
              const pass = document.getElementById("officer-password") as HTMLInputElement;
              if (email) email.value = "officer@krishisense.gov.in";
              if (pass) pass.value = "admin123";
            } else {
              const name = document.getElementById("farmer-name") as HTMLInputElement;
              const mobile = document.getElementById("farmer-mobile") as HTMLInputElement;
              const pass = document.getElementById("farmer-password") as HTMLInputElement;
              if (name) name.value = "Rajesh Kumar";
              if (mobile) mobile.value = "9876543210";
              if (pass) pass.value = "farmer123";
            }
          }}
          className="fixed bottom-4 left-4 z-50 bg-card/30 backdrop-blur-md border border-primary/20 hover:bg-primary/20 text-foreground rounded-full px-4 py-2 text-xs font-medium transition-all shadow-lg hover:scale-105"
        >
          ⚡ Demo Fill
        </Button>
      </div>
    </div>
  );
};

export default Index;
