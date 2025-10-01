"use client";

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client component that will listen for Firestore permission errors
// and throw them as uncaught exceptions to be picked up by Next.js's overlay.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throw the error so Next.js development overlay can pick it up.
      // In production, you might want to log this to a service like Sentry.
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          throw error;
        }, 0);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything to the DOM
  return null;
}
