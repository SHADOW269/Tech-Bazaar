
/**
 * Firebase client-side configuration.
 * These values are pulled from environment variables defined in .env.local.
 *
 * MAP YOUR FIREBASE WEB CONFIG TO THESE VARIABLES:
 * apiKey            -> NEXT_PUBLIC_FIREBASE_API_KEY
 * authDomain        -> NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * projectId         -> NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * storageBucket     -> NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * messagingSenderId -> NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * appId             -> NEXT_PUBLIC_FIREBASE_APP_ID
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validates if the Firebase configuration is present and looks correct.
 * Firebase Web API keys always start with 'AIza'.
 */
export const isFirebaseConfigValid = () => {
  return (
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'undefined' &&
    firebaseConfig.apiKey.startsWith('AIza')
  );
};
