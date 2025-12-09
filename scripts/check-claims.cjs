const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const checkClaims = async () => {
    console.log("🔍 Checking Firestore claims...\n");

    try {
        const claimsCol = db.collection("claims");
        const snapshot = await claimsCol.orderBy('createdAt', 'desc').get();

        console.log(`📊 Total claims in Firestore: ${snapshot.size}\n`);

        console.log("First 10 claims (most recent):");
        console.log("═".repeat(80));

        let count = 0;
        snapshot.forEach((doc) => {
            if (count < 10) {
                const data = doc.data();
                console.log(`${count + 1}. ${data.claimNumber || 'NO_NUMBER'} | ${data.farmerName} | ${data.village}, ${data.district}`);
                count++;
            }
        });

        console.log("\n");
        console.log("Claims by year:");
        let clm2024 = 0, clm2025 = 0, other = 0;
        snapshot.forEach((doc) => {
            const num = doc.data().claimNumber || '';
            if (num.includes('2024')) clm2024++;
            else if (num.includes('2025')) clm2025++;
            else other++;
        });
        console.log(`  CLM-2024-*: ${clm2024}`);
        console.log(`  CLM-2025-*: ${clm2025}`);
        console.log(`  Other: ${other}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

checkClaims();
