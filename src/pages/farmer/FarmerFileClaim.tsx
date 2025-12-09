"use client";

import { FarmerSidebar } from "@/components/farmer/FarmerSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Send, Loader2, Scan, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/ui/file-upload";
import { IconX } from "@tabler/icons-react";
import { createClaim, LossType, CropStage } from "@/lib/firestore";
import { uploadDocument } from "@/lib/storage";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function FarmerFileClaim() {
    const { t } = useLanguage();
    const { user, userProfile, isConfigured } = useAuth();
    const router = useRouter();
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // OCR State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ocrError, setOcrError] = useState<string | null>(null);
    const [ocrFile, setOcrFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        farmerId: "",
        farmerName: "",
        otherNames: "",
        village: "",
        district: "",
        surveyNo: "",
        farmCoordinates: "",      // Format: "lat, lng"
        cropType: "",
        area: "",
        policyNumber: "",
        lossDate: "",
        lossType: "" as LossType | "",
        cropStage: "" as CropStage | "",
        harvestDate: "",
        description: "",
    });
    const [proofFiles, setProofFiles] = useState<File[]>([]);
    const [document712, setDocument712] = useState<File | null>(null);
    const [isExtractingCoords, setIsExtractingCoords] = useState(false);

    // Sync OCR file to Document 7/12 state
    useEffect(() => {
        if (ocrFile) {
            setDocument712(ocrFile);
        }
    }, [ocrFile]);

    const convertPdfToImages = async (file: File): Promise<string[]> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const images: string[] = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) throw new Error("Could not get canvas context");

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvas
            } as any).promise;

            images.push(canvas.toDataURL("image/png"));
        }
        return images;
    };

    const parse712Data = (text: string) => {
        const clean = (str: string) => str?.replace(/[:\-\.]/g, '').trim() || "";
        const convertMarathiNum = (str: string) => {
            if (!str) return str;
            const marathiNums: { [key: string]: string } = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
            return str.replace(/[०-९]/g, m => marathiNums[m] || m);
        };

        const villageMatch = text.match(/गाव\s*[:\-]+\s*(?!नमुना)([^\s\n]+)/) || text.match(/Village\s*[:\-]+\s*([^\s\n]+)/i);
        const talukaMatch = text.match(/तालुका\s*[:\-]+\s*([^\s\n]+)/) || text.match(/Taluka\s*[:\-]+\s*([^\s\n]+)/i);
        const districtMatch = text.match(/जिल्हा\s*[:\-]+\s*([^\s\n]+)/) || text.match(/District\s*[:\-]+\s*([^\s\n]+)/i);
        const surveyMatch = text.match(/भूमापन\s*क्रमांक\s*[:\-\s]*([\d\w\/]+)/) || text.match(/गट\s*क्रमांक\s*[:\-\s]*([\d\w\/]+)/) || text.match(/Survey\s*No\.?\s*[:\-\s]*([\d\w\/]+)/i);
        const ownerMatch = text.match(/खातेदारांची\s*नावे\s*[:\-]*\s*([^\n]+)/) || text.match(/खातेदार\s*[:\-]*\s*([^\n]+)/) || text.match(/Name\s*[:\-]*\s*([^\n]+)/i);
        const areaMatch = text.match(/एकूण\s*[:\-\s]*([\d\.१२३४५६७८९०]+)/) || text.match(/क्षेत्र\s*[:\-\s]*([\d\.१२३४५६७८९०]+)/) || text.match(/Area\s*[:\-\s]*([\d\.]+)/i);

        return {
            surveyNumber: clean(surveyMatch?.[1] || ""),
            ownerName: clean(ownerMatch?.[1] || ""),
            village: clean(villageMatch?.[1] || ""),
            taluka: clean(talukaMatch?.[1] || ""),
            district: clean(districtMatch?.[1] || ""),
            area: areaMatch?.[1] ? convertMarathiNum(areaMatch[1]) : "",
            coordinates: "Not Found",
        };
    };

    const handleAnalyze = async () => {
        if (!ocrFile) return;

        setIsAnalyzing(true);
        setOcrError(null);
        setAnalysisResult(null);

        try {
            let images: string[] = [];
            if (ocrFile.type === "application/pdf") {
                images = await convertPdfToImages(ocrFile);
            } else {
                const imageUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(ocrFile);
                });
                images = [imageUrl];
            }

            let allText = "";
            let foundStructuredData = null;

            // Process first page only for speed/relevance in this context, or all if needed
            // Let's do loops but break if structured data found to be efficient?
            // Actually, keep it simple: consume only first page for form filling usually enough
            // But let's mirror Lab logic and do all Pages if needed.

            for (let i = 0; i < images.length; i++) {
                const response = await fetch('/api/ocr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: images[i] })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to extract text');
                }

                const data = await response.json();
                allText += data.text;

                if (data.structuredData) {
                    if (!foundStructuredData || i === 0) {
                        foundStructuredData = data.structuredData;
                    }
                }
            }

            // Fallback to regex if no AI data
            const finalData = foundStructuredData || parse712Data(allText);
            setAnalysisResult(finalData);

            // Auto-fill form
            const cleanArea = finalData.area?.replace(/[^\d.]/g, '');

            setFormData(prev => ({
                ...prev,
                // Keep farmerName manual. Use otherNames for 7/12 data.
                otherNames: finalData.ownerName !== "Not Found" ? finalData.ownerName : prev.otherNames,
                village: finalData.village !== "Not Found" ? finalData.village : prev.village,
                district: finalData.district !== "Not Found" ? finalData.district : prev.district,
                surveyNo: finalData.surveyNumber !== "Not Found" ? finalData.surveyNumber : prev.surveyNo,
                area: cleanArea || prev.area,
                description: `${prev.description}\n\nAuto-detected from 7/12:\nSurvey No: ${finalData.surveyNumber}\nCoordinates: ${finalData.coordinates || 'Not Found'}`.trim()
            }));

            toast.success("Document analyzed & form auto-filled!");

        } catch (error: any) {
            console.error("Analysis Error:", error);
            setOcrError(error.message || "Failed to analyze document");
            toast.error("Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Debug logging
        console.log("Auth State:", { user: user?.uid, isConfigured, userProfile });

        if (!user?.uid || !isConfigured) {
            toast.error(
                <div>
                    Please <a href="/login" className="underline font-bold">log in</a> to submit a claim
                </div>
            );
            return;
        }

        if (!formData.farmerId || !formData.farmerName || !formData.lossType || !formData.cropStage || !formData.lossDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setIsSubmitting(true);

            // Upload proof files
            const documentUrls: string[] = [];
            for (const file of proofFiles) {
                const url = await uploadDocument(file, user.uid);
                documentUrls.push(url);
            }

            // Upload 7/12 document
            let doc712Url: string | undefined;
            if (document712) {
                doc712Url = await uploadDocument(document712, user.uid);
            }

            // Parse coordinates if provided
            let latitude: number | undefined;
            let longitude: number | undefined;
            if (formData.farmCoordinates) {
                const coords = formData.farmCoordinates.split(',').map(c => parseFloat(c.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    latitude = coords[0];
                    longitude = coords[1];
                }
            }

            // Create claim filed by farmer
            // Build claim data, excluding undefined values (Firestore doesn't accept undefined)
            const claimData: Record<string, any> = {
                farmerId: formData.farmerId,
                farmerName: formData.farmerName,
                userId: user.uid,
                filedBy: "farmer",
                village: formData.village,
                district: formData.district || userProfile?.district || "",
                surveyNumber: formData.surveyNo || "",
                cropType: formData.cropType || "Rice",
                area: parseFloat(formData.area) || 0,
                areaUnit: "acres",
                policyNumber: formData.policyNumber || "",
                lossType: formData.lossType as LossType,
                lossDate: Timestamp.fromDate(new Date(formData.lossDate)),
                cropStage: formData.cropStage as CropStage,
                description: formData.description || "",
                amount: 0,
                status: "pending",
                documents: documentUrls,
                document712Url: doc712Url || "",
            };

            // Add optional fields only if they have values
            if (latitude !== undefined) claimData.latitude = latitude;
            if (longitude !== undefined) claimData.longitude = longitude;
            if (formData.harvestDate) {
                claimData.harvestDate = Timestamp.fromDate(new Date(formData.harvestDate));
            }

            await createClaim(claimData as any);

            toast.success("Claim filed successfully!");
            router.push("/farmer/claims");

        } catch (error: any) {
            console.error("Error submitting claim:", error);
            toast.error(error.message || "Failed to submit claim");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <FarmerSidebar />

            <main className="flex-1 p-2 overflow-auto">


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-[1800px] items-start">

                    {/* LEFT COLUMN: AI Analysis */}
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-foreground font-display">File New Claim</h1>
                            <p className="text-xs text-muted-foreground">AI-Assisted Claim Filing Process</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border shadow-sm p-5 h-fit">
                            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                1. Upload 7/12 for Analysis
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Upload the 7/12 document extract. Our AI will analyze it to auto-fill the claim form details.
                            </p>

                            <div className="w-full border border-dashed bg-muted/30 border-border rounded-lg overflow-hidden min-h-[200px] mb-4">
                                <FileUpload
                                    onChange={(files) => {
                                        if (files?.[0]) {
                                            setOcrFile(files[0]);
                                            // Reset analysis on new file
                                            setAnalysisResult(null);
                                            setOcrError(null);
                                        }
                                    }}
                                />
                            </div>

                            {ocrError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5" />
                                    <span>{ocrError}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleAnalyze}
                                disabled={!ocrFile || isAnalyzing}
                                className="w-full gap-2"
                                size="lg"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing Document...
                                    </>
                                ) : (
                                    <>
                                        <Scan className="w-5 h-5" />
                                        Analyze & Auto-Fill
                                    </>
                                )}
                            </Button>

                            {/* Analysis Success State */}
                            {analysisResult && (
                                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Analysis Complete
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p><strong>Owner:</strong> {analysisResult.ownerName}</p>
                                        <p><strong>Village:</strong> {analysisResult.village}</p>
                                        <p><strong>Area:</strong> {analysisResult.area}</p>
                                        <p className="text-xs mt-2 text-green-600">Form fields have been auto-filled.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Proof Upload Section (Moved from Right) */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-5 h-fit">
                            <h2 className="text-lg font-semibold mb-3">Proof Upload (Geotag Photos)</h2>
                            <div className="w-full border border-dashed bg-muted/30 border-border rounded-lg overflow-hidden min-h-[120px]">
                                <FileUpload
                                    onChange={(uploadedFiles: File[]) => setProofFiles(uploadedFiles)}
                                    onPreview={setPreviewFile}
                                />
                            </div>

                            {/* Thumbnail Preview */}
                            {proofFiles.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {proofFiles.map((file, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted/20">
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => setPreviewFile(file)}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                                                {file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Extract Coordinates Button */}
                            <Button
                                onClick={async () => {
                                    if (proofFiles.length === 0) {
                                        toast.error('Please upload an image first');
                                        return;
                                    }

                                    setIsExtractingCoords(true);
                                    try {
                                        for (const file of proofFiles) {
                                            if (file.type.startsWith('image/')) {
                                                // Convert image to base64
                                                const imageData = await new Promise<string>((resolve) => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => resolve(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                });

                                                // Call OCR API
                                                const response = await fetch('/api/ocr', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ image: imageData })
                                                });

                                                if (response.ok) {
                                                    const data = await response.json();
                                                    const text = data.text || '';
                                                    console.log('OCR Text:', text);
                                                    console.log('Structured Data:', data.structuredData);

                                                    // First, try structuredData.coordinates from Gemini
                                                    if (data.structuredData?.coordinates && data.structuredData.coordinates !== 'Not Found') {
                                                        const coordStr = data.structuredData.coordinates;
                                                        // Parse coordinates from Gemini output
                                                        const coordMatch = coordStr.match(/(-?\d+\.?\d*)[°\s,]+(-?\d+\.?\d*)/);
                                                        if (coordMatch) {
                                                            const lat = parseFloat(coordMatch[1]);
                                                            const lng = parseFloat(coordMatch[2]);
                                                            if (!isNaN(lat) && !isNaN(lng)) {
                                                                const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                                                                setFormData(prev => ({ ...prev, farmCoordinates: coordsStr }));
                                                                toast.success('Coordinates extracted!', { description: coordsStr });
                                                                setIsExtractingCoords(false);
                                                                return;
                                                            }
                                                        }
                                                    }

                                                    // Fallback: Extract coordinates using regex patterns on raw text
                                                    const coordPatterns = [
                                                        // "Lat 19.54841° Long 74.188663°"
                                                        /Lat\s*(-?\d+\.?\d*)°?\s*Long\s*(-?\d+\.?\d*)°?/i,
                                                        // "19.54841°, 74.188663°" or similar
                                                        /(-?\d{1,3}\.\d{2,})\s*°?\s*[,\s]+\s*(-?\d{1,3}\.\d{2,})\s*°?/,
                                                        // "Latitude: 19.54841 Longitude: 74.188663"
                                                        /lat[itude]*\s*[:=]?\s*(-?\d+\.?\d*)\s*[°,\s]+long[itude]*\s*[:=]?\s*(-?\d+\.?\d*)/i,
                                                        // N/S E/W format
                                                        /[NS]\s*(-?\d+\.?\d*)\s*[,\s]+[EW]\s*(-?\d+\.?\d*)/i,
                                                    ];

                                                    for (const pattern of coordPatterns) {
                                                        const match = text.match(pattern);
                                                        if (match) {
                                                            console.log('Regex matched:', pattern, match);
                                                            const lat = parseFloat(match[1]);
                                                            const lng = parseFloat(match[2]);
                                                            if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                                                                const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                                                                setFormData(prev => ({ ...prev, farmCoordinates: coordsStr }));
                                                                toast.success('Coordinates extracted!', { description: coordsStr });
                                                                setIsExtractingCoords(false);
                                                                return;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        toast.error('No coordinates found in images');
                                    } catch (err) {
                                        console.error('OCR extraction failed:', err);
                                        toast.error('Failed to extract coordinates');
                                    }
                                    setIsExtractingCoords(false);
                                }}
                                disabled={proofFiles.length === 0 || isExtractingCoords}
                                className="w-full mt-3 gap-2"
                                variant="outline"
                            >
                                {isExtractingCoords ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Extracting Coordinates...
                                    </>
                                ) : (
                                    <>
                                        <Scan className="w-4 h-4" />
                                        Extract Coordinates from Image
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Claim Form */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-xl border border-border shadow-sm p-4 md:p-5 h-fit">
                            <h2 className="text-lg font-semibold mb-3">2. Claim Application Form</h2>
                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="farmer-id">Farmer ID *</Label>
                                        <Input
                                            id="farmer-id"
                                            placeholder="Enter Farmer ID"
                                            className="h-9"
                                            value={formData.farmerId}
                                            onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="other-names">Owner Names (from 7/12)</Label>
                                        <Input
                                            id="other-names"
                                            placeholder="Extracted names..."
                                            className="h-9 bg-muted/20"
                                            value={formData.otherNames}
                                            readOnly
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="farmer-name">Farmer Name (Manual Entry) *</Label>
                                        <Input
                                            id="farmer-name"
                                            placeholder="Enter Farmer Name"
                                            className="h-9"
                                            value={formData.farmerName}
                                            onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="village">Village</Label>
                                        <Input
                                            id="village"
                                            placeholder="Village (Auto-filled)"
                                            className="h-9 bg-muted/20"
                                            value={formData.village}
                                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="district">District</Label>
                                        <Input
                                            id="district"
                                            placeholder="District (Auto-filled)"
                                            className="h-9 bg-muted/20"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="survey-no">Survey / Gat No</Label>
                                        <Input
                                            id="survey-no"
                                            placeholder="Survey No (Auto-filled)"
                                            className="h-9 bg-muted/20"
                                            value={formData.surveyNo}
                                            onChange={(e) => setFormData({ ...formData, surveyNo: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="crop-type">Crop Type</Label>
                                        <Select
                                            value={formData.cropType}
                                            onValueChange={(val) => setFormData({ ...formData, cropType: val })}
                                        >
                                            <SelectTrigger id="crop-type" className="h-9">
                                                <SelectValue placeholder="Select Crop" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Rice">Rice</SelectItem>
                                                <SelectItem value="Wheat">Wheat</SelectItem>
                                                <SelectItem value="Cotton">Cotton</SelectItem>
                                                <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                                                <SelectItem value="Maize">Maize</SelectItem>
                                                <SelectItem value="Onion">Onion</SelectItem>
                                                <SelectItem value="Grape">Grape</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="area">Area (Acres)</Label>
                                        <Input
                                            id="area"
                                            type="text"
                                            placeholder="Area (Auto-filled)"
                                            className="h-9 bg-muted/20"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="policy-number">Policy Number</Label>
                                        <Select
                                            value={formData.policyNumber}
                                            onValueChange={(val) => setFormData({ ...formData, policyNumber: val })}
                                        >
                                            <SelectTrigger id="policy-number" className="h-9">
                                                <SelectValue placeholder="Select Policy" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PMFBY-2023-001">PMFBY-2023-001 (Rice)</SelectItem>
                                                <SelectItem value="PMFBY-2023-002">PMFBY-2023-002 (Wheat)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="loss-date">Date of Loss *</Label>
                                        <Input
                                            type="date"
                                            id="loss-date"
                                            className="h-9"
                                            value={formData.lossDate}
                                            onChange={(e) => setFormData({ ...formData, lossDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="loss-type">Type of Loss *</Label>
                                        <Select
                                            value={formData.lossType}
                                            onValueChange={(val) => setFormData({ ...formData, lossType: val as LossType })}
                                        >
                                            <SelectTrigger id="loss-type" className="h-9">
                                                <SelectValue placeholder="Select Loss Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="drought">Drought</SelectItem>
                                                <SelectItem value="flood">Flood / Excess Rain</SelectItem>
                                                <SelectItem value="pest">Pest Attack</SelectItem>
                                                <SelectItem value="fire">Fire</SelectItem>
                                                <SelectItem value="landslide">Landslide</SelectItem>
                                                <SelectItem value="hailstorm">Hailstorm</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="crop-stage">Crop Stage *</Label>
                                        <Select
                                            value={formData.cropStage}
                                            onValueChange={(val) => setFormData({ ...formData, cropStage: val as CropStage })}
                                        >
                                            <SelectTrigger id="crop-stage" className="h-9">
                                                <SelectValue placeholder="Select Stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sowing">Sowing / Planting</SelectItem>
                                                <SelectItem value="vegetative">Vegetative Growth</SelectItem>
                                                <SelectItem value="flowering">Flowering</SelectItem>
                                                <SelectItem value="maturity">Maturity / Harvesting</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="harvest-date">Date of Harvest (Optional)</Label>
                                        <Input
                                            type="date"
                                            id="harvest-date"
                                            className="h-9"
                                            value={formData.harvestDate}
                                            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="farm-coordinates">Farm Coordinates</Label>
                                        <Input
                                            id="farm-coordinates"
                                            placeholder="e.g. 19.0760, 72.8777"
                                            className="h-9"
                                            value={formData.farmCoordinates}
                                            onChange={(e) => setFormData({ ...formData, farmCoordinates: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <Label htmlFor="description">Description of Loss</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe how the damage occurred... (Auto-filled with additional data)"
                                        className="min-h-[100px] resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>



                                <div className="pt-4 flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        size="sm"
                                        onClick={() => router.push("/farmer/claims")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="gap-2"
                                        size="sm"
                                        disabled={isSubmitting || !isConfigured}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Submit Claim
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {previewFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors z-10"
                            >
                                <IconX className="w-5 h-5" />
                            </button>
                            <div className="p-2 h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
                                {previewFile.type.startsWith("image/") ? (
                                    <img
                                        src={URL.createObjectURL(previewFile)}
                                        alt="Preview"
                                        className="max-w-full max-h-[80vh] object-contain rounded-md"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 p-12">
                                        <FileText className="w-16 h-16 text-neutral-400" />
                                        <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                                            {previewFile.name}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            Preview not available for this file type
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
