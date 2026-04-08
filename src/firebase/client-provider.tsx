
'use client';

import React, { useMemo, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Key, Terminal, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [initError, setInitError] = useState<Error | null>(null);

  const firebaseServices = useMemo(() => {
    try {
      return initializeFirebase();
    } catch (e: any) {
      setInitError(e);
      return null;
    }
  }, []);

  if (initError || !firebaseServices) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-2xl w-full shadow-2xl border-destructive/20 overflow-hidden">
          <div className="h-2 bg-destructive w-full" />
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Firebase Setup Required</CardTitle>
            </div>
            <CardDescription className="text-base">
              The application couldn't start because your Firebase credentials are missing or invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
              <Terminal className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                {initError?.message || "Missing Web App credentials."}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Configuration Steps
                </h4>
                <Button variant="link" size="sm" asChild className="text-primary h-auto p-0">
                  <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer">
                    Open Console <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
              
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li className="text-muted-foreground">Go to <b>Project Settings</b> in the Firebase Console.</li>
                <li className="text-muted-foreground">Select your <b>Web App</b> (look for the <code>&lt;/&gt;</code> icon).</li>
                <li className="text-muted-foreground">Copy the <code>firebaseConfig</code> object.</li>
                <li className="text-muted-foreground">Create a file named <code>.env.local</code> in your project's root.</li>
              </ol>
              
              <div className="relative group">
                <div className="absolute -top-3 right-3 px-2 py-0.5 bg-slate-800 text-[10px] text-slate-400 rounded border border-slate-700">
                  .env.local
                </div>
                <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                  <span className="text-slate-500"># Use your Web App config, NOT a service account</span><br/>
                  NEXT_PUBLIC_FIREBASE_API_KEY=<span className="text-emerald-400">AIza...</span><br/>
                  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<span className="text-emerald-400">your-app.firebaseapp.com</span><br/>
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID=<span className="text-emerald-400">your-project-id</span><br/>
                  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<span className="text-emerald-400">your-app.appspot.com</span><br/>
                  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<span className="text-emerald-400">123456789</span><br/>
                  NEXT_PUBLIC_FIREBASE_APP_ID=<span className="text-emerald-400">1:123:web:abc...</span>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
