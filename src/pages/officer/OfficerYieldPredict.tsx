"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { OfficerSidebar } from "@/components/officer/OfficerSidebar";
import { Button } from "@/components/ui/button";
import { GoogleMap, useJsApiLoader, Polygon, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    BrainCircuit,
    MapPin,
    Leaf,
    Droplets,
    Wheat,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    TrendingUp,
    ThermometerSun,
    CloudRain,
    Sun,
    Info,
    User,
    FileText,
    Calendar,
    Ruler,
    ArrowLeft,
    FileDown,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { SegmentedFarmData, ClaimData, getSegmentedFarmById, getClaim } from "@/lib/firestore";
import { generatePDFReport } from "@/lib/generatePDFReport";

// Threshold yields (kg/ha) for different crops
const THRESHOLD_YIELDS: Record<string, number> = {
    Rice: 1640,
    Cotton: 350,
    Soybean: 950,
    Wheat: 1800,
    Sugarcane: 80000,
    Maize: 1500,
    Groundnut: 1200,
    Jowar: 800,
};

interface PredictionResult {
    ndvi: number;
    ndwi: number;
    evi: number;
    predictedYield: number;
    uncertainty: number;
    confidenceLow: number;
    confidenceHigh: number;
    threshold: number;
    shortfall: number;
    lossPercentage: number;
    claimTriggered: boolean;
    claimProbability: number;
    decisionConfidence: number;
    healthStatus: string;
    healthScore: number;
    weather: {
        rainTotal: number;
        gdd: number;
        heatStress: number;
        vpd: number;
    };
    stress: {
        vegetative: number;
        flowering: number;
        grainFill: number;
        combined: number;
        yieldPotential: number;
    };
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
};

export default function OfficerYieldPredict() {
    const searchParams = useSearchParams();
    const farmId = searchParams?.get('farmId');
    const claimId = searchParams?.get('claimId');

    const [farm, setFarm] = useState<SegmentedFarmData | null>(null);
    const [claim, setClaim] = useState<ClaimData | null>(null);
    const [loading, setLoading] = useState(true);
    const [predicting, setPredicting] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [verified, setVerified] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    // Fetch farm and claim data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (farmId) {
                    const farmData = await getSegmentedFarmById(farmId);
                    setFarm(farmData);
                }
                if (claimId) {
                    const claimData = await getClaim(claimId);
                    setClaim(claimData);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [farmId, claimId]);

    // Calculate farm center and coordinates
    const getFarmCenter = () => {
        if (!farm?.features?.[0]?.geometry?.coordinates) return { lat: 20.5937, lng: 78.9629 };
        const coords = farm.features[0].geometry.coordinates[0];
        const lats = coords.map((c: number[]) => c[1]);
        const lons = coords.map((c: number[]) => c[0]);
        const centerLat = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
        const centerLon = lons.reduce((a: number, b: number) => a + b, 0) / lons.length;
        return { lat: centerLat, lng: centerLon };
    };

    const center = getFarmCenter();

    // Predict yield
    const handlePredict = async () => {
        if (!farm) return;

        setPredicting(true);
        setError(null);
        setResult(null);

        const crop = farm.cropType || claim?.cropType || 'Rice';
        const threshold = THRESHOLD_YIELDS[crop] || 1640;
        const area = (farm.features[0].properties.area_m2 || 0) * 0.0001; // Convert m2 to hectares

        try {
            const response = await fetch('http://localhost:8002/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lat: center.lat,
                    lon: center.lng,
                    district: farm.district || claim?.district || 'Ahmednagar',
                    crop: crop,
                    season: 'Kharif',
                    area: area,
                    threshold: threshold,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `API error: ${response.status}`);
            }

            const data = await response.json();

            setResult({
                ndvi: data.satellite.ndvi,
                ndwi: data.satellite.ndwi,
                evi: data.satellite.evi,
                predictedYield: data.predicted_yield,
                uncertainty: data.uncertainty,
                confidenceLow: data.confidence_low,
                confidenceHigh: data.confidence_high,
                threshold: data.pmfby.threshold,
                shortfall: data.pmfby.shortfall,
                lossPercentage: data.pmfby.loss_percentage,
                claimTriggered: data.pmfby.claim_triggered,
                claimProbability: data.pmfby.claim_probability,
                decisionConfidence: data.pmfby.decision_confidence,
                healthStatus: data.satellite.health_status,
                healthScore: data.satellite.health_score,
                weather: {
                    rainTotal: data.weather.rain_total,
                    gdd: data.weather.gdd,
                    heatStress: data.weather.heat_stress,
                    vpd: data.weather.vpd,
                },
                stress: {
                    vegetative: data.stress.vegetative,
                    flowering: data.stress.flowering,
                    grainFill: data.stress.grain_fill,
                    combined: data.stress.combined,
                    yieldPotential: data.stress.yield_potential,
                },
            });
        } catch (err: any) {
            console.error('Prediction API error:', err);
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                setError('PMFBY API server is not running. Please start it with: python api_server.py (in PMFBY folder)');
            } else {
                setError(err.message || 'Unknown error occurred');
            }
        }

        setPredicting(false);
    };

    const getHealthColor = (status: string) => {
        switch (status) {
            case "Excellent": return "text-green-500";
            case "Good": return "text-emerald-500";
            case "Moderate": return "text-yellow-500";
            case "Poor": return "text-orange-500";
            default: return "text-red-500";
        }
    };

    const getClaimBadge = (triggered: boolean) => {
        if (triggered) {
            return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">CLAIM TRIGGERED</Badge>;
        }
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">NO CLAIM</Badge>;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background">
                <OfficerSidebar />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading farm and claim data...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="flex min-h-screen bg-background">
                <OfficerSidebar />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-lg font-medium">Farm not found</p>
                        <p className="text-muted-foreground mb-4">The requested farm segment could not be loaded.</p>
                        <Link href="/officer/analysis">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Claim Analysis
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const areaAcres = (farm.features[0].properties.area_m2 || 0) * 0.000247105;
    const areaM2 = farm.features[0].properties.area_m2 || 0;

    // Parse polygon coordinates for Google Map
    const polygonCoords = farm.features[0].geometry.coordinates[0].map((c: number[]) => ({
        lat: c[1],
        lng: c[0]
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <OfficerSidebar />

            <main className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/officer/analysis">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <BrainCircuit className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground font-display">AI Yield Prediction</h1>
                            <p className="text-muted-foreground">PMFBY-based crop yield prediction with satellite data</p>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg"
                        disabled={predicting}
                        onClick={handlePredict}
                    >
                        {predicting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Predicting...
                            </>
                        ) : (
                            <>
                                <BrainCircuit className="w-4 h-4 mr-2" />
                                Run AI Prediction
                            </>
                        )}
                    </Button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Claim Info */}
                    <Card className="shadow-card border-none h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Claim Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {claim ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <User className="w-8 h-8 text-primary" />
                                        <div>
                                            <p className="font-semibold">{claim.farmerName}</p>
                                            <p className="text-xs text-muted-foreground">Farmer ID: {claim.farmerId}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase">Village</label>
                                            <p className="font-medium">{claim.village}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase">District</label>
                                            <p className="font-medium">{claim.district}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase">Crop Type</label>
                                            <p className="font-medium">{claim.cropType}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase">Survey No</label>
                                            <p className="font-medium">{claim.surveyNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase">Loss Type</label>
                                            <p className="font-medium">{claim.lossType}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase">Claim Status</label>
                                        <div className="mt-1">
                                            <Badge variant={claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                {claim.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {claim.description && (
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase">Description</label>
                                            <p className="text-sm text-muted-foreground mt-1">{claim.description}</p>
                                        </div>
                                    )}

                                    {/* Documents Section */}
                                    {(claim.document712Url || (claim.documents && claim.documents.length > 0)) && (
                                        <>
                                            <Separator />
                                            <div className="space-y-3">
                                                <label className="text-xs text-muted-foreground uppercase font-semibold">Uploaded Documents</label>

                                                {/* 7/12 Document */}
                                                {claim.document712Url && (
                                                    <div className="p-3 bg-muted/50 rounded-lg">
                                                        <p className="text-xs text-muted-foreground mb-2">7/12 Document</p>
                                                        <a
                                                            href={claim.document712Url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block"
                                                        >
                                                            <div className="flex items-center gap-2 p-2 bg-background rounded border border-border hover:border-primary transition-colors">
                                                                <FileText className="w-5 h-5 text-primary" />
                                                                <span className="text-sm font-medium">View 7/12 Extract</span>
                                                            </div>
                                                        </a>
                                                    </div>
                                                )}

                                                {/* Geotagged Proof Photos */}
                                                {claim.documents && claim.documents.length > 0 && (
                                                    <div className="p-3 bg-muted/50 rounded-lg">
                                                        <p className="text-xs text-muted-foreground mb-2">Geotagged Photos ({claim.documents.length})</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {claim.documents.map((docUrl, index) => (
                                                                <a
                                                                    key={index}
                                                                    href={docUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block"
                                                                >
                                                                    <div className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                                                                        <img
                                                                            src={docUrl}
                                                                            alt={`Proof ${index + 1}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No claim linked to this farm</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Middle Column: Farm Visual */}
                    <Card className="shadow-card border-none h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Segmented Farm Visual
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Farm Map Visual */}
                            <div id="farm-map-container" className="aspect-square w-full rounded-lg overflow-hidden border border-border/50 bg-muted/10 relative">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={center}
                                        zoom={17}
                                        options={{
                                            mapTypeId: 'hybrid',
                                            fullscreenControl: true,
                                            mapTypeControl: false,
                                            streetViewControl: false,
                                        }}
                                    >
                                        <Polygon
                                            paths={polygonCoords}
                                            options={{
                                                fillColor: farm.color,
                                                fillOpacity: 0.4,
                                                strokeColor: farm.color,
                                                strokeOpacity: 1,
                                                strokeWeight: 2,
                                            }}
                                        />
                                        <Marker position={center} />
                                    </GoogleMap>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Coordinates Display */}
                            <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                                <div className="p-2 bg-background rounded-md border border-border">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Coordinates</p>
                                    <div className="flex gap-4 mt-1 font-mono text-sm">
                                        <span>
                                            <span className="text-xs text-muted-foreground mr-1">Lat:</span>
                                            {center.lat.toFixed(6)}°
                                        </span>
                                        <span>
                                            <span className="text-xs text-muted-foreground mr-1">Lng:</span>
                                            {center.lng.toFixed(6)}°
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Farm Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-muted/50 rounded-lg text-center">
                                    <Ruler className="w-5 h-5 mx-auto mb-1 text-primary" />
                                    <p className="text-xl font-bold">{areaM2.toFixed(0)}</p>
                                    <p className="text-xs text-muted-foreground">sq meters</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg text-center">
                                    <Leaf className="w-5 h-5 mx-auto mb-1 text-green-500" />
                                    <p className="text-xl font-bold">{areaAcres.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">acres</p>
                                </div>
                            </div>

                            {/* Farm Details */}
                            <div className="space-y-2 pt-2 border-t border-border/50">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Farm ID</span>
                                    <span className="text-sm font-mono truncate max-w-[150px]">{farm.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Farmer</span>
                                    <span className="text-sm font-medium">{farm.farmerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Crop</span>
                                    <span className="text-sm font-medium">{farm.cropType || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Village</span>
                                    <span className="text-sm font-medium">{farm.village}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Prediction Results */}
                    <Card className="shadow-card border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-primary" />
                                Prediction Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!result && !error && !predicting && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-medium">Click "Run AI Prediction" to analyze</p>
                                    <p className="text-sm">AI will analyze satellite data and predict crop yield</p>
                                </div>
                            )}

                            {predicting && (
                                <div className="text-center py-12">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                                    <p className="font-medium">Analyzing satellite data...</p>
                                    <p className="text-sm text-muted-foreground">Fetching NDVI, NDWI, and weather data</p>
                                </div>
                            )}

                            {error && (
                                <div className="text-center py-8 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                    <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                                    <p className="font-medium text-red-700 dark:text-red-400">Prediction Failed</p>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">{error}</p>
                                </div>
                            )}

                            {result && (
                                <ScrollArea className="h-[500px] pr-4">
                                    <div className="space-y-4">
                                        {/* Yield Prediction */}
                                        <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                                            <Wheat className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                                            <p className="text-3xl font-bold">{result.predictedYield.toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground">kg/ha predicted yield</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                ± {result.uncertainty.toLocaleString()} uncertainty
                                            </p>
                                        </div>

                                        {/* Claim Assessment */}
                                        <div className={`p-4 rounded-lg border ${result.claimTriggered ? 'border-red-500/50 bg-red-50 dark:bg-red-950/20' : 'border-green-500/50 bg-green-50 dark:bg-green-950/20'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">PMFBY Assessment</span>
                                                {getClaimBadge(result.claimTriggered)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Threshold:</span>
                                                    <span className="ml-1 font-medium">{result.threshold} kg/ha</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Loss:</span>
                                                    <span className={`ml-1 font-medium ${result.lossPercentage >= 33 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {result.lossPercentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Health Score */}
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium flex items-center gap-2">
                                                    <Sun className="w-4 h-4 text-yellow-500" />
                                                    Crop Health
                                                </span>
                                                <span className={`font-bold ${getHealthColor(result.healthStatus)}`}>
                                                    {result.healthStatus}
                                                </span>
                                            </div>
                                            <Progress value={result.healthScore} className="h-2" />
                                            <p className="text-xs text-muted-foreground mt-1">{result.healthScore}/100</p>
                                        </div>

                                        {/* Satellite Indices */}
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="font-medium mb-3 flex items-center gap-2">
                                                <Leaf className="w-4 h-4 text-green-500" />
                                                Satellite Indices
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">NDVI</span>
                                                    <span className="font-medium text-green-500">{result.ndvi.toFixed(3)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">NDWI</span>
                                                    <span className="font-medium text-blue-500">{result.ndwi.toFixed(3)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">EVI</span>
                                                    <span className="font-medium text-emerald-500">{result.evi.toFixed(3)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weather */}
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="font-medium mb-3 flex items-center gap-2">
                                                <CloudRain className="w-4 h-4 text-sky-500" />
                                                Weather Data
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Rainfall:</span>
                                                    <span className="ml-1 font-medium">{result.weather.rainTotal} mm</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">GDD:</span>
                                                    <span className="ml-1 font-medium">{result.weather.gdd}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Heat Stress:</span>
                                                    <span className="ml-1 font-medium">{result.weather.heatStress}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">VPD:</span>
                                                    <span className="ml-1 font-medium">{result.weather.vpd.toFixed(2)} kPa</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Officer Verification Section */}
                                        <Separator className="my-4" />
                                        <div className="space-y-4">
                                            {/* Verification Checkbox */}
                                            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                                                <Checkbox
                                                    id="verified"
                                                    checked={verified}
                                                    onCheckedChange={(checked) => setVerified(checked as boolean)}
                                                    className="h-5 w-5"
                                                />
                                                <div className="flex-1">
                                                    <Label htmlFor="verified" className="font-medium cursor-pointer flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                                        Verified by Officer
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        I confirm the prediction data has been reviewed and is accurate
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Generate Report Button */}
                                            <Button
                                                size="lg"
                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!verified || generatingReport}
                                                onClick={async () => {
                                                    setGeneratingReport(true);
                                                    try {
                                                        await generatePDFReport(
                                                            {
                                                                claim: claim,
                                                                farm: farm,
                                                                prediction: result,
                                                                coordinates: center,
                                                                verifiedAt: new Date().toISOString(),
                                                                verifiedBy: 'Agricultural Officer'
                                                            },
                                                            'farm-map-container'
                                                        );
                                                    } catch (error) {
                                                        console.error('Error generating report:', error);
                                                    }
                                                    setGeneratingReport(false);
                                                }}
                                            >
                                                {generatingReport ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Generating Report...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileDown className="w-4 h-4 mr-2" />
                                                        Generate Report
                                                    </>
                                                )}
                                            </Button>

                                            {!verified && (
                                                <p className="text-xs text-center text-muted-foreground">
                                                    ⚠️ Please verify the prediction before generating report
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
