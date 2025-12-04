import {
    collection,
    doc,
    getDocs,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
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
