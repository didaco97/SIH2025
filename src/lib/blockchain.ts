
/**
 * Generates a SHA-256 hash for the given data string.
 * This simulates storing a record on a blockchain by creating a verifiable cryptographic hash
 * of the report content or URL.
 */
export async function generateBlockchainHash(data: string): Promise<string> {
    // Encodes the data string into a Uint8Array
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Computes the SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Convert the buffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
