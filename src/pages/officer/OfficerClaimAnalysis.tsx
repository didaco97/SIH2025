"use client";

import { OfficerSidebar } from "@/components/officer/OfficerSidebar";
import { Bell, User, Loader2, MapPin, Ruler, List, Trash2, Eye, FileText, Clock, CheckCircle, XCircle, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleMap, useJsApiLoader, Polygon, InfoWindow, Marker } from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ClaimData, ClaimStatus, SegmentedFarmData, GeoJsonFeature, saveSegmentedFarm, getSegmentedFarms, deleteSegmentedFarm } from "@/lib/firestore";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClaims } from "@/hooks/useClaims";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = "http://localhost:8001";
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

// Using SegmentedFarmData and GeoJsonFeature from @/lib/firestore

export default function OfficerClaimAnalysis() {
    const router = useRouter();
    const { user } = useAuth();
    const [segmentedFarms, setSegmentedFarms] = useState<SegmentedFarmData[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    // Use shared claims hook for realtime sync with /officer/claims
    const { claims: recentClaims, loading: claimsLoading } = useClaims({ limitCount: 50, realtime: true });

    // Selected claim state
    const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
    const selectedClaim = recentClaims.find(c => c.id === selectedClaimId);

    // Hover state
    const [hoveredFarm, setHoveredFarm] = useState<SegmentedFarmData | null>(null);
    const [hoverPosition, setHoverPosition] = useState<{ lat: number; lng: number } | null>(null);

    // Marker for selected claim location
    const [claimMarker, setClaimMarker] = useState<{ lat: number; lng: number } | null>(null);

    // Yield Analysis State
    const [yieldLoading, setYieldLoading] = useState(false);

    const handleYieldAnalysis = () => {
        if (!selectedFarmId) return;
        const farm = getSelectedFarm();
        if (!farm) return;

        // Navigate to yield predict page with farm and claim IDs
        const params = new URLSearchParams();
        params.set('farmId', selectedFarmId);
        if (farm.claimId) {
            params.set('claimId', farm.claimId);
        }

        router.push(`/officer/yield-predict?${params.toString()}`);
    };

    // Handle claim click - use coordinates or geocode
    const handleClaimClick = useCallback(async (claim: ClaimData) => {
        setSelectedClaimId(claim.id || null);

        if (!mapInstance) return;

        // Use actual farm coordinates if available
        if (claim.latitude && claim.longitude) {
            const location = { lat: claim.latitude, lng: claim.longitude };
            setClaimMarker(location); // Set marker
            mapInstance.panTo(location);
            mapInstance.setZoom(18); // Higher zoom for precise coordinates
            toast.success(`Viewing ${claim.farmerName}'s farm at exact coordinates`);
            return;
        }

        // Clear marker for geocoded locations
        setClaimMarker(null);

        // Fallback: Use village and district to geocode
        const address = `${claim.village}, ${claim.district}, Maharashtra, India`;

        try {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    mapInstance.panTo(location);
                    mapInstance.setZoom(15);
                    toast.info(`Showing approximate location for ${claim.village}`);
                } else {
                    toast.warning(`Could not locate ${claim.village}`);
                }
            });
        } catch (error) {
            console.error("Geocoding failed", error);
        }
    }, [mapInstance]);

    // Load segmented farms from Firestore on mount
    useEffect(() => {
        const loadFarms = async () => {
            try {
                const farms = await getSegmentedFarms();
                setSegmentedFarms(farms);
            } catch (e) {
                console.error("Failed to load farms from Firestore", e);
            }
        };
        loadFarms();
    }, []);

    // Refresh farms after adding new one
    const refreshFarms = async () => {
        try {
            const farms = await getSegmentedFarms();
            setSegmentedFarms(farms);
        } catch (e) {
            console.error("Failed to refresh farms", e);
        }
    };

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        if (!user?.uid) {
            toast.error("Please log in to segment farms");
            return;
        }

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/segment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lng }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to segment");
            }

            const data = await response.json();

            if (!data.features || data.features.length === 0) {
                toast.error("No farm detected at this location");
                return;
            }

            // Generate a random color for the new polygon
            const colors = ["#4ade80", "#facc15", "#60a5fa", "#f87171", "#c084fc", "#fb923c"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // Calculate area from features
            const areaM2 = data.features[0]?.properties?.area_m2 || 0;

            // Generate random farm number as fallback
            const randomFarmNo = `FARM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

            // Pick a random claim from recent claims list
            // This ensures different farmers for each segmented farm
            const randomIndex = Math.floor(Math.random() * recentClaims.length);
            const randomClaim = recentClaims.length > 0 ? recentClaims[randomIndex] : null;

            // Use selected claim if explicitly selected, otherwise use random claim
            const claimToUse = selectedClaim || randomClaim;

            console.log(`Segmenting farm: Using ${claimToUse?.farmerName || 'standalone'} (index ${randomIndex})`);

            // Save to Firestore - linked to claim if available
            const farmData: Omit<SegmentedFarmData, 'id' | 'createdAt'> = {
                claimId: claimToUse?.id || '',
                farmerId: claimToUse?.farmerId || randomFarmNo,
                farmerName: claimToUse?.farmerName || `Farm ${randomFarmNo}`,
                village: claimToUse?.village || 'Unknown',
                district: claimToUse?.district || '',
                surveyNo: claimToUse?.surveyNumber || '',
                cropType: claimToUse?.cropType || '',
                color: randomColor,
                features: data.features,
                areaM2: areaM2,
                createdBy: user.uid,
            };

            const newId = await saveSegmentedFarm(farmData);

            // Refresh farms list
            await refreshFarms();
            setSelectedFarmId(newId);

            if (claimToUse) {
                toast.success(`Farm segmented for ${claimToUse.farmerName}!`);
            } else {
                toast.success(`Standalone farm ${randomFarmNo} segmented!`);
            }

        } catch (error: any) {
            console.error("Segmentation error:", error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedClaim, recentClaims, user, refreshFarms]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMapInstance(map);
        map.setMapTypeId("hybrid");
    }, []);

    const deleteFarm = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await deleteSegmentedFarm(id);
            setSegmentedFarms(prev => prev.filter(farm => farm.id !== id));
            setHoveredFarm(null); // Clear hover if deleted
            if (selectedFarmId === id) {
                setSelectedFarmId(null);
            }
            toast.success("Farm segment removed");
        } catch (error) {
            console.error("Failed to delete farm", error);
            toast.error("Failed to delete farm segment");
        }
    };

    const getSelectedFarm = () => segmentedFarms.find(f => f.id === selectedFarmId);

    // Render SVG for the selected farm details
    const renderPolygonSvg = (farm: SegmentedFarmData) => {
        if (!farm.features?.[0]?.geometry?.coordinates) return null;

        const coords = farm.features[0].geometry.coordinates[0];
        const lons = coords.map((c: number[]) => c[0]);
        const lats = coords.map((c: number[]) => c[1]);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const lonSpan = maxLon - minLon;
        const latSpan = maxLat - minLat;
        const maxSpan = Math.max(lonSpan, latSpan) || 1;

        const xOffset = (100 - (lonSpan / maxSpan) * 100) / 2;
        const yOffset = (100 - (latSpan / maxSpan) * 100) / 2;

        const points = coords
            .map((c: number[]) => {
                const x = xOffset + ((c[0] - minLon) / maxSpan) * 100;
                const y = yOffset + ((maxLat - c[1]) / maxSpan) * 100;
                return `${x},${y}`;
            })
            .join(" ");

        return <polygon points={points} fill={farm.color} fillOpacity={0.6} stroke="#fff" strokeWidth="1" />;
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed left-0 top-0 z-40">
                <OfficerSidebar />
            </div>

            <main className="ml-64 p-6 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground font-display">Claim Analysis</h1>
                        <p className="text-muted-foreground mt-1">Multi-farm segmentation and analysis</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select defaultValue="2023">
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="bg-secondary">
                            <User className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">

                    {/* Left: Claims List (top) & Segmented Farms (bottom) */}
                    <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                        {/* Recent Claims Card */}
                        <Card className="flex flex-col overflow-hidden shadow-card border-none bg-card h-[30%] shrink-0">
                            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Recent Claims ({recentClaims.length})
                                </h2>
                                <Link href="/officer/claims">
                                    <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                                </Link>
                            </div>
                            <ScrollArea className="flex-1 p-3">
                                {claimsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : recentClaims.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No claims found
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {recentClaims.map(claim => {
                                            const statusIcon = claim.status === 'approved' ? (
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            ) : claim.status === 'rejected' ? (
                                                <XCircle className="w-3 h-3 text-red-500" />
                                            ) : (
                                                <Clock className="w-3 h-3 text-yellow-500" />
                                            );
                                            return (
                                                <div
                                                    key={claim.id}
                                                    onClick={() => handleClaimClick(claim)}
                                                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${selectedClaimId === claim.id
                                                        ? "bg-primary/10 border-primary"
                                                        : "border-border bg-background hover:bg-muted/50"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-xs truncate max-w-[60%]">{claim.farmerName}</span>
                                                        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0">
                                                            {statusIcon}
                                                            {claim.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                                        <span>{claim.lossType}</span>
                                                        <span>{claim.area} {claim.areaUnit}</span>
                                                    </div>
                                                    {/* Document Links */}
                                                    {(claim.document712Url || (claim.documents && claim.documents.length > 0)) && (
                                                        <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                                                            {claim.document712Url && (
                                                                <a
                                                                    href={claim.document712Url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                    7/12 Doc
                                                                </a>
                                                            )}
                                                            {claim.documents && claim.documents.length > 0 && (
                                                                <a
                                                                    href={claim.documents[0]}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                                                                >
                                                                    <Image className="w-3 h-3" />
                                                                    Proof ({claim.documents.length})
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </Card>

                        {/* Segmented Farms Card */}
                        <Card className="flex-1 flex flex-col overflow-hidden shadow-card border-none bg-card min-h-0">
                            <div className="p-4 border-b border-border bg-muted/30">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <List className="w-4 h-4" /> Segmented Farms ({segmentedFarms.length})
                                </h2>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-3">
                                    {segmentedFarms.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground text-sm">
                                            No farms segmented yet. Click on the map to start.
                                        </div>
                                    ) : (
                                        segmentedFarms.map(farm => (
                                            <div
                                                key={farm.id}
                                                onClick={() => setSelectedFarmId(farm.id || null)}
                                                className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${selectedFarmId === farm.id
                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                    : "bg-background border-border"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: farm.color }} />
                                                        <span className="font-medium text-sm">{farm.farmerName}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                        onClick={(e) => deleteFarm(e, farm.id!)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{farm.id}</span>
                                                    <span>
                                                        {(farm.features[0].properties.area_m2! * 0.000247105).toFixed(2)} ac
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>
                    </div>

                    {/* Middle: Map (2cols) */}
                    <div className="lg:col-span-2 flex flex-col gap-4 h-[calc(100vh-140px)]">
                        {/* Map Area */}
                        <div className="flex-1 bg-card rounded-2xl shadow-card overflow-hidden border border-border relative">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={DEFAULT_CENTER}
                                    zoom={16}
                                    onLoad={onMapLoad}
                                    onClick={handleMapClick}
                                    options={{
                                        mapTypeId: "hybrid",
                                        draggableCursor: "crosshair",
                                        clickableIcons: false,
                                        mapTypeControl: false,
                                        streetViewControl: false,
                                        fullscreenControl: true,
                                        zoomControl: true,
                                    }}
                                >
                                    {segmentedFarms.map(farm => {
                                        const coords = farm.features[0].geometry.coordinates[0].map((c: number[]) => ({ lat: c[1], lng: c[0] }));
                                        return (
                                            <Polygon
                                                key={farm.id}
                                                paths={coords}
                                                options={{
                                                    strokeColor: selectedFarmId === farm.id ? "#ffffff" : farm.color,
                                                    strokeOpacity: 1,
                                                    strokeWeight: selectedFarmId === farm.id ? 3 : 2,
                                                    fillColor: farm.color,
                                                    fillOpacity: selectedFarmId === farm.id ? 0.6 : 0.4,
                                                    zIndex: selectedFarmId === farm.id ? 10 : 1
                                                }}
                                                onClick={() => setSelectedFarmId(farm.id || null)}
                                                onMouseOver={(e: google.maps.MapMouseEvent) => {
                                                    if (e.latLng) {
                                                        setHoveredFarm(farm);
                                                        setHoverPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                                                    }
                                                }}
                                                onMouseOut={() => {
                                                    setHoveredFarm(null);
                                                    setHoverPosition(null);
                                                }}
                                            />
                                        );
                                    })}

                                    {hoveredFarm && hoverPosition && (
                                        <InfoWindow
                                            position={hoverPosition}
                                            onCloseClick={() => setHoveredFarm(null)}
                                            options={{ disableAutoPan: true }}
                                        >
                                            <div className="p-2 min-w-[200px] bg-white text-black rounded-lg shadow-sm">
                                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: hoveredFarm.color }}></div>
                                                    <h3 className="font-bold text-sm text-black">{hoveredFarm.farmerName}</h3>
                                                </div>
                                                <div className="space-y-1 text-xs text-slate-700">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-slate-500">Crop:</span>
                                                        <span>{hoveredFarm.cropType}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                                                        <span className="font-semibold text-slate-500">Area:</span>
                                                        <span className="font-bold text-black">
                                                            {(hoveredFarm.features[0].properties.area_m2! * 0.000247105).toFixed(2)} ac
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </InfoWindow>
                                    )}

                                    {/* Marker for selected claim location */}
                                    {claimMarker && (
                                        <Marker
                                            position={claimMarker}
                                            title={selectedClaim?.farmerName || "Farm Location"}
                                            icon={{
                                                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                                scaledSize: new google.maps.Size(40, 40),
                                            }}
                                        />
                                    )}
                                </GoogleMap>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            )}

                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 transition-all">
                                    <div className="bg-card rounded-lg p-6 flex items-center gap-4 shadow-xl">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        <span className="text-foreground font-medium">Segmenting Farm Area...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Animated Yield Prediction Button Section */}
                        <div className="h-24 bg-card rounded-2xl shadow-card p-4 flex items-center justify-between border border-border relative overflow-hidden group">
                            {/* Animated Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 animate-gradient-x"></div>

                            <div className="relative z-10">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    AI Yield Analysis
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {getSelectedFarm()
                                        ? `Analysis ready for ${getSelectedFarm()?.farmerName}`
                                        : "Generate predictive insights for this season based on satellite data."}
                                </p>
                            </div>

                            <Button
                                size="lg"
                                className="relative z-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 border-0"
                                disabled={!selectedFarmId || yieldLoading}
                                onClick={handleYieldAnalysis}
                            >
                                {yieldLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">✨</span>
                                        {getSelectedFarm()
                                            ? `Predict Yield`
                                            : "Select a Farm"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right: Details (1col) */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <Card className="flex-1 shadow-card border-none bg-card overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-border bg-muted/30">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Selected Farm Details
                                </h2>
                            </div>

                            {selectedFarmId && getSelectedFarm() ? (
                                <div className="p-4 space-y-6 flex-1 overflow-auto">
                                    <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center border border-border/50">
                                        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full p-4">
                                            {renderPolygonSvg(getSelectedFarm()!)}
                                        </svg>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Farm ID</label>
                                            <p className="text-lg font-mono text-foreground">{getSelectedFarm()?.id}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Area (m²)</label>
                                                <p className="text-xl font-bold text-primary">
                                                    {getSelectedFarm()?.features[0].properties.area_m2?.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Area (Acres)</label>
                                                <p className="text-xl font-bold text-primary">
                                                    {(getSelectedFarm()!.features[0].properties.area_m2! * 0.000247105).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-border/50">
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Farmer</label>
                                                <p className="text-sm font-medium">{getSelectedFarm()?.farmerName}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Crop</label>
                                                <p className="text-sm font-medium">{getSelectedFarm()?.cropType}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Village</label>
                                                <p className="text-sm font-medium">{getSelectedFarm()?.village}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Survey No</label>
                                                <p className="text-sm font-medium">{getSelectedFarm()?.surveyNo}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-sm font-medium">Verified Segment</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Coordinates</label>
                                            <ScrollArea className="h-32 w-full rounded-md border border-border bg-muted/50 p-2 mt-1">
                                                <pre className="text-[10px] text-muted-foreground">
                                                    {JSON.stringify(getSelectedFarm()?.features[0].geometry.coordinates, null, 2)}
                                                </pre>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                    <MapPin className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Select a farm segment from the list or map to view details</p>
                                </div>
                            )}
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}
