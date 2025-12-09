import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    UploadTaskSnapshot,
    FirebaseStorage,
} from 'firebase/storage';
import { storage } from './firebase';

// Helper to ensure Storage is configured
function getStorageInstance(): FirebaseStorage {
    if (!storage) {
        throw new Error(
            'Firebase Storage is not configured. Please set up your .env.local file with Firebase credentials. ' +
            'Copy .env.example to .env.local and add your Firebase config.'
        );
    }
    return storage;
}

export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
    file: File,
    path: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    const storageRef = ref(getStorageInstance(), path);

    if (onProgress) {
        // Use resumable upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot: UploadTaskSnapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } else {
        // Simple upload without progress
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    }
}

/**
 * Upload a document (7/12, land records, etc.)
 */
export async function uploadDocument(
    file: File,
    userId: string,
    farmId?: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = farmId
        ? `documents/${userId}/${farmId}/${timestamp}_${safeName}`
        : `documents/${userId}/${timestamp}_${safeName}`;

    return uploadFile(file, path, onProgress);
}

/**
 * Upload a farm image
 */
export async function uploadFarmImage(
    file: File,
    userId: string,
    farmId: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `farms/${userId}/${farmId}/${timestamp}.${extension}`;

    return uploadFile(file, path, onProgress);
}

/**
 * Upload a claim attachment
 */
export async function uploadClaimAttachment(
    file: File,
    userId: string,
    claimId: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `claims/${userId}/${claimId}/${timestamp}_${safeName}`;

    return uploadFile(file, path, onProgress);
}

/**
 * Upload user profile image
 */
export async function uploadProfileImage(
    file: File,
    userId: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `profiles/${userId}/avatar.${extension}`;

    return uploadFile(file, path, onProgress);
}

/**
 * Get download URL for a file
 */
export async function getFileUrl(path: string): Promise<string> {
    const storageRef = ref(getStorageInstance(), path);
    return getDownloadURL(storageRef);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<void> {
    const storageRef = ref(getStorageInstance(), path);
    await deleteObject(storageRef);
}

/**
 * Delete a file by its URL
 */
export async function deleteFileByUrl(url: string): Promise<void> {
    // Extract path from Firebase Storage URL
    const matches = url.match(/\/o\/(.+?)\?/);
    if (matches && matches[1]) {
        const path = decodeURIComponent(matches[1]);
        await deleteFile(path);
    }
}

/**
 * Upload a PDF report blob to Firebase Storage
 */
export async function uploadReportPDF(
    pdfBlob: Blob,
    claimId: string,
    reportFileName: string
): Promise<string> {
    const timestamp = Date.now();
    const safeName = reportFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `reports/${claimId}/${timestamp}_${safeName}`;

    const storageRef = ref(getStorageInstance(), path);
    await uploadBytes(storageRef, pdfBlob);
    return getDownloadURL(storageRef);
}
