"use client";

import { ClaimData, ClaimStatus } from "@/lib/firestore";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    MapPin,
    Wheat,
    FileText,
    User,
    Hash,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Image as ImageIcon,
    ExternalLink,
} from "lucide-react";

interface ClaimDetailsSheetProps {
    claim: ClaimData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove?: (claim: ClaimData) => void;
    onReject?: (claim: ClaimData) => void;
    showActions?: boolean; // Show approve/reject for officers
}

const statusConfig: Record<ClaimStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending Review", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Clock className="w-4 h-4" /> },
    waiting: { label: "Under Review", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <Clock className="w-4 h-4" /> },
    approved: { label: "Approved", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle className="w-4 h-4" /> },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="w-4 h-4" /> },
};

const lossTypeLabels: Record<string, { label: string; color: string }> = {
    drought: { label: "Drought", color: "bg-amber-100 text-amber-700" },
    flood: { label: "Flood", color: "bg-blue-100 text-blue-700" },
    pest: { label: "Pest Attack", color: "bg-lime-100 text-lime-700" },
    fire: { label: "Fire", color: "bg-red-100 text-red-700" },
    landslide: { label: "Landslide", color: "bg-stone-100 text-stone-700" },
    hailstorm: { label: "Hailstorm", color: "bg-cyan-100 text-cyan-700" },
    other: { label: "Other", color: "bg-gray-100 text-gray-700" },
};

export function ClaimDetailsSheet({
    claim,
    open,
    onOpenChange,
    onApprove,
    onReject,
    showActions = false,
}: ClaimDetailsSheetProps) {
    if (!claim) return null;

    const status = statusConfig[claim.status] || statusConfig.pending;
    const lossType = lossTypeLabels[claim.lossType] || lossTypeLabels.other;
    const createdDate = claim.createdAt?.toDate?.() || new Date();
    const lossDate = claim.lossDate?.toDate?.() || new Date();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
                <SheetHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold">
                            {claim.claimNumber || `Claim #${claim.id?.slice(0, 8)}`}
                        </SheetTitle>
                        <Badge className={`${status.color} border gap-1`}>
                            {status.icon}
                            {status.label}
                        </Badge>
                    </div>
                    <SheetDescription>
                        Filed on {createdDate.toLocaleDateString()} by {claim.filedBy === 'officer' ? 'Officer' : 'Farmer'}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Farmer Info */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Farmer Information
                            </h3>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Farmer Name</p>
                                        <p className="font-medium">{claim.farmerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Hash className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Farmer ID</p>
                                        <p className="font-mono text-sm">{claim.farmerId}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Location Info */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Location Details
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">Village</p>
                                    <p className="font-medium text-sm">{claim.village || 'N/A'}</p>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">District</p>
                                    <p className="font-medium text-sm">{claim.district || 'N/A'}</p>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">Taluka</p>
                                    <p className="font-medium text-sm">{claim.taluka || 'N/A'}</p>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">Survey No.</p>
                                    <p className="font-medium text-sm">{claim.surveyNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Crop & Loss Info */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Crop & Loss Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <Wheat className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Crop Type</span>
                                    </div>
                                    <span className="font-medium">{claim.cropType}</span>
                                </div>
                                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Affected Area</span>
                                    </div>
                                    <span className="font-medium">{claim.area} {claim.areaUnit}</span>
                                </div>
                                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Loss Type</span>
                                    </div>
                                    <Badge className={lossType.color}>{lossType.label}</Badge>
                                </div>
                                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Date of Loss</span>
                                    </div>
                                    <span className="font-medium">{lossDate.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                                    <span className="text-sm">Crop Stage</span>
                                    <span className="font-medium capitalize">{claim.cropStage}</span>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Description */}
                        {claim.description && (
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Description
                                </h3>
                                <div className="bg-muted/30 rounded-lg p-4">
                                    <p className="text-sm whitespace-pre-wrap">{claim.description}</p>
                                </div>
                            </section>
                        )}

                        {/* Documents */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Documents
                            </h3>
                            <div className="space-y-2">
                                {claim.document712Url && (
                                    <a
                                        href={claim.document712Url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg p-3 transition-colors"
                                    >
                                        <FileText className="w-5 h-5 text-primary" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">7/12 Extract</p>
                                            <p className="text-xs text-muted-foreground">Land record document</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </a>
                                )}
                                {claim.documents && claim.documents.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {claim.documents.map((url, index) => (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center hover:bg-muted transition-colors overflow-hidden"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Proof ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center text-muted-foreground text-xs"><svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>Photo</div>';
                                                    }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {!claim.document712Url && (!claim.documents || claim.documents.length === 0) && (
                                    <div className="text-center py-6 text-muted-foreground text-sm">
                                        No documents uploaded
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Officer Notes (if any) */}
                        {claim.officerNotes && (
                            <>
                                <Separator />
                                <section>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Officer Notes
                                    </h3>
                                    <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
                                        <p className="text-sm">{claim.officerNotes}</p>
                                        {claim.processedBy && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                — Processed by {claim.processedBy}
                                            </p>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </ScrollArea>

                {/* Action Footer for Officers */}
                {showActions && claim.status === 'pending' && (
                    <SheetFooter className="pt-4 border-t gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => onReject?.(claim)}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onApprove?.(claim)}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
