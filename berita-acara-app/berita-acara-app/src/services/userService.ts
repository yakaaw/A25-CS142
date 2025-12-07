import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
    collection,
    doc,
    getDocs,
    updateDoc,
    setDoc,
    deleteDoc
} from 'firebase/firestore';
import app, { db } from '../config/firebase';
import { UserProfile } from '../context/AuthContext';

const COLLECTION_NAME = 'users';

export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const users: UserProfile[] = [];
        // Note: UserProfile doesn't strictly have an ID field in the interface, 
        // but we might need it for updates. We'll cast it for now or update the interface later.
        querySnapshot.forEach((d) => {
            const data = d.data() as UserProfile;
            users.push({ ...data, uid: d.id } as any);
        });
        return { success: true, data: users };
    } catch (error: any) {
        console.error('Error getting users:', error);
        return { success: false, error: error.message };
    }
};

export const updateUserRole = async (uid: string, role: string) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(docRef, { role });
        return { success: true };
    } catch (error: any) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }
};

export const createUser = async (email: string, password: string, userData: { name: string; role: string }) => {
    let secondaryApp;
    try {
        // Create a secondary app instance to avoid signing out the current user
        // Use a unique name to avoid conflicts if called rapidly or not cleaned up
        const appName = `SecondaryApp-${Date.now()}`;
        secondaryApp = initializeApp(app.options, appName);
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const uid = userCredential.user.uid;

        // Create user document in Firestore
        await setDoc(doc(db, COLLECTION_NAME, uid), {
            email,
            name: userData.name,
            role: userData.role,
            createdAt: new Date().toISOString()
        });

        // Sign out from the secondary app
        await signOut(secondaryAuth);

        return { success: true, uid };
    } catch (error: any) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
    } finally {
        if (secondaryApp) {
            try {
                await deleteApp(secondaryApp);
            } catch (e) {
                console.error('Error deleting secondary app:', e);
            }
        }
    }
};

export const updateUserDetails = async (uid: string, updates: Partial<UserProfile>) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(docRef, updates);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating user details:', error);
        return { success: false, error: error.message };
    }
};

export const deleteUser = async (uid: string) => {
    try {
        // Note: This only deletes the user's profile in Firestore.
        // The Auth account will still exist because we cannot delete other users from the client SDK.
        // In a real app, this should be done via a Cloud Function or Admin SDK.
        await deleteDoc(doc(db, COLLECTION_NAME, uid));
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }
};
