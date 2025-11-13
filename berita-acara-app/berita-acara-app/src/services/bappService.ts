import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface BAPP {
  id?: string;
  vendorId?: string;
  workDetails?: any;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const COLLECTION_NAME = 'bapp';

export const createBAPP = async (data: Partial<BAPP>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error creating BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const getBAPPById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...(docSnap.data() as DocumentData) } };
    }
    return { success: false, error: 'Document not found' };
  } catch (error: any) {
    console.error('Error getting BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const getAllBAPP = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const bappList: BAPP[] = [];
    querySnapshot.forEach((d) => bappList.push({ id: d.id, ...(d.data() as DocumentData) }));
    return { success: true, data: bappList };
  } catch (error: any) {
    console.error('Error getting BAPP list:', error);
    return { success: false, error: error.message };
  }
};

export const getBAPPByVendor = async (vendorId: string) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('vendorId', '==', vendorId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const bappList: BAPP[] = [];
    querySnapshot.forEach((d) => bappList.push({ id: d.id, ...(d.data() as DocumentData) }));
    return { success: true, data: bappList };
  } catch (error: any) {
    console.error('Error getting BAPP by vendor:', error);
    return { success: false, error: error.message };
  }
};

export const updateBAPP = async (id: string, data: Partial<BAPP>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const approveBAPP = async (id: string, approverData: { userId: string; name?: string }) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: 'approved',
      approvedBy: approverData.userId,
      approvedByName: approverData.name || '',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error approving BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const rejectBAPP = async (id: string, rejectionReason: string, rejecterData: { userId: string; name?: string }) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectedBy: rejecterData.userId,
      rejectedByName: rejecterData.name || '',
      rejectionReason,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting BAPP:', error);
    return { success: false, error: error.message };
  }
};
