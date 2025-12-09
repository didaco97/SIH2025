
async function testConnection() {
    console.log("Testing OCR API Connection...");
    try {
        const response = await fetch("http://localhost:3000/api/ocr", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // Sending a tiny invalid base64 image just to reach the API and see it try to call Google
            body: JSON.stringify({ image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Success! API responded with:", data);
        } else {
            console.log(`❌ API Error (${response.status}):`, data);
        }
    } catch (error) {
        console.error("❌ Connection Failed:", error.message);
    }
}

testConnection();
