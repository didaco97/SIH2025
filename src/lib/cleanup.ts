/**
 * Database Cleanup Utility
 * Removes all claims and segmented farms from Firestore
 * Run this to clear test data
 */

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function clearAllClaims() {
    try {
        const claimsRef = collection(db, 'claims');
        const snapshot = await getDocs(claimsRef);

        console.log(`Deleting ${snapshot.docs.length} claims...`);

        const deletePromises = snapshot.docs.map(document =>
            deleteDoc(doc(db, 'claims', document.id))
        );

        await Promise.all(deletePromises);
        console.log('✅ All claims deleted');
        return snapshot.docs.length;
    } catch (error) {
        console.error('Error deleting claims:', error);
        throw error;
    }
}

export async function clearAllSegmentedFarms() {
    try {
        const farmsRef = collection(db, 'segmented_farms');
        const snapshot = await getDocs(farmsRef);

        console.log(`Deleting ${snapshot.docs.length} segmented farms...`);

        const deletePromises = snapshot.docs.map(document =>
            deleteDoc(doc(db, 'segmented_farms', document.id))
        );

        await Promise.all(deletePromises);
        console.log('✅ All segmented farms deleted');
        return snapshot.docs.length;
    } catch (error) {
        console.error('Error deleting segmented farms:', error);
        throw error;
    }
}

export async function clearAllData() {
    console.log('🧹 Starting database cleanup...');

    const claimsCount = await clearAllClaims();
    const farmsCount = await clearAllSegmentedFarms();

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   - ${claimsCount} claims deleted`);
    console.log(`   - ${farmsCount} segmented farms deleted`);

    return { claimsCount, farmsCount };
}
