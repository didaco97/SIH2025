"use client";

import { useState, useEffect } from "react";
import { OfficerSidebar } from "@/components/officer/OfficerSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    CheckCircle2,
    XCircle,
    FileText,
    Search,
    AlertCircle,
    Calendar,
    MapPin,
    ArrowRight,
    ExternalLink,
    Clock,
    Filter,
    ClipboardCheck,
    History
} from "lucide-react";
import { getClaimsByStatus, updateClaimStatus, ClaimData, getReport, ReportData, subscribeToClaimsByStatus } from "@/lib/firestore";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function OfficerApprovals() {
    const { user, isConfigured } = useAuth();
    const [claims, setClaims] = useState<ClaimData[]>([]);
    const [approvedClaims, setApprovedClaims] = useState<ClaimData[]>([]);
    const [rejectedClaims, setRejectedClaims] = useState<ClaimData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectionNote, setRejectionNote] = useState("");
    const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

    // Subscribe to claims
    useEffect(() => {
        if (!isConfigured) return;

        setLoading(true);

        // 1. Subscribe to Waiting (Pending Review)
        const unsubWaiting = subscribeToClaimsByStatus('waiting', (updatedClaims) => {
            setClaims(updatedClaims);
            setLoading(false);
        });

        // 2. Subscribe to Approved (History) - Limit 20
        const unsubApproved = subscribeToClaimsByStatus('approved', (updatedClaims) => {
            setApprovedClaims(updatedClaims);
        }, 20);

        // 3. Subscribe to Rejected (History) - Limit 20
        const unsubRejected = subscribeToClaimsByStatus('rejected', (updatedClaims) => {
            setRejectedClaims(updatedClaims);
        }, 20);

        return () => {
            unsubWaiting();
            unsubApproved();
            unsubRejected();
        };
    }, [isConfigured]);

    // Handle Approval
    const handleApprove = async (claimId: string) => {
        try {
            setProcessingId(claimId);
            await updateClaimStatus(claimId, 'approved', 'Approved manually by officer', user?.email || 'Officer');
            toast.success("Claim approved successfully");
        } catch (error) {
            console.error("Error approving claim:", error);
            toast.error("Failed to approve claim");
        } finally {
            setProcessingId(null);
        }
    };

    // Handle Rejection
    const handleReject = async () => {
        if (!selectedClaimId) return;

        try {
            setProcessingId(selectedClaimId);
            await updateClaimStatus(
                selectedClaimId,
                'rejected',
                rejectionNote || 'Rejected by officer',
                user?.email || 'Officer'
            );
            toast.success("Claim rejected");
            setRejectionNote("");
            setSelectedClaimId(null);
        } catch (error) {
            console.error("Error rejecting claim:", error);
            toast.error("Failed to reject claim");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter waiting claims
    const filteredClaims = claims.filter(claim =>
        claim.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.claimNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.village.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Combine history
    const historyClaims = [...approvedClaims, ...rejectedClaims].sort((a, b) => {
        // Sort by updatedAt if available, else createdAt
        const dateA = a.updatedAt?.toDate() || a.createdAt?.toDate() || new Date();
        const dateB = b.updatedAt?.toDate() || b.createdAt?.toDate() || new Date();
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <div className="flex h-screen bg-background">
            <OfficerSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Claim Approvals</h1>
                            <p className="text-muted-foreground mt-1">Review and approve processed claims</p>
                        </div>

                        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border">
                            <Badge variant="outline" className="bg-background shadow-sm">
                                <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
                                {claims.length} Pending Review
                            </Badge>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by farmer, claim #, or village..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* PENDING APPROVALS LIST */}
                    <ScrollArea className="h-[calc(55vh)] border rounded-xl bg-card shadow-sm">
                        <div className="p-4">
                            {loading && claims.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <div className="animate-spin mb-4"><Clock className="w-8 h-8" /></div>
                                    <p>Loading approvals...</p>
                                </div>
                            ) : filteredClaims.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <ClipboardCheck className="w-16 h-16 mb-4 opacity-50" />
                                    <h3 className="text-xl font-semibold mb-1">All Caught Up!</h3>
                                    <p>No claims waiting for approval.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredClaims.map((claim) => (
                                        <div key={claim.id} className="group">
                                            <Card className="transition-all hover:shadow-md border-l-4 border-l-blue-500">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col lg:flex-row gap-6">
                                                        {/* Claim Info */}
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h3 className="font-semibold text-lg">{claim.farmerName}</h3>
                                                                        <Badge variant="secondary" className="font-mono text-xs">
                                                                            {claim.claimNumber || 'NO-ID'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <span className="flex items-center">
                                                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                                                            {claim.village}, {claim.district}
                                                                        </span>
                                                                        <span className="flex items-center">
                                                                            <Calendar className="w-3.5 h-3.5 mr-1" />
                                                                            {claim.createdAt ? format(claim.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="font-semibold text-lg text-primary">₹ {claim.amount.toLocaleString()}</p>
                                                                    <p className="text-xs text-muted-foreground">{claim.area} {claim.areaUnit}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                                                                    {claim.cropType}
                                                                </Badge>
                                                                <Badge variant="outline" className="capitalize bg-amber-50 text-amber-700 border-amber-200">
                                                                    {claim.lossType}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {/* Actions Column */}
                                                        <div className="flex flex-col sm:flex-row items-center gap-3 lg:border-l lg:pl-6 lg:min-w-[280px]">
                                                            {claim.reportUrl && (
                                                                <a
                                                                    href={claim.reportUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-full"
                                                                >
                                                                    <Button variant="outline" className="w-full justify-start gap-2 h-10 border-blue-200 hover:bg-blue-50 text-blue-700">
                                                                        <FileText className="w-4 h-4" />
                                                                        View Report PDF
                                                                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                                                    </Button>
                                                                </a>
                                                            )}

                                                            <div className="flex gap-2 w-full mt-auto">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            className="flex-1 hover:bg-red-50 hover:text-red-600 border-red-200"
                                                                            onClick={() => setSelectedClaimId(claim.id || null)}
                                                                            disabled={processingId === claim.id}
                                                                        >
                                                                            <XCircle className="w-4 h-4 mr-2" />
                                                                            Reject
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Reject Claim</DialogTitle>
                                                                            <DialogDescription>
                                                                                Please provide a reason for rejecting this claim. This will be visible to the farmer.
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <Textarea
                                                                            placeholder="Reason for rejection..."
                                                                            value={rejectionNote}
                                                                            onChange={(e) => setRejectionNote(e.target.value)}
                                                                            className="min-h-[100px]"
                                                                        />
                                                                        <DialogFooter>
                                                                            <Button
                                                                                variant="destructive"
                                                                                onClick={handleReject}
                                                                                disabled={!rejectionNote.trim() || processingId === claim.id}
                                                                            >
                                                                                Confirm Rejection
                                                                            </Button>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>

                                                                <Button
                                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                                    onClick={() => handleApprove(claim.id!)}
                                                                    disabled={processingId === claim.id}
                                                                >
                                                                    {processingId === claim.id ? (
                                                                        <div className="animate-spin mr-2"><Clock className="w-4 h-4" /></div>
                                                                    ) : (
                                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                    )}
                                                                    Approve
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* HISTORY SECTION (RECENT DECISIONS) */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-muted-foreground" />
                            <h2 className="text-xl font-semibold">Recent History</h2>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Farmer Name</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Claim ID</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Processed Date</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyClaims.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                        No recent history available.
                                                    </td>
                                                </tr>
                                            ) : (
                                                historyClaims.slice(0, 10).map((claim) => (
                                                    <tr key={claim.id} className="border-b transition-colors hover:bg-muted/50">
                                                        <td className="p-4 align-middle font-medium">{claim.farmerName}</td>
                                                        <td className="p-4 align-middle font-mono text-xs">{claim.claimNumber || '—'}</td>
                                                        <td className="p-4 align-middle">
                                                            <Badge
                                                                variant={claim.status === 'approved' ? 'default' : 'destructive'}
                                                                className={claim.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                            >
                                                                {claim.status === 'approved' ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <CheckCircle2 className="w-3 h-3" /> Approved
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1">
                                                                        <XCircle className="w-3 h-3" /> Rejected
                                                                    </span>
                                                                )}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 align-middle text-muted-foreground">
                                                            {claim.updatedAt ? format(claim.updatedAt.toDate(), 'MMM d, p') : '—'}
                                                        </td>
                                                        <td className="p-4 align-middle text-right">
                                                            {claim.reportUrl && (
                                                                <a
                                                                    href={claim.reportUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline text-xs inline-flex items-center"
                                                                >
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Report
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
