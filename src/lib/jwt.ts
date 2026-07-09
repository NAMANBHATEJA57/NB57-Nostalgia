const secretKey = process.env.SESSION_SECRET || 'super-secret-fallback-key-replace-me-in-production';
const encoder = new TextEncoder();

export type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: Date;
};

// Helper: encode ArrayBuffer to Base64URL string (Edge safe)
function base64urlEncode(buffer: ArrayBuffer | Uint8Array): string {
  let str = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper: decode Base64URL string to Uint8Array (Edge safe)
function base64urlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper: get HMAC-SHA256 CryptoKey
async function getCryptoKey() {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function encrypt(payload: SessionPayload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Set iat and exp (7 days)
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 7 * 24 * 60 * 60;
  const fullPayload = { ...payload, iat, exp };

  const encodedHeader = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64urlEncode(encoder.encode(JSON.stringify(fullPayload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  
  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
  
  const encodedSignature = base64urlEncode(signatureBuffer);
  return `${dataToSign}.${encodedSignature}`;
}

export async function decrypt(session: string | undefined = '') {
  if (!session) return null;
  
  const parts = session.split('.');
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;
  
  try {
    const signatureBuffer = base64urlDecode(encodedSignature);
    const key = await getCryptoKey();
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer as any,
      encoder.encode(dataToVerify)
    );
    
    if (!isValid) return null;
    
    const payloadStr = new TextDecoder().decode(base64urlDecode(encodedPayload));
    const payload = JSON.parse(payloadStr);
    
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}
