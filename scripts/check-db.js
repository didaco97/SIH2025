import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, deleteDoc } from "firebase/firestore/lite";

const firebaseConfig = {
    apiKey: "AIzaSyBMCIcfRVb5kW5yruvXyOi54G26Wz4Hyhk",
    authDomain: "krishisense-480507.firebaseapp.com",
    projectId: "krishisense-480507",
    storageBucket: "krishisense-480507.firebasestorage.app",
    messagingSenderId: "789016695542",
    appId: "1:789016695542:web:e272e7a68dc336f1c792d7",
    measurementId: "G-HDD3M085YQ"
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
