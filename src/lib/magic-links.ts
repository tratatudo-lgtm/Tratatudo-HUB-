/**
 * Helper to generate a magic link for a client.
 * This should typically be called from an admin dashboard or a backend process.
 */
export async function generateMagicLink(clientId: number): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch('/api/magic-link/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error generating magic link:', error);
    return { ok: false, error: error.message };
  }
}
