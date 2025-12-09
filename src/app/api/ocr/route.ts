import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_VISION_API_KEY;

        if (!apiKey) {
            console.error('GOOGLE_VISION_API_KEY is not configured in environment variables');
            return NextResponse.json({
                error: 'Google Vision API Key is not configured. Please set GOOGLE_VISION_API_KEY in .env.local'
            }, { status: 500 });
        }

        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            return NextResponse.json({
                error: `Google Vision API error: ${errorData.error?.message || 'Failed to process image'}`
            }, { status: response.status });
        }

        const data = await response.json();
        const fullText = data.responses[0]?.fullTextAnnotation?.text || "";

        // Process with Gemini for structured extraction (optional, graceful degradation)
        const geminiKey = process.env.GOOGLE_VISION_API_KEY;

        let structuredData = null;
        let geminiError = null;

        if (geminiKey && fullText) {
            try {
                const { GoogleGenerativeAI } = require("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(geminiKey);

                // Use gemini-2.0-flash-exp
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

            } catch (err: any) {
                console.error("Gemini Extraction Error:", {
                    message: err.message,
                    stack: err.stack,
                    name: err.name
                });
                geminiError = `Gemini extraction failed: ${err.message}`;
                // Continue anyway - OCR text is still useful
            }
        }

        return NextResponse.json({
            text: fullText,
            structuredData: structuredData,
            geminiError: geminiError
        });

    } catch (error: any) {
        console.error('OCR Route Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({
            error: `Internal Server Error: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
