import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface RoleData {
    id?: string;
    name: string;
    permissions: string[];
    description?: string;
}

const COLLECTION_NAME = 'roles';

export const createRole = async (data: Omit<RoleData, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error creating role:', error);
        return { success: false, error: error.message };
    }
};

export const updateRole = async (id: string, data: Partial<RoleData>) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating role:', error);
        return { success: false, error: error.message };
    }
};

export const deleteRole = async (id: string) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting role:', error);
        return { success: false, error: error.message };
    }
};

export const getAllRoles = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const roles: RoleData[] = [];
        querySnapshot.forEach((d) => roles.push({ id: d.id, ...d.data() } as RoleData));
        return { success: true, data: roles };
    } catch (error: any) {
        console.error('Error getting roles:', error);
        return { success: false, error: error.message };
    }
};

export const getRoleByName = async (name: string) => {
    try {
        const q = query(collection(db, COLLECTION_NAME), where('name', '==', name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const d = querySnapshot.docs[0];
            return { success: true, data: { id: d.id, ...d.data() } as RoleData };
        }
        return { success: false, error: 'Role not found' };
    } catch (error: any) {
        console.error('Error getting role by name:', error);
        return { success: false, error: error.message };
    }
};
