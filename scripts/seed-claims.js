import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore/lite";

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

// 15 Precise Mock Claims with Real Maharashtra Villages & Coordinates
const mockClaims = [
    // Nashik District - Grape & Onion Belt
    {
        farmerId: "FARMER101",
        farmerName: "Ramesh Bhosale",
        village: "Vaiduwadi",
        district: "Nashik",
        taluka: "Niphad",
        surveyNumber: "125/3A",
        latitude: 19.54841,
        longitude: 74.188663,
        cropType: "Grape",
        area: 3.5,
        lossType: "hailstorm",
        cropStage: "flowering",
        description: "Severe hailstorm damaged grape vines during flowering stage. Estimated 70% crop loss.",
        policyNumber: "PMFBY-2024-NSK-0125",
        status: "pending"
    },
    {
        farmerId: "FARMER102",
        farmerName: "Sunil Gaikwad",
        village: "Ozar",
        district: "Nashik",
        taluka: "Niphad",
        surveyNumber: "89/1B",
        latitude: 20.0891,
        longitude: 73.9214,
        cropType: "Onion",
        area: 2.0,
        lossType: "flood",
        cropStage: "maturity",
        description: "Flash floods submerged onion fields for 3 days. Complete crop loss.",
        policyNumber: "PMFBY-2024-NSK-0089",
        status: "approved"
    },
    {
        farmerId: "FARMER103",
        farmerName: "Ashok Pawar",
        village: "Sinnar",
        district: "Nashik",
        taluka: "Sinnar",
        surveyNumber: "234/7",
        latitude: 19.8457,
        longitude: 73.9976,
        cropType: "Sugarcane",
        area: 5.0,
        lossType: "drought",
        cropStage: "vegetative",
        description: "Extended dry spell with no irrigation water. Sugarcane wilting observed.",
        policyNumber: "PMFBY-2024-NSK-0234",
        status: "waiting"
    },

    // Pune District - Mixed Crops
    {
        farmerId: "FARMER104",
        farmerName: "Vijay Shinde",
        village: "Shirur",
        district: "Pune",
        taluka: "Shirur",
        surveyNumber: "456/2",
        latitude: 18.8276,
        longitude: 74.3792,
        cropType: "Wheat",
        area: 4.0,
        lossType: "pest",
        cropStage: "flowering",
        description: "Army worm infestation destroyed wheat crop. Pesticide application ineffective.",
        policyNumber: "PMFBY-2024-PUN-0456",
        status: "pending"
    },
    {
        farmerId: "FARMER105",
        farmerName: "Sanjay Jagtap",
        village: "Daund",
        district: "Pune",
        taluka: "Daund",
        surveyNumber: "312/5A",
        latitude: 18.4657,
        longitude: 74.5783,
        cropType: "Cotton",
        area: 6.5,
        lossType: "flood",
        cropStage: "sowing",
        description: "Unseasonal heavy rains washed away recently sown cotton seeds.",
        policyNumber: "PMFBY-2024-PUN-0312",
        status: "rejected"
    },
    {
        farmerId: "FARMER106",
        farmerName: "Ganesh Mane",
        village: "Baramati",
        district: "Pune",
        taluka: "Baramati",
        surveyNumber: "567/8",
        latitude: 18.1537,
        longitude: 74.5774,
        cropType: "Rice",
        area: 3.0,
        lossType: "drought",
        cropStage: "vegetative",
        description: "Water scarcity during critical growth stage. Rice paddies dried up.",
        policyNumber: "PMFBY-2024-PUN-0567",
        status: "approved"
    },

    // Ahmednagar District - Sugarcane Belt
    {
        farmerId: "FARMER107",
        farmerName: "Manoj Thombare",
        village: "Rahuri",
        district: "Ahmednagar",
        taluka: "Rahuri",
        surveyNumber: "78/4C",
        latitude: 19.3920,
        longitude: 74.6484,
        cropType: "Sugarcane",
        area: 8.0,
        lossType: "fire",
        cropStage: "maturity",
        description: "Accidental fire spread from adjacent field. 60% sugarcane burnt.",
        policyNumber: "PMFBY-2024-AHN-0078",
        status: "pending"
    },
    {
        farmerId: "FARMER108",
        farmerName: "Prakash Sonawane",
        village: "Kopargaon",
        district: "Ahmednagar",
        taluka: "Kopargaon",
        surveyNumber: "145/2B",
        latitude: 19.8833,
        longitude: 74.4833,
        cropType: "Maize",
        area: 2.5,
        lossType: "pest",
        cropStage: "vegetative",
        description: "Fall armyworm attack on maize crop. Leaves severely damaged.",
        policyNumber: "PMFBY-2024-AHN-0145",
        status: "waiting"
    },
    {
        farmerId: "FARMER109",
        farmerName: "Kiran Nikam",
        village: "Shrirampur",
        district: "Ahmednagar",
        taluka: "Shrirampur",
        surveyNumber: "223/6",
        latitude: 19.6167,
        longitude: 74.6500,
        cropType: "Soybean",
        area: 4.5,
        lossType: "hailstorm",
        cropStage: "flowering",
        description: "Golf ball sized hail destroyed soybean crop during peak flowering.",
        policyNumber: "PMFBY-2024-AHN-0223",
        status: "approved"
    },

    // Solapur District - Dry Region
    {
        farmerId: "FARMER110",
        farmerName: "Balaji Jadhav",
        village: "Pandharpur",
        district: "Solapur",
        taluka: "Pandharpur",
        surveyNumber: "334/1",
        latitude: 17.6787,
        longitude: 75.3265,
        cropType: "Wheat",
        area: 3.0,
        lossType: "drought",
        cropStage: "sowing",
        description: "No rainfall for 45 days after sowing. Seeds failed to germinate.",
        policyNumber: "PMFBY-2024-SOL-0334",
        status: "pending"
    },
    {
        farmerId: "FARMER111",
        farmerName: "Santosh Kulkarni",
        village: "Barshi",
        district: "Solapur",
        taluka: "Barshi",
        surveyNumber: "456/9A",
        latitude: 18.2333,
        longitude: 75.6833,
        cropType: "Cotton",
        area: 5.0,
        lossType: "pest",
        cropStage: "maturity",
        description: "Pink bollworm infestation. Cotton bolls damaged before harvest.",
        policyNumber: "PMFBY-2024-SOL-0456",
        status: "rejected"
    },

    // Satara District - Rice & Sugarcane
    {
        farmerId: "FARMER112",
        farmerName: "Anil Patil",
        village: "Karad",
        district: "Satara",
        taluka: "Karad",
        surveyNumber: "567/3B",
        latitude: 17.2856,
        longitude: 74.1847,
        cropType: "Rice",
        area: 2.5,
        lossType: "flood",
        cropStage: "maturity",
        description: "Krishna river overflow flooded rice fields. Harvest ready crop destroyed.",
        policyNumber: "PMFBY-2024-SAT-0567",
        status: "approved"
    },
    {
        farmerId: "FARMER113",
        farmerName: "Deepak More",
        village: "Phaltan",
        district: "Satara",
        taluka: "Phaltan",
        surveyNumber: "678/4",
        latitude: 17.9833,
        longitude: 74.4333,
        cropType: "Sugarcane",
        area: 7.0,
        lossType: "landslide",
        cropStage: "vegetative",
        description: "Hillside landslide covered part of sugarcane field with debris.",
        policyNumber: "PMFBY-2024-SAT-0678",
        status: "pending"
    },

    // Kolhapur District - High Rainfall Area
    {
        farmerId: "FARMER114",
        farmerName: "Rajendra Chavan",
        village: "Ichalkaranji",
        district: "Kolhapur",
        taluka: "Hatkanangale",
        surveyNumber: "789/5C",
        latitude: 16.6917,
        longitude: 74.4583,
        cropType: "Soybean",
        area: 3.5,
        lossType: "flood",
        cropStage: "flowering",
        description: "Continuous heavy rains for 10 days caused waterlogging. Roots rotted.",
        policyNumber: "PMFBY-2024-KOL-0789",
        status: "waiting"
    },
    {
        farmerId: "FARMER115",
        farmerName: "Nitin Desai",
        village: "Gadhinglaj",
        district: "Kolhapur",
        taluka: "Gadhinglaj",
        surveyNumber: "890/2A",
        latitude: 16.2333,
        longitude: 74.3500,
        cropType: "Rice",
        area: 4.0,
        lossType: "pest",
        cropStage: "vegetative",
        description: "Brown planthopper attack on rice crop. Yellowing of leaves observed.",
        policyNumber: "PMFBY-2024-KOL-0890",
        status: "pending"
    }
];

