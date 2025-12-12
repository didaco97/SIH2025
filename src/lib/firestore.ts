import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    limit,
    QueryConstraint,
    orderBy,
    serverTimestamp,
    Timestamp,
    addDoc,
    onSnapshot,
    Unsubscribe,
    Firestore,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { generateBlockchainHash } from './blockchain';

// Helper to ensure Firestore is configured
function getDb(): Firestore {
    if (!db) {
        throw new Error(
            'Firebase is not configured. Please set up your .env.local file with Firebase credentials. ' +
            'Copy .env.example to .env.local and add your Firebase config.'
        );
    }
    return db;
}

// ==================== USER FUNCTIONS ====================

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: 'farmer' | 'officer';
    district?: string;
    village?: string;
    phone?: string;
    createdAt: Timestamp;
}

export async function getUserProfile(userId: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(getDb(), 'users', userId));
    if (userDoc.exists()) {
        return { uid: userId, ...userDoc.data() } as UserData;
    }
    return null;
}

export async function updateUserProfile(
    userId: string,
    data: Partial<Omit<UserData, 'uid' | 'createdAt'>>
): Promise<void> {
    await updateDoc(doc(getDb(), 'users', userId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// ==================== FARM FUNCTIONS ====================

export interface FarmData {
    id?: string;
    userId: string;
    name: string;
    landArea: number;
    landAreaUnit: 'acres' | 'hectares';
    cropType: string;
    sowingDate: Timestamp;
    location: {
        lat: number;
        lng: number;
    };
    boundary?: {
        type: 'Polygon';
        coordinates: number[][][];
    };
    district: string;
    taluka?: string;
    village?: string;
    surveyNumber?: string;
    createdAt?: Timestamp;
}

export async function createFarm(data: Omit<FarmData, 'id' | 'createdAt'>): Promise<string> {
    const farmRef = await addDoc(collection(getDb(), 'farms'), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return farmRef.id;
}

export async function getFarm(farmId: string): Promise<FarmData | null> {
    const farmDoc = await getDoc(doc(getDb(), 'farms', farmId));
    if (farmDoc.exists()) {
        return { id: farmId, ...farmDoc.data() } as FarmData;
    }
    return null;
}

export async function getUserFarms(userId: string): Promise<FarmData[]> {
    const farmsQuery = query(
        collection(getDb(), 'farms'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(farmsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FarmData));
}

export async function updateFarm(
    farmId: string,
    data: Partial<Omit<FarmData, 'id' | 'createdAt'>>
): Promise<void> {
    await updateDoc(doc(getDb(), 'farms', farmId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteFarm(farmId: string): Promise<void> {
    await deleteDoc(doc(getDb(), 'farms', farmId));
}

// ==================== CLAIM FUNCTIONS ====================

export type ClaimStatus = 'pending' | 'waiting' | 'approved' | 'rejected';
export type LossType = 'drought' | 'flood' | 'pest' | 'fire' | 'landslide' | 'hailstorm' | 'other';
export type CropStage = 'sowing' | 'vegetative' | 'flowering' | 'maturity';

export interface ClaimData {
    id?: string;
    claimNumber?: string;        // Auto-generated: CLM-YYYY-XXX
    farmerId: string;            // User who filed or farmer ID entered
    farmerName: string;
    userId: string;              // User who submitted (could be officer)
    filedBy: 'farmer' | 'officer';

    // Farm/Location Info
    farmId?: string;
    farmName?: string;
    village: string;
    district: string;
    taluka?: string;
    surveyNumber?: string;
    latitude?: number;           // Farm coordinates
    longitude?: number;

    // Crop Info
    cropType: string;
    area: number;
    areaUnit: 'acres' | 'hectares';
    policyNumber?: string;

    // Loss Details
    lossType: LossType;
    lossDate: Timestamp;
    cropStage: CropStage;
    harvestDate?: Timestamp;
    description: string;

    // Claim Amount
    amount: number;
    status: ClaimStatus;

    // Documents
    documents: string[];         // Storage URLs for proof images
    document712Url?: string;     // 7/12 extract URL
    reportId?: string;           // Reference to latest generated report
    reportUrl?: string;          // PDF download URL
    reportGeneratedAt?: Timestamp;

    // Processing
    officerNotes?: string;
    processedBy?: string;
    processedAt?: Timestamp;

    // Blockchain Verification
    blockchainHash?: string;          // SHA-256 hash of report
    blockchainTxHash?: string;        // On-chain transaction hash
    blockchainExplorerUrl?: string;   // Link to block explorer

    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Generate a unique claim number
async function generateClaimNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const claimsQuery = query(
        collection(getDb(), 'claims'),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(claimsQuery);
    const count = snapshot.size + 1;
    return `CLM-${year}-${String(count).padStart(4, '0')}`;
}

export async function createClaim(data: Omit<ClaimData, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const claimNumber = await generateClaimNumber();
    const claimRef = await addDoc(collection(getDb(), 'claims'), {
        ...data,
        claimNumber,
        status: data.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return claimRef.id;
}

export async function getClaim(claimId: string): Promise<ClaimData | null> {
    const claimDoc = await getDoc(doc(getDb(), 'claims', claimId));
    if (claimDoc.exists()) {
        return { id: claimId, ...claimDoc.data() } as ClaimData;
    }
    return null;
}

export async function getUserClaims(userId: string): Promise<ClaimData[]> {
    const claimsQuery = query(
        collection(getDb(), 'claims'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(claimsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ClaimData));
}

export async function getClaimsByFarmerId(farmerId: string): Promise<ClaimData[]> {
    const claimsQuery = query(
        collection(getDb(), 'claims'),
        where('farmerId', '==', farmerId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(claimsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ClaimData));
}

export async function getFarmClaims(farmId: string): Promise<ClaimData[]> {
    const claimsQuery = query(
        collection(getDb(), 'claims'),
        where('farmId', '==', farmId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(claimsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ClaimData));
}

export async function getClaimsByStatus(status: ClaimStatus): Promise<ClaimData[]> {
    const claimsQuery = query(
        collection(getDb(), 'claims'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(claimsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ClaimData));
}

export async function getAllClaims(): Promise<ClaimData[]> {
    const claimsQuery = query(
        collection(getDb(), 'claims'),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(claimsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ClaimData));
}

export async function updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    officerNotes?: string,
    processedBy?: string
): Promise<void> {
    await updateDoc(doc(getDb(), 'claims', claimId), {
        status,
        officerNotes,
        processedBy,
        processedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateClaimBlockchainInfo(
    claimId: string,
    txHash: string,
    explorerUrl: string
): Promise<void> {
    await updateDoc(doc(getDb(), 'claims', claimId), {
        blockchainTxHash: txHash,
        blockchainExplorerUrl: explorerUrl,
        updatedAt: serverTimestamp(),
    });
}

export async function updateClaim(
    claimId: string,
    data: Partial<Omit<ClaimData, 'id' | 'createdAt'>>
): Promise<void> {
    await updateDoc(doc(getDb(), 'claims', claimId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// ==================== DOCUMENT FUNCTIONS ====================

export interface DocumentData {
    id?: string;
    userId: string;
    farmId?: string;
    claimId?: string;
    type: '712' | 'land_record' | 'photo' | 'other';
    name: string;
    url: string;
    extractedData?: Record<string, any>;
    createdAt?: Timestamp;
}

export async function saveDocument(data: Omit<DocumentData, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(getDb(), 'documents'), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getUserDocuments(userId: string): Promise<DocumentData[]> {
    const docsQuery = query(
        collection(getDb(), 'documents'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(docsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentData));
}

// ==================== SEGMENTED FARM FUNCTIONS ====================

export interface GeoJsonFeature {
    type: string;
    properties: {
        area_m2?: number;
    };
    geometry: {
        type: string;
        coordinates: number[][][];
    };
}

export interface SegmentedFarmData {
    id?: string;
    claimId: string;              // Reference to the claim
    farmerId: string;
    farmerName: string;
    village: string;
    district?: string;
    surveyNo?: string;
    cropType?: string;
    color: string;
    features: GeoJsonFeature[];   // Polygon coordinates
    areaM2: number;
    createdAt?: Timestamp;
    createdBy: string;            // Officer who segmented
}

export async function saveSegmentedFarm(data: Omit<SegmentedFarmData, 'id' | 'createdAt'>): Promise<string> {
    // Firestore doesn't support nested arrays, so serialize features to JSON string
    const dataToSave = {
        ...data,
        featuresJson: JSON.stringify(data.features), // Store as JSON string
        features: undefined, // Don't save the original nested array
        createdAt: serverTimestamp(),
    };
    delete dataToSave.features;

    const docRef = await addDoc(collection(getDb(), 'segmentedFarms'), dataToSave);
    return docRef.id;
}

export async function getSegmentedFarms(): Promise<SegmentedFarmData[]> {
    const q = query(
        collection(getDb(), 'segmentedFarms'),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        // Parse featuresJson back to features array
        const features = data.featuresJson ? JSON.parse(data.featuresJson) : [];
        return { id: doc.id, ...data, features } as SegmentedFarmData;
    });
}

export async function getSegmentedFarmById(farmId: string): Promise<SegmentedFarmData | null> {
    const farmDoc = await getDoc(doc(getDb(), 'segmentedFarms', farmId));
    if (farmDoc.exists()) {
        const data = farmDoc.data();
        const features = data.featuresJson ? JSON.parse(data.featuresJson) : [];
        return { id: farmId, ...data, features } as SegmentedFarmData;
    }
    return null;
}

export async function getSegmentedFarmsByClaimId(claimId: string): Promise<SegmentedFarmData[]> {
    const q = query(
        collection(getDb(), 'segmentedFarms'),
        where('claimId', '==', claimId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        const features = data.featuresJson ? JSON.parse(data.featuresJson) : [];
        return { id: doc.id, ...data, features } as SegmentedFarmData;
    });
}

export async function deleteSegmentedFarm(farmId: string): Promise<void> {
    await deleteDoc(doc(getDb(), 'segmentedFarms', farmId));
}

// ==================== REPORT FUNCTIONS ====================

export interface ReportData {
    id?: string;
    claimId: string;
    farmId?: string;
    farmerId?: string;
    farmerName?: string;
    reportType: 'yield_prediction';

    // Report content summary
    predictedYield?: number;
    threshold?: number;
    claimTriggered?: boolean;
    lossPercentage?: number;
    healthStatus?: string;

    // Verification
    verifiedBy: string;
    verifiedAt: Timestamp;

    // PDF Storage
    pdfUrl: string;
    fileName: string;

    // Metadata
    createdAt?: Timestamp;
}

export async function saveReport(data: Omit<ReportData, 'id' | 'createdAt'>): Promise<{ reportId: string; blockchainHash?: string }> {
    const reportRef = await addDoc(collection(getDb(), 'reports'), {
        ...data,
        createdAt: serverTimestamp(),
    });

    let blockHash: string | undefined;

    // Also update the claim with the report reference and set status to 'waiting' (Under Review)
    if (data.claimId) {
        // Generate blockchain hash from the report URL + Timestamp for uniqueness/integrity
        const hashInput = `${data.pdfUrl}-${Date.now()}`;
        blockHash = await generateBlockchainHash(hashInput);

        await updateDoc(doc(getDb(), 'claims', data.claimId), {
            reportId: reportRef.id,
            reportUrl: data.pdfUrl,
            status: 'waiting',
            reportGeneratedAt: serverTimestamp(),
            blockchainHash: blockHash,
            updatedAt: serverTimestamp(),
        });
    }

    return { reportId: reportRef.id, blockchainHash: blockHash };
}

export async function getClaimReports(claimId: string): Promise<ReportData[]> {
    const q = query(
        collection(getDb(), 'reports'),
        where('claimId', '==', claimId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ReportData));
}

export async function getReport(reportId: string): Promise<ReportData | null> {
    const reportDoc = await getDoc(doc(getDb(), 'reports', reportId));
    if (reportDoc.exists()) {
        return { id: reportId, ...reportDoc.data() } as ReportData;
    }
    return null;
}

export function subscribeToClaimsByStatus(
    status: ClaimStatus,
    callback: (claims: ClaimData[]) => void,
    limitCount?: number
): Unsubscribe {
    const constraints: QueryConstraint[] = [
        where('status', '==', status)
    ];

    // NOTE: Removed server-side orderBy/limit to avoid "Index Required" errors during development.
    // Fetching all (filtered by status) and sorting/limiting client-side.
    // For production with >1000 claims, revert this and create Firestore Indexes.

    const claimsQuery = query(
        collection(getDb(), 'claims'),
        ...constraints
    );

    return onSnapshot(claimsQuery, (snapshot) => {
        let claims = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ClaimData));

        // Sort client-side (Newest first)
        claims.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        // Limit client-side
        if (limitCount && limitCount > 0) {
            claims = claims.slice(0, limitCount);
        }

        callback(claims);
    });
}
