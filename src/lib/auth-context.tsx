import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestore-errors';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          console.log('User authenticated:', user.email);
          // Fetch or create profile
          const userDoc = doc(db, 'users', user.uid);
          let snap;
          try {
            snap = await getDoc(userDoc);
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
            return;
          }
          
          if (!snap.exists()) {
            const newProfile = {
              uid: user.uid,
              name: user.displayName || 'Utilisateur',
              email: user.email,
              role: user.email === 'joe.kofisallc@gmail.com' ? 'super_admin' : 'member',
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userDoc, newProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
              return;
            }
            setProfile(newProfile);
          } else {
            setProfile(snap.data());
          }

          // Listen for profile changes
          onSnapshot(userDoc, (doc) => {
            setProfile(doc.data());
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          });
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
