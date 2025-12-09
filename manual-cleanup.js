/**
 * Manual cleanup script to delete all Firestore claims
 * Run this in browser console if the cleanup page doesn't work
 */

// Copy and paste this into browser console at http://localhost:3000

(async function cleanupFirestore() {
    console.log('🧹 Starting manual Firestore cleanup...');

    try {
        // Import Firestore from global (if available)
        const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');

        if (!db) {
            console.error('❌ Firebase not configured! Check .env.local');
            return;
        }

        // Delete all claims
        const claimsRef = collection(db, 'claims');
        const snapshot = await getDocs(claimsRef);

        console.log(`📊 Found ${snapshot.docs.length} claims to delete`);

        if (snapshot.docs.length === 0) {
            console.log('✅ No claims to delete - database is already clean!');
            return;
        }

        // Delete one by one with progress
        for (let i = 0; i < snapshot.docs.length; i++) {
            const docToDelete = snapshot.docs[i];
            await deleteDoc(doc(db, 'claims', docToDelete.id));
            console.log(`🗑️  Deleted ${i + 1}/${snapshot.docs.length}: ${docToDelete.id}`);
        }

        console.log('✅ All claims deleted successfully!');
        console.log('🔄 Refresh the page to see changes');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        console.error('Error details:', error.message);
    }
})();
