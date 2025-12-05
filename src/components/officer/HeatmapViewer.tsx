import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Layers, Navigation } from "lucide-react";

const aiHeatmapOptions = [
  { value: "vegetation", label: "Low/High Vegetation" },
  { value: "water-stress", label: "Water-Stressed Zones" },
  { value: "nutrient", label: "Nutrient Deficiency" },
  { value: "pest", label: "Pest & Disease Hotspots" },
];

export function HeatmapViewer() {
  const [soilMoisture, setSoilMoisture] = useState(true);
  const [ndvi, setNdvi] = useState(true);
  const [weatherEvents, setWeatherEvents] = useState(false);
  const [aiHeatmap, setAiHeatmap] = useState("vegetation");

  return (
    <div className="flex gap-6">
      {/* Main Map Area */}
      <div className="flex-1 bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-foreground font-display">Farm Heatmaps</h2>
          
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch id="soil" checked={soilMoisture} onCheckedChange={setSoilMoisture} />
              <Label htmlFor="soil" className="text-sm cursor-pointer">Soil Moisture</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="ndvi" checked={ndvi} onCheckedChange={setNdvi} />
              <Label htmlFor="ndvi" className="text-sm cursor-pointer">NDVI</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="weather" checked={weatherEvents} onCheckedChange={setWeatherEvents} />
              <Label htmlFor="weather" className="text-sm cursor-pointer">Weather Events</Label>
            </div>
            
            <Select value={aiHeatmap} onValueChange={setAiHeatmap}>
              <SelectTrigger className="w-[200px] bg-secondary">
                <SelectValue placeholder="AI-Generated Heatmaps" />
              </SelectTrigger>
              <SelectContent>
                {aiHeatmapOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Map Display */}
        <div className="relative h-[500px] bg-sage">
          {/* Simulated Heatmap */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[90%] h-[90%] rounded-lg overflow-hidden">
              {/* Base farm image simulation */}
              <div className="absolute inset-0 bg-gradient-to-br from-forest/30 via-vegetation/40 to-golden/30" />
              
              {/* Heatmap overlay zones */}
              <div className="absolute top-[20%] left-[30%] w-32 h-32 rounded-full bg-vegetation/60 blur-xl" />
              <div className="absolute top-[40%] right-[25%] w-24 h-24 rounded-full bg-golden/60 blur-xl" />
              <div className="absolute bottom-[25%] left-[40%] w-28 h-28 rounded-full bg-danger-zone/40 blur-xl" />
              <div className="absolute top-[60%] left-[20%] w-20 h-20 rounded-full bg-vegetation/50 blur-xl" />
              
              {/* Farm boundary */}
              <div className="absolute inset-[10%] border-2 border-golden border-dashed rounded-lg" />
              
              {/* NDVI Legend Popup */}
              {ndvi && (
                <div className="absolute bottom-8 left-8 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card animate-fade-in">
                  <p className="text-sm font-semibold mb-2">NDVI</p>
                  <div className="w-32 h-3 rounded heatmap-legend" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              )}
              
              {/* Soil Moisture Legend */}
              {soilMoisture && (
                <div className="absolute bottom-8 right-8 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card animate-fade-in">
                  <p className="text-sm font-semibold mb-2">Soil Moisture</p>
                  <div className="w-32 h-3 rounded bg-gradient-to-r from-danger-zone via-golden to-moisture" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Dry</span>
                    <span>Wet</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="shadow-card">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="shadow-card">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="shadow-card">
              <Layers className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="shadow-card">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Right Side Panel */}
      <div className="w-72 bg-card rounded-2xl shadow-card p-5">
        <h3 className="text-lg font-semibold text-foreground font-display mb-4">Heatmap Details</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground">
              {aiHeatmap === "vegetation" && "Vegetation Index"}
              {aiHeatmap === "water-stress" && "Water Stress Analysis"}
              {aiHeatmap === "nutrient" && "Nutrient Deficiency"}
              {aiHeatmap === "pest" && "Pest & Disease Risk"}
            </h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {aiHeatmap === "vegetation" && "This heatmap displays vegetation health using NDVI analysis. Green zones indicate healthy vegetation while red zones may require attention."}
              {aiHeatmap === "water-stress" && "Identifies areas experiencing water stress. Yellow and red zones indicate crops requiring immediate irrigation."}
              {aiHeatmap === "nutrient" && "Highlights areas with potential nutrient deficiencies based on spectral analysis and historical yield data."}
              {aiHeatmap === "pest" && "AI-detected hotspots with elevated risk of pest infestation or disease outbreak based on environmental conditions."}
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Download className="w-4 h-4" />
              Download GeoJSON
            </Button>
          </div>
          
          <div className="pt-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <Select defaultValue="oct-nov">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oct-nov">Oct 2023 - Nov 2023</SelectItem>
                <SelectItem value="aug-sep">Aug 2023 - Sep 2023</SelectItem>
                <SelectItem value="jun-jul">Jun 2023 - Jul 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
