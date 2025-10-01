
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, runTransaction, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/data';

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
      setLoading(true); // Start loading when auth state changes

      if (currentFirebaseUser) {
        const userRef = doc(db, 'users', currentFirebaseUser.uid);
        
        // Use onSnapshot for real-time updates
        const userDocUnsubscribe = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
            setLoading(false);
          } else {
            // Create a new user if they don't exist in firestore
            try {
              const counterRef = doc(db, 'metadata', 'userCounter');

              // Atomically generate the next user ID
              const newCustomId = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                const currentCount = counterDoc.exists() ? counterDoc.data()?.count || 0 : 0;
                const newCount = currentCount + 1;
                transaction.set(counterRef, { count: newCount }, { merge: true });
                return `GDGVTU${String(newCount).padStart(3, '0')}`;
              });

              const newUser: User = {
                id: currentFirebaseUser.uid,
                customId: newCustomId,
                name: currentFirebaseUser.displayName || 'New User',
                email: currentFirebaseUser.email || '',
                points: 0,
                role: 'user', // Default role
                avatar: currentFirebaseUser.photoURL || `https://i.pravatar.cc/150?u=${currentFirebaseUser.uid}`,
              };
              await setDoc(userRef, newUser);
              setUser(newUser);
            } catch (e) {
              console.error("Error creating new user:", e);
            } finally {
              setLoading(false);
            }
          }
        }, (error) => {
          console.error("Error listening to user document:", error);
          setUser(null);
          setLoading(false);
        });

        // Return the unsubscribe function for the user document listener
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
