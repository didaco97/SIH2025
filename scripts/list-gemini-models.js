import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = process.env.GOOGLE_VISION_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const match = envConfig.match(/GOOGLE_VISION_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
}

async function listModels() {
    if (!apiKey) {
        console.error("No API KEY found in .env.local or environment");
        return;
    }

    try {
        console.log("Checking API Key access...");

        // Direct fetch to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error("Failed to list models:", await response.text());
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found in response.");
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
