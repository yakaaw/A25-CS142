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

export interface BAPB {
  id?: string;
  vendorId?: string;
  items?: any[];
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const COLLECTION_NAME = 'bapb';

export const createBAPB = async (data: Partial<BAPB>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error creating BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const getBAPBById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...(docSnap.data() as DocumentData) } };
    }
    return { success: false, error: 'Document not found' };
  } catch (error: any) {
    console.error('Error getting BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const getAllBAPB = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const bapbList: BAPB[] = [];
    querySnapshot.forEach((d) => bapbList.push({ id: d.id, ...(d.data() as DocumentData) }));
    return { success: true, data: bapbList };
  } catch (error: any) {
    console.error('Error getting BAPB list:', error);
    return { success: false, error: error.message };
  }
};

export const getBAPBByVendor = async (vendorId: string) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('vendorId', '==', vendorId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const bapbList: BAPB[] = [];
    querySnapshot.forEach((d) => bapbList.push({ id: d.id, ...(d.data() as DocumentData) }));
    return { success: true, data: bapbList };
  } catch (error: any) {
    console.error('Error getting BAPB by vendor:', error);
    return { success: false, error: error.message };
  }
};

export const updateBAPB = async (id: string, data: Partial<BAPB>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const approveBAPB = async (id: string, approverData: { userId: string; name?: string }) => {
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
    console.error('Error approving BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const rejectBAPB = async (id: string, rejectionReason: string, rejecterData: { userId: string; name?: string }) => {
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
    console.error('Error rejecting BAPB:', error);
    return { success: false, error: error.message };
  }
};