const seed = async () => {
    console.log("🌱 Starting precise claims seeding process...");
    console.log(`📝 Creating ${mockClaims.length} claims with real coordinates...\n`);

    try {
        const claimsCol = collection(db, "claims");
        let created = 0;

        for (const claim of mockClaims) {
            // Generate random dates within last 60 days
            const now = new Date();
            const daysAgo = Math.floor(Math.random() * 60) + 1;
            const lossDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

            const claimData = {
                // Auto-generated
                claimNumber: `CLM-2024-${String(created + 1001).padStart(4, '0')}`,

                // Farmer Info
                farmerId: claim.farmerId,
                farmerName: claim.farmerName,
                userId: "OFFICER001", // Filed by officer
                filedBy: "officer",

                // Location
                village: claim.village,
                district: claim.district,
                taluka: claim.taluka,
                surveyNumber: claim.surveyNumber,
                latitude: claim.latitude,
                longitude: claim.longitude,

                // Crop Info
                cropType: claim.cropType,
                area: claim.area,
                areaUnit: "acres",
                policyNumber: claim.policyNumber,

                // Loss Details
                lossType: claim.lossType,
                lossDate: Timestamp.fromDate(lossDate),
                cropStage: claim.cropStage,
                description: claim.description,

                // Claim
                amount: Math.floor(claim.area * 15000 + Math.random() * 10000), // ~15k per acre + random
                status: claim.status,

                // Documents (placeholder URLs)
                documents: ["img.png"],
                document712Url: "img.png",

                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Add processing info for approved/rejected claims
            if (claim.status === "approved" || claim.status === "rejected") {
                claimData.processedBy = "OFFICER001";
                claimData.officerNotes = claim.status === "approved"
                    ? "Claim verified. Damage assessment confirmed during field visit."
                    : "Insufficient documentation. Claim does not meet eligibility criteria.";
                claimData.processedAt = Timestamp.fromDate(new Date());
            }

            await addDoc(claimsCol, claimData);
            created++;

            console.log(`✅ ${created}. ${claim.farmerName} - ${claim.village}, ${claim.district}`);
            console.log(`   📍 ${claim.latitude}, ${claim.longitude} | ${claim.cropType} | ${claim.lossType}`);
        }

        console.log(`\n🎉 Successfully created ${created} precise claims!`);
        console.log("📊 Summary:");
        console.log("   - Nashik: 3 claims (Grape, Onion, Sugarcane)");
        console.log("   - Pune: 3 claims (Wheat, Cotton, Rice)");
        console.log("   - Ahmednagar: 3 claims (Sugarcane, Maize, Soybean)");
        console.log("   - Solapur: 2 claims (Wheat, Cotton)");
        console.log("   - Satara: 2 claims (Rice, Sugarcane)");
        console.log("   - Kolhapur: 2 claims (Soybean, Rice)");

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error seeding database:", error.code, error.message);
        process.exit(1);
    }
};

seed();
