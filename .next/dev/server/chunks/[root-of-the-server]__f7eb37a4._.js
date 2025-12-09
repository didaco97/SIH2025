module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/ocr/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(request) {
    try {
        const { image } = await request.json();
        if (!image) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Image data is required'
            }, {
                status: 400
            });
        }
        const apiKey = process.env.GOOGLE_VISION_API_KEY;
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Google Vision API Key is not configured'
            }, {
                status: 500
            });
        }
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    {
                        image: {
                            content: image.split(',')[1] || image // Handle data URL or raw base64
                        },
                        features: [
                            {
                                type: "DOCUMENT_TEXT_DETECTION" // Better for dense documents like 7/12
                            }
                        ]
                    }
                ]
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Vision API Error:', errorData);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: errorData.error?.message || 'Failed to process image'
            }, {
                status: response.status
            });
        }
        const data = await response.json();
        const fullText = data.responses[0]?.fullTextAnnotation?.text || "";
        // NEW: Process with Gemini for structured extraction
        const geminiKey = process.env.GOOGLE_VISION_API_KEY;
        let structuredData = null;
        let geminiError = null;
        if (geminiKey && fullText) {
            try {
                const { GoogleGenerativeAI } = __turbopack_context__.r("[project]/node_modules/@google/generative-ai/dist/index.js [app-route] (ecmascript)");
                const genAI = new GoogleGenerativeAI(geminiKey);
                // Use a model confirmed to be in the list
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.0-flash-exp"
                });
                const prompt = `
                Extract the following fields from this Marathi 7/12 land record document text into a pure JSON object.
                Analyze the text carefully. It is a 7/12 extract from Maharashtra, India.
                
                Fields to extract:
                - surveyNumber (Format: "123" or "123/1A")
                - ownerName (List all names found under "Khatedar", separated by commas)
                - village (Village Name / Gaav)
                - taluka (Taluka Name)
                - district (District Name / Jilha)
                - area (Total Area in Hectare or R, e.g., "1.35 Ha")
                - cultivableArea (Pot Kharab or Cultivable, if mentioned)
                - coordinates (Any latitude/longitude found in text, else "Not Found")

                If a field is not found, return formatted as "Not Found".
                Do not include markdown code blocks (like \`\`\`json). Just the raw JSON string.
                
                Document Text:
                ${fullText}
                `;
                const result = await model.generateContent(prompt);
                const geminiResponse = await result.response;
                const text = geminiResponse.text();
                // Clean the response if it contains markdown
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                structuredData = JSON.parse(jsonStr);
            } catch (err) {
                console.error("Gemini Extraction Error Details:", err);
                geminiError = err.message || "Unknown Gemini Error";
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            text: fullText,
            structuredData: structuredData,
            geminiError: geminiError
        });
    } catch (error) {
        console.error('OCR Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f7eb37a4._.js.map