import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Sprout, ArrowRight, Shield, BarChart3, MapPin } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage via-background to-sage-dark opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-vegetation/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-golden/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">YES-TECH Agri</span>
            </div>
          </header>
          
          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground font-display mb-6 leading-tight">
              Agricultural Monitoring & 
              <span className="text-primary"> Crop Insurance</span> Platform
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Empowering farmers and officers with AI-powered analytics, real-time heatmaps, and streamlined insurance claim management.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/officer">
                <Button size="lg" className="gap-2 gradient-primary text-primary-foreground hover:opacity-90 px-8">
                  <Shield className="w-5 h-5" />
                  Officer Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/farmer">
                <Button size="lg" variant="outline" className="gap-2 px-8 border-primary text-primary hover:bg-primary/5">
                  <Sprout className="w-5 h-5" />
                  Farmer Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="stat-card text-center">
              <div className="w-14 h-14 rounded-xl bg-sky-light flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-moisture" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI Heatmaps</h3>
              <p className="text-sm text-muted-foreground">Real-time soil moisture, NDVI, and vegetation analysis</p>
            </div>
            
            <div className="stat-card text-center">
              <div className="w-14 h-14 rounded-xl bg-[hsl(var(--status-approved-bg))] flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-vegetation" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Analytics</h3>
              <p className="text-sm text-muted-foreground">Comprehensive crop health monitoring and insights</p>
            </div>
            
            <div className="stat-card text-center">
              <div className="w-14 h-14 rounded-xl bg-[hsl(var(--status-pending-bg))] flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-golden" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy Claims</h3>
              <p className="text-sm text-muted-foreground">Streamlined PMFBY insurance claim processing</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© 2023 YES-TECH Agricultural Monitoring System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
