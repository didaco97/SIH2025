"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Scan, CheckCircle2, AlertCircle } from "lucide-react";
import { OfficerSidebar } from "@/components/officer/OfficerSidebar";

import * as pdfjsLib from "pdfjs-dist";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function OCRLab() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [structuredData, setStructuredData] = useState<any>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [rawText, setRawText] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (uploadedFiles: File[]) => {
        const file = uploadedFiles[0];
        if (file && !file.type.startsWith("image/") && file.type !== "application/pdf") {
            setError("Unsupported file type. Please upload an image (JPG, PNG) or PDF.");
            setFiles([]);
            setExtractedData(null);
            setStructuredData(null);
            setAiError(null);
            setRawText("");
            return;
        }

        setError(null);
        setFiles(uploadedFiles);
        setExtractedData(null);
        setStructuredData(null);
        setAiError(null);
        setRawText("");
    };

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
        const clean = (str: string) => str?.replace(/[:\-\.]/g, '').trim() || "Not Found";
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
            area: areaMatch?.[1] ? `${convertMarathiNum(areaMatch[1])} Hectare` : "Not Found",
            cultivableArea: "0.00 Hectare",
            coordinates: "Not Found",
            latitude: "",
            longitude: "",
        };
    };

    const handleExtract = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setError(null);
        setAiError(null);

        try {
            let images: string[] = [];
            if (files[0].type === "application/pdf") {
                images = await convertPdfToImages(files[0]);
            } else {
                const imageUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(files[0]);
                });
                images = [imageUrl];
            }

            let allText = "";
            let foundStructuredData = null;

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

                if (images.length > 1) {
                    allText += `\n--- Page ${i + 1} ---\n${data.text}`;
                } else {
                    allText += data.text;
                }

                if (data.geminiError) {
                    setAiError(data.geminiError);
                }

                if (data.structuredData) {
                    if (!foundStructuredData || i === 0) {
                        const sd = data.structuredData;
                        foundStructuredData = sd;
                        setStructuredData(sd);

                        setExtractedData({
                            surveyNumber: sd.surveyNumber || "Not Found",
                            ownerName: sd.ownerName || "Not Found",
                            village: sd.village || "Not Found",
                            taluka: sd.taluka || "Not Found",
                            district: sd.district || "Not Found",
                            area: sd.area || "Not Found",
                            cultivableArea: sd.cultivableArea || "Not Found",
                            coordinates: sd.coordinates || "Not Found",
                            latitude: "",
                            longitude: "",
                        });
                    }
                }
            }

            setRawText(allText);

            setExtractedData((prev: any) => {
                if (prev) return prev;
                return parse712Data(allText);
            });

        } catch (error: any) {
            console.error("OCR Error:", error);
            setError(error.message || "Failed to process document. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <OfficerSidebar />
            <main className="flex-1 p-6 overflow-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground font-display mb-2">OCR Lab</h1>
                    <p className="text-muted-foreground">AI-Powered 7/12 Extraction Pipeline</p>
                </div>

                <div className="space-y-6 max-w-[1600px] mx-auto">
                    {/* 1. Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                1. Upload Document
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="flex-1 w-full">
                                    <div className="w-full border border-dashed bg-muted/30 border-border rounded-lg overflow-hidden min-h-[150px]">
                                        <FileUpload onChange={handleFileUpload} />
                                    </div>
                                    {error && <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>}
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <Button onClick={handleExtract} disabled={files.length === 0 || isProcessing} size="lg" className="h-[150px] w-full sm:w-[200px] gap-2 flex-col">
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                                <span>Analyzing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Scan className="w-8 h-8" />
                                                <span>Start Analysis</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pipeline View */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* 2. Raw Extraction */}
                        <Card className="h-full flex flex-col">
                            <CardHeader className="bg-muted/20 border-b border-border">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                                    Context Extraction (Google Vision)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0">
                                {rawText ? (
                                    <div className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap h-[500px] overflow-auto bg-[#1e1e1e] text-green-400">
                                        {rawText}
                                    </div>
                                ) : (
                                    <div className="h-[500px] flex items-center justify-center text-muted-foreground text-sm p-8 text-center bg-muted/10">
                                        Raw text extracted from the image will appear here.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. AI Processing */}
                        <Card className="h-full flex flex-col">
                            <CardHeader className="bg-muted/20 border-b border-border">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                                    AI Processing (Gemini 1.5 Flash)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0">
                                {aiError ? (
                                    <div className="h-[500px] flex flex-col items-center justify-center text-red-400 text-sm p-8 text-center bg-[#1e1e1e] border-l-4 border-red-500">
                                        <AlertCircle className="w-8 h-8 mb-2" />
                                        <p className="font-bold mb-2">AI Extraction Failed</p>
                                        <p className="font-mono text-xs whitespace-pre-wrap max-w-full overflow-hidden">{aiError}</p>
                                    </div>
                                ) : structuredData ? (
                                    <div className="p-4 text-xs font-mono text-blue-400 whitespace-pre-wrap h-[500px] overflow-auto bg-[#1e1e1e]">
                                        {JSON.stringify(structuredData, null, 2)}
                                    </div>
                                ) : (
                                    <div className="h-[500px] flex items-center justify-center text-muted-foreground text-sm p-8 text-center bg-muted/10">
                                        AI's reasoning and JSON structure will appear here.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 4. Final Output */}
                        <Card className="h-full flex flex-col border-primary/20 shadow-lg shadow-primary/5">
                            <CardHeader className="bg-primary/5 border-b border-primary/10">
                                <CardTitle className="text-base flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Final Standardized Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-6 overflow-auto h-[500px]">
                                {extractedData ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Survey No (भूमापन क्र.)</p>
                                                <p className="text-lg font-medium text-foreground">{extractedData.surveyNumber}</p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Farm Coordinates</p>
                                                <p className="text-sm font-medium text-foreground">{extractedData.coordinates}</p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Owner Name (खातेदार)</p>
                                                <p className="text-lg font-medium text-foreground">{extractedData.ownerName}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Village</p>
                                                    <p className="text-sm font-medium text-foreground truncate">{extractedData.village}</p>
                                                </div>
                                                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Taluka</p>
                                                    <p className="text-sm font-medium text-foreground truncate">{extractedData.taluka}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Area</p>
                                                <p className="text-lg font-medium text-foreground">{extractedData.area}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                                        <Scan className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Standardized output will appear here.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
