import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore/lite";

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
const db = getFirestore(app);

// Data Generators
const mockFarmers = [
    { id: "FARMER001", name: "Rajesh Kumar", village: "Palkhed", district: "Nashik" },
    { id: "FARMER002", name: "Suresh Patil", village: "Sinnar", district: "Nashik" },
    { id: "FARMER003", name: "Amit Sharma", village: "Niphad", district: "Nashik" },
    { id: "FARMER004", name: "Vikram Singh", village: "Yeola", district: "Nashik" },
    { id: "FARMER005", name: "Prakash Jadhav", village: "Malegaon", district: "Nashik" },
    { id: "FARMER006", name: "Mahesh Deshmukh", village: "Dindori", district: "Nashik" },
    { id: "FARMER007", name: "Sanjay More", village: "Chandwad", district: "Nashik" },
    { id: "FARMER008", name: "Ganesh Wagh", village: "Kalwan", district: "Nashik" },
];

const cropTypes = ["Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Onion", "Grape", "Soybean"];
const lossTypes = ["drought", "flood", "pest", "fire", "landslide", "hailstorm"];
const cropStages = ["sowing", "vegetative", "flowering", "maturity"];
const statuses = ["pending", "waiting", "approved", "rejected"];

const randomDate = () => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
};

const seed = async () => {
    console.log("🌱 Starting seed process...");

    try {
        // 1. Create Officer Account
        console.log("Creating officer account...");
        const officerRef = doc(db, "users", "OFFICER001");
        await setDoc(officerRef, {
            uid: "OFFICER001",
            name: "Rahul Officer",
            email: "officer@krishisense.com",
            role: "officer",
            district: "Nashik",
            createdAt: serverTimestamp()
        });
        console.log("✅ Officer created.");

        // 2. Create Farmers and Farms
        console.log("Creating farmers and farms...");
        for (const farmer of mockFarmers) {

            // Create User Document
            const userRef = doc(db, "users", farmer.id);
            await setDoc(userRef, {
                uid: farmer.id,
                name: farmer.name,
                email: `${farmer.name.split(' ')[0].toLowerCase()}@example.com`,
                role: "farmer",
                village: farmer.village,
                district: farmer.district,
                createdAt: serverTimestamp()
            });

            // Create Farm Document
            const farmsCol = collection(db, "farms");
            const farmRef = await addDoc(farmsCol, {
                userId: farmer.id,
                name: `${farmer.name.split(' ')[0]}'s Farm`,
                landArea: Math.floor(Math.random() * 10) + 2,
                landAreaUnit: "acres",
                district: farmer.district,
                village: farmer.village,
                surveyNumber: `${Math.floor(Math.random() * 500)}/${Math.floor(Math.random() * 10)}`,
                location: {
                    lat: 20 + Math.random(),
                    lng: 73 + Math.random()
                },
                createdAt: serverTimestamp()
            });

            // Create Claims for this farmer
            const numClaims = Math.floor(Math.random() * 3) + 1; // 1-3 claims per farmer
            const claimsCol = collection(db, "claims");

            for (let i = 0; i < numClaims; i++) {
                const lossDate = randomDate();
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                const claimData = {
                    claimNumber: `CLM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    farmerId: farmer.id,
                    farmerName: farmer.name,
                    userId: farmer.id, // filed by farmer themselves usually
                    filedBy: Math.random() > 0.8 ? "officer" : "farmer",

                    // Farm details
                    farmId: farmRef.id,
                    village: farmer.village,
                    district: farmer.district,
                    taluka: farmer.village, // Simplified

                    // Crop & Loss
                    cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
                    area: Math.floor(Math.random() * 5) + 1,
                    areaUnit: "acres",
                    lossType: lossTypes[Math.floor(Math.random() * lossTypes.length)],
                    lossDate: Timestamp.fromDate(lossDate),
                    cropStage: cropStages[Math.floor(Math.random() * cropStages.length)],
                    description: `Crop damage due to adverse conditions.`,
                    amount: Math.floor(Math.random() * 50000 + 5000),

                    status: status,
                    documents: [],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };

                // Add processing details if needed
                if (status === "approved" || status === "rejected") {
                    claimData.processedBy = "OFFICER001";
                    claimData.officerNotes = status === "approved" ? "Verified" : "Rejected due to lack of proof";
                }

                await addDoc(claimsCol, claimData);
            }
        }

        console.log("\n✅ Seeding completed! Created users, farms, and claims.");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error seeding database:", error.code, error.message);
        process.exit(1);
    }
};

seed();
