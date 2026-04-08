
'use client';

import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Initializes the Firebase app and returns the core SDK instances.
 * This function is safe to call multiple times as it implements the singleton pattern.
 */
export function initializeFirebase() {
  // Return existing app if already initialized
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;
  
  // Validate configuration before attempting initialization
  if (isFirebaseConfigValid()) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e: any) {
      throw new Error(`Firebase failed to initialize: ${e.message}`);
    }
  } else {
    // Provide a helpful error message to guide the user on setting up environment variables
    throw new Error(
      "Firebase Configuration is missing or invalid. " +
      "Please ensure you have created a '.env.local' file in your root directory " +
      "and added your Web App credentials (not Service Account). " +
      "Your API Key should start with 'AIza'."
    );
  }

  return getSdks(firebaseApp);
}

/**
 * Helper to get initialized SDK instances for a given Firebase app.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
