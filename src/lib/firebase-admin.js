import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let serviceAccount = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  let keyStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  // If the string is wrapped in single quotes, remove them
  if (keyStr.startsWith("'") && keyStr.endsWith("'")) {
    keyStr = keyStr.slice(1, -1);
  }

  try {
    serviceAccount = JSON.parse(keyStr);
  } catch (err) {
    try {
      // Try base64 decoding if standard JSON parse fails
      const decoded = Buffer.from(keyStr, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    } catch (e2) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY both as raw JSON and as Base64.");
    }
  }
}

if (serviceAccount && serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminDb = serviceAccount ? getFirestore() : null;
export const adminAuth = serviceAccount ? getAuth() : null;
