
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
          } else {
            // Create a new user if they don't exist in firestore
            const newUser: User = {
              id: currentFirebaseUser.uid,
              name: currentFirebaseUser.displayName || 'New User',
              email: currentFirebaseUser.email || '',
              points: 0,
              houseId: '', // Assign later or have a default
              role: 'user',
              avatar: currentFirebaseUser.photoURL || `https://i.pravatar.cc/150?u=${currentFirebaseUser.uid}`,
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
          setLoading(false);
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
