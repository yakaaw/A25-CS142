import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getRoleByName } from '../services/roleService';

export interface UserProfile {
  email: string;
  name?: string;
  role?: string;
  phone?: string;
  address?: string;
  photoURL?: string;
  signatureUrl?: string;
  createdAt?: string;
  uid?: string;
}

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  permissions: string[];
  loading: boolean;
  signup: (email: string, password: string, userData: { name?: string; role?: string }) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, userData: { name?: string; role?: string }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      name: userData.name || '',
      role: userData.role || 'vendor',
      createdAt: new Date().toISOString()
    });
    return userCredential;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data() as UserProfile;
          setUserProfile({ ...userData, uid: user.uid });

          // Fetch permissions based on role
          if (userData.role) {
            const roleResult = await getRoleByName(userData.role);
            if (roleResult.success && roleResult.data) {
              setPermissions(roleResult.data.permissions);
            } else {
              setPermissions([]);
            }
          } else {
            setPermissions([]);
          }
        } else {
          setUserProfile(null);
          setPermissions([]);
        }
      } else {
        setUserProfile(null);
        setPermissions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');

    // Update Firestore
    const docRef = doc(db, 'users', currentUser.uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    // Update local state
    setUserProfile((prev) => prev ? { ...prev, ...data } : null);
  }, [currentUser]);

  const changePassword = useCallback(async (newPassword: string) => {
    if (!currentUser) throw new Error('No user logged in');
    await updatePassword(currentUser, newPassword);
  }, [currentUser]);

  const value: AuthContextValue = useMemo(() => ({
    currentUser,
    userProfile,
    permissions,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    changePassword
  }), [currentUser, userProfile, permissions, loading, updateUserProfile, changePassword]);

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
