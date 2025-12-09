/**
 * PDF Report Generator for PMFBY Yield Prediction
 * Generates a comprehensive PDF report with farm visuals, prediction data, and verification status
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { uploadReportPDF } from './storage';
import { saveReport, ReportData as FirestoreReportData } from './firestore';
import { Timestamp } from 'firebase/firestore';

interface ReportData {
    claim: {
        id?: string;
        farmerName?: string;
        farmerId?: string;
        village?: string;
        district?: string;
        cropType?: string;
        surveyNumber?: string;
        lossType?: string;
        status?: string;
        description?: string;
        document712Url?: string;
        documents?: string[];
    } | null;
    farm: {
        id?: string;
        farmerName?: string;
        village?: string;
        district?: string;
        cropType?: string;
        color?: string;
        features: Array<{
            properties: {
                area_m2?: number;
            };
            geometry: {
                coordinates: number[][][];
            };
        }>;
    } | null;
    prediction: {
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
    } | null;
    coordinates: { lat: number; lng: number };
    verifiedAt: string;
    verifiedBy: string;
}

export async function generatePDFReport(
    data: ReportData,
    mapElementId?: string,
    geotaggedPhotoUrl?: string
): Promise<void> {
    const { claim, farm, prediction, coordinates, verifiedAt, verifiedBy } = data;

    // Create PDF (A4 size)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Colors
    const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald
    const textColor: [number, number, number] = [30, 41, 59];
    const mutedColor: [number, number, number] = [100, 116, 139];
    const successColor: [number, number, number] = [34, 197, 94];
    const dangerColor: [number, number, number] = [239, 68, 68];

    // Helper function to add text
    const addText = (text: string, x: number, y: number, options?: { fontSize?: number; color?: [number, number, number]; bold?: boolean; align?: 'left' | 'center' | 'right' }) => {
        const { fontSize = 10, color = textColor, bold = false, align = 'left' } = options || {};
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...color);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');

        let xPos = x;
        if (align === 'center') xPos = pageWidth / 2;
        if (align === 'right') xPos = pageWidth - margin;

        pdf.text(text, xPos, y, { align });
        return y + (fontSize * 0.4);
    };

    // Helper to add section header
    const addSectionHeader = (title: string, y: number) => {
        pdf.setFillColor(...primaryColor);
        pdf.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 3, y + 5.5);
        return y + 12;
    };

    // Helper to add key-value row
    const addRow = (key: string, value: string, y: number, highlight = false) => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...mutedColor);
        pdf.text(key, margin + 3, y);

        pdf.setTextColor(...(highlight ? primaryColor : textColor));
        pdf.setFont('helvetica', 'bold');
        pdf.text(value, margin + 60, y);
        return y + 5;
    };

    // ===================== HEADER =====================
    // Title with green bar
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 25, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PMFBY YIELD PREDICTION REPORT', margin, 12);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 20);
    pdf.text(`Report ID: ${claim?.id || farm?.id || 'N/A'}`, pageWidth - margin, 20, { align: 'right' });

    yPos = 35;

    // ===================== VERIFICATION BADGE =====================
    const verifiedBadgeY = yPos;
    pdf.setFillColor(236, 253, 245); // Light green background
    pdf.roundedRect(margin, verifiedBadgeY, pageWidth - 2 * margin, 12, 2, 2, 'F');
    pdf.setDrawColor(...successColor);
    pdf.roundedRect(margin, verifiedBadgeY, pageWidth - 2 * margin, 12, 2, 2, 'S');

    // Checkmark icon (simple circle)
    pdf.setFillColor(...successColor);
    pdf.circle(margin + 8, verifiedBadgeY + 6, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text('✓', margin + 6.5, verifiedBadgeY + 7.5);

    pdf.setTextColor(...successColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('✓ VERIFIED BY OFFICER', margin + 15, verifiedBadgeY + 7);

    pdf.setTextColor(...mutedColor);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Verified on: ${new Date(verifiedAt).toLocaleString()}`, pageWidth - margin, verifiedBadgeY + 7, { align: 'right' });

    yPos = verifiedBadgeY + 18;

    // ===================== CLAIM INFORMATION =====================
    yPos = addSectionHeader('CLAIM INFORMATION', yPos);

    yPos = addRow('Farmer Name:', claim?.farmerName || farm?.farmerName || 'N/A', yPos);
    yPos = addRow('Farmer ID:', claim?.farmerId || 'N/A', yPos);
    yPos = addRow('Village:', claim?.village || farm?.village || 'N/A', yPos);
    yPos = addRow('District:', claim?.district || farm?.district || 'N/A', yPos);
    yPos = addRow('Crop Type:', claim?.cropType || farm?.cropType || 'N/A', yPos, true);
    yPos = addRow('Survey No:', claim?.surveyNumber || 'N/A', yPos);
    yPos = addRow('Loss Type:', claim?.lossType || 'N/A', yPos);
    yPos = addRow('Claim Status:', claim?.status?.toUpperCase() || 'PENDING', yPos);

    yPos += 5;

    // ===================== FARM DETAILS =====================
    yPos = addSectionHeader('FARM DETAILS', yPos);

    const areaM2 = farm?.features[0]?.properties?.area_m2 || 0;
    const areaAcres = (areaM2 * 0.000247105).toFixed(2);
    const areaHectares = (areaM2 * 0.0001).toFixed(2);

    yPos = addRow('Farm ID:', farm?.id || 'N/A', yPos);
    yPos = addRow('Area:', `${areaM2.toFixed(0)} sq meters (${areaAcres} acres)`, yPos, true);
    yPos = addRow('Coordinates:', `${coordinates.lat.toFixed(6)}°, ${coordinates.lng.toFixed(6)}°`, yPos);

    yPos += 5;

    // ===================== AI PREDICTION RESULTS =====================
    yPos = addSectionHeader('AI PREDICTION RESULTS', yPos);

    if (prediction) {
        // Predicted Yield (large)
        pdf.setFillColor(240, 253, 244);
        pdf.roundedRect(margin, yPos, (pageWidth - 2 * margin) / 2 - 3, 20, 2, 2, 'F');
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${prediction.predictedYield.toLocaleString()} kg/ha`, margin + 5, yPos + 12);
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedColor);
        pdf.text('Predicted Yield', margin + 5, yPos + 17);

        // Threshold
        pdf.setFillColor(254, 252, 232);
        pdf.roundedRect(margin + (pageWidth - 2 * margin) / 2 + 3, yPos, (pageWidth - 2 * margin) / 2 - 3, 20, 2, 2, 'F');
        pdf.setTextColor(202, 138, 4);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${prediction.threshold.toLocaleString()} kg/ha`, margin + (pageWidth - 2 * margin) / 2 + 8, yPos + 12);
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedColor);
        pdf.text('Threshold Yield', margin + (pageWidth - 2 * margin) / 2 + 8, yPos + 17);

        yPos += 25;

        yPos = addRow('Uncertainty:', `±${prediction.uncertainty.toLocaleString()} kg/ha`, yPos);
        yPos = addRow('Confidence Range:', `${prediction.confidenceLow.toLocaleString()} - ${prediction.confidenceHigh.toLocaleString()} kg/ha`, yPos);
        yPos = addRow('Loss Percentage:', `${prediction.lossPercentage.toFixed(1)}%`, yPos, prediction.lossPercentage >= 33);
    }

    yPos += 5;

    // ===================== PMFBY ASSESSMENT =====================
    yPos = addSectionHeader('PMFBY CLAIM ASSESSMENT', yPos);

    if (prediction) {
        // Claim Status Badge
        const claimBadgeColor = prediction.claimTriggered ? dangerColor : successColor;
        const claimBadgeBg = prediction.claimTriggered ? [254, 242, 242] : [240, 253, 244];

        pdf.setFillColor(claimBadgeBg[0], claimBadgeBg[1], claimBadgeBg[2]);
        pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 15, 2, 2, 'F');
        pdf.setDrawColor(...claimBadgeColor);
        pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 15, 2, 2, 'S');

        pdf.setTextColor(...claimBadgeColor);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(prediction.claimTriggered ? '⚠ CLAIM TRIGGERED' : '✓ NO CLAIM REQUIRED', margin + 5, yPos + 10);

        pdf.setTextColor(...mutedColor);
        pdf.setFontSize(9);
        pdf.text(`Probability: ${prediction.claimProbability.toFixed(1)}%  |  Confidence: ${prediction.decisionConfidence.toFixed(1)}%`, pageWidth - margin - 5, yPos + 10, { align: 'right' });

        yPos += 20;
    }

    // ===================== CROP HEALTH =====================
    yPos = addSectionHeader('CROP HEALTH & SATELLITE INDICES', yPos);

    if (prediction) {
        yPos = addRow('Health Status:', prediction.healthStatus, yPos, true);
        yPos = addRow('Health Score:', `${prediction.healthScore}/100`, yPos);
        yPos = addRow('NDVI (Vegetation):', prediction.ndvi.toFixed(3), yPos);
        yPos = addRow('NDWI (Water):', prediction.ndwi.toFixed(3), yPos);
        yPos = addRow('EVI (Enhanced):', prediction.evi.toFixed(3), yPos);
    }

    yPos += 5;

    // ===================== WEATHER DATA =====================
    yPos = addSectionHeader('WEATHER CONDITIONS', yPos);

    if (prediction) {
        yPos = addRow('Total Rainfall:', `${prediction.weather.rainTotal} mm`, yPos);
        yPos = addRow('Growing Degree Days:', `${prediction.weather.gdd}`, yPos);
        yPos = addRow('Heat Stress:', `${prediction.weather.heatStress}`, yPos);
        yPos = addRow('Vapor Pressure Deficit:', `${prediction.weather.vpd.toFixed(2)} kPa`, yPos);
    }

    yPos += 5;

    // ===================== STRESS ANALYSIS =====================
    if (prediction && yPos < pageHeight - 50) {
        yPos = addSectionHeader('STRESS ANALYSIS', yPos);

        yPos = addRow('Vegetative Stress:', `${(prediction.stress.vegetative * 100).toFixed(1)}%`, yPos);
        yPos = addRow('Flowering Stress:', `${(prediction.stress.flowering * 100).toFixed(1)}%`, yPos);
        yPos = addRow('Grain Fill Stress:', `${(prediction.stress.grainFill * 100).toFixed(1)}%`, yPos);
        yPos = addRow('Combined Stress:', `${(prediction.stress.combined * 100).toFixed(1)}%`, yPos);
        yPos = addRow('Yield Potential:', `${(prediction.stress.yieldPotential * 100).toFixed(1)}%`, yPos, true);
    }

    // ===================== CAPTURE MAP IF AVAILABLE =====================
    if (mapElementId) {
        const mapElement = document.getElementById(mapElementId);
        if (mapElement) {
            try {
                // Add new page for visuals
                pdf.addPage();
                yPos = margin;

                yPos = addSectionHeader('FARM BOUNDARY VISUALIZATION', yPos);

                const canvas = await html2canvas(mapElement, {
                    useCORS: true,
                    scale: 2,
                    logging: false,
                    allowTaint: true
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, Math.min(imgHeight, 120));
                yPos += Math.min(imgHeight, 120) + 10;

                // Farm polygon coordinates
                if (farm?.features[0]?.geometry?.coordinates) {
                    yPos = addSectionHeader('POLYGON COORDINATES', yPos);
                    pdf.setFontSize(7);
                    pdf.setTextColor(...mutedColor);
                    const coords = farm.features[0].geometry.coordinates[0];
                    coords.slice(0, 8).forEach((coord: number[], i: number) => {
                        pdf.text(`Point ${i + 1}: [${coord[1].toFixed(6)}, ${coord[0].toFixed(6)}]`, margin + 3, yPos);
                        yPos += 4;
                    });
                    if (coords.length > 8) {
                        pdf.text(`... and ${coords.length - 8} more points`, margin + 3, yPos);
                    }
                }
            } catch (error) {
                console.error('Error capturing map:', error);
            }
        }
    }

    // ===================== FOOTER =====================
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(...primaryColor);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedColor);
        pdf.text('PMFBY Report - AI Yield Prediction System | YES-TECH Agri Portal', margin, pageHeight - 10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // SANITIZED FILENAME GENERATION
    // Remove any characters that might break the filename
    const dateStr = new Date().toISOString().split('T')[0];
    const reportId = String(claim?.id || farm?.id || 'Report').substring(0, 10).replace(/[^a-zA-Z0-9]/g, '');
    const cleanFileName = `PMFBY_Report_${reportId}_${dateStr}.pdf`;

    // EXPLICIT BLOB CREATION for maximum compatibility
    const pdfOutput = pdf.output('blob');
    const finalBlob = new Blob([pdfOutput], { type: 'application/pdf' });

    // UPLOAD TO FIRESTORE
    if (claim?.id) {
        try {
            console.log('Uploading report to Firestore...');
            const uploadedUrl = await uploadReportPDF(finalBlob, claim.id, cleanFileName);

            // Save report metadata
            const reportMetadata: Omit<FirestoreReportData, 'id' | 'createdAt'> = {
                claimId: claim.id,
                farmId: farm?.id,
                farmerId: claim.farmerId || farm?.farmerName, // Fallback if no farmer ID in claim
                farmerName: claim.farmerName || farm?.farmerName,
                reportType: 'yield_prediction',

                // Prediction Summary
                predictedYield: prediction?.predictedYield,
                threshold: prediction?.threshold,
                claimTriggered: prediction?.claimTriggered,
                lossPercentage: prediction?.lossPercentage,
                healthStatus: prediction?.healthStatus,

                // Verification
                verifiedBy: verifiedBy,
                verifiedAt: Timestamp.fromDate(new Date(verifiedAt)),

                // Storage Info
                pdfUrl: uploadedUrl,
                fileName: cleanFileName
            };

            await saveReport(reportMetadata);
            console.log('Report saved to Firestore successfully');
        } catch (error) {
            console.error('Error uploading report to Firestore:', error);
            // Don't throw - we still want to allow the user to download the local copy
        }
    }

    // Save using file-saver
    saveAs(finalBlob, cleanFileName);
}
