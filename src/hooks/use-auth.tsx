
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);
      setLoading(true);

      if (currentFirebaseUser) {
        const userRef = doc(db, 'users', currentFirebaseUser.uid);
        
        const userDocUnsubscribe = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
            setLoading(false);
          } else {
            // If the user document does not exist, create it.
            const newUser: User = {
                id: currentFirebaseUser.uid,
                customId: 'pending', // Assign a temporary placeholder ID
                name: currentFirebaseUser.displayName || 'New User',
                email: currentFirebaseUser.email || '',
                points: 0,
                role: 'user', // Default role
                avatar: currentFirebaseUser.photoURL || `https://i.pravatar.cc/150?u=${currentFirebaseUser.uid}`,
            };

            // Directly create the user document. The custom ID can be backfilled by an admin.
            setDoc(userRef, newUser)
              .then(() => {
                  setUser(newUser);
              })
              .catch((serverError) => {
                  const permissionError = new FirestorePermissionError({
                      path: userRef.path,
                      operation: 'create',
                      requestResourceData: newUser
                  } satisfies SecurityRuleContext);
                  errorEmitter.emit('permission-error', permissionError);
              })
              .finally(() => {
                  setLoading(false);
              });
          }
        }, (error) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'get'
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setUser(null);
          setLoading(false);
        });

        return () => userDocUnsubscribe();

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => authUnsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
