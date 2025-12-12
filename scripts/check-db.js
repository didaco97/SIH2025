import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, deleteDoc } from "firebase/firestore/lite";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);

const checkDb = async (dbName, dbInstance) => {
    console.log(`\nTesting database: '${dbName}' ...`);
    try {
        const docRef = doc(dbInstance, "users", "DB_CONNECTION_TEST");
        await setDoc(docRef, { timestamp: new Date(), type: "write_test" });
        console.log(`✅ SUCCESS: Wrote to '${dbName}' (users/DB_CONNECTION_TEST)`);

        // Cleanup
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.log(`❌ FAILED '${dbName}': ${error.code} - ${error.message}`);
        return false;
    }
};

const run = async () => {
    console.log("🔍 Checking Firestore databases...");

    // Check Default
    const dbDefault = getFirestore(app); // Maps to (default)
    await checkDb("(default)", dbDefault);

    // Check Named 'krishisense'
    const dbNamed = getFirestore(app, "krishisense");
    await checkDb("krishisense", dbNamed);

    process.exit(0);
};

run();
