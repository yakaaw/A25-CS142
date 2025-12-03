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
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface BAPBItem {
  id?: string;
  description: string;
  qty: number;
  unit: string;
  condition?: string;
}

export interface ApprovalLog {
  stage: 'vendor_submit' | 'pic_review' | 'direksi_review';
  status: 'pending' | 'approved' | 'rejected';
  actorId: string;
  actorName: string;
  timestamp: string;
  notes?: string;
}

export interface BAPB {
  id?: string;
  vendorId?: string;
  items?: BAPBItem[];
  status?: 'pending' | 'approved' | 'rejected'; // Global status
  currentStage?: 'draft' | 'waiting_pic' | 'waiting_direksi' | 'approved' | 'rejected';
  approvalHistory?: ApprovalLog[];
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const COLLECTION_NAME = 'bapb';

export const createBAPB = async (data: Partial<BAPB>) => {
  try {
    const initialHistory: ApprovalLog[] = [{
      stage: 'vendor_submit',
      status: 'approved',
      actorId: data.vendorId || 'unknown',
      actorName: 'Vendor', // Ideally fetch name
      timestamp: new Date().toISOString(),
      notes: 'Initial submission'
    }];

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'pending',
      currentStage: 'waiting_pic',
      approvalHistory: initialHistory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } as BAPB };
    }
    return { success: false, error: 'Document not found' };
  } catch (error: any) {
    console.error('Error getting BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const getAllBAPB = async (options?: { limit?: number; lastDoc?: any; status?: string }) => {
  try {
    const constraints: any[] = [orderBy('createdAt', 'desc')];

    if (options?.status && options.status !== 'all') {
      constraints.push(where('status', '==', options.status));
    }

    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    if (options?.lastDoc) {
      constraints.push(startAfter(options.lastDoc));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const querySnapshot = await getDocs(q);
    const bapbList: BAPB[] = [];
    querySnapshot.forEach((d) => bapbList.push({ id: d.id, ...d.data() } as BAPB));

    const lastDoc = querySnapshot.docs.at(-1);

    return {
      success: true,
      data: bapbList,
      lastDoc
    };
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
    querySnapshot.forEach((d) => bapbList.push({ id: d.id, ...d.data() } as BAPB));
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

export const approveBAPB = async (id: string, actor: { uid: string, name: string, role: string }, notes?: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { success: false, error: 'Document not found' };

    const data = docSnap.data() as BAPB;
    const history = data.approvalHistory || [];
    // Logic for multi-stage approval
    const currentStage = data.currentStage; // Assuming currentStage is available from data
    const role = actor.role; // Assuming role is available from actor

    console.log('approveBAPB debug:', {
      currentStage,
      role,
      actor,
      check1: currentStage === 'waiting_pic',
      check2: role === 'pic_gudang',
      condition: currentStage === 'waiting_pic' && role === 'pic_gudang'
    });

    let nextStage = currentStage;
    let newStatus = data.status;
    let authorizedAction = false;

    if (currentStage === 'waiting_pic' && role === 'pic_gudang') {
      nextStage = 'waiting_direksi';
      history.push({
        stage: 'pic_review',
        status: 'approved',
        actorId: actor.uid,
        actorName: actor.name,
        timestamp: new Date().toISOString(),
        notes
      });
      authorizedAction = true;
    } else if (currentStage === 'waiting_direksi' && role === 'direksi') {
      nextStage = 'approved';
      newStatus = 'approved';
      history.push({
        stage: 'direksi_review',
        status: 'approved',
        actorId: actor.uid,
        actorName: actor.name,
        timestamp: new Date().toISOString(),
        notes
      });
      authorizedAction = true;
    }

    if (!authorizedAction) {
      return { success: false, error: 'Unauthorized approval action' };
    }

    await updateDoc(docRef, {
      currentStage: nextStage,
      status: newStatus,
      approvalHistory: history,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error approving BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const rejectBAPB = async (id: string, actor: { uid: string, name: string, role: string }, notes: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { success: false, error: 'Document not found' };

    const data = docSnap.data() as BAPB;
    const history = data.approvalHistory || [];

    let stage: 'pic_review' | 'direksi_review' = 'pic_review';
    if (data.currentStage === 'waiting_direksi') stage = 'direksi_review';

    history.push({
      stage: stage,
      status: 'rejected',
      actorId: actor.uid,
      actorName: actor.name,
      timestamp: new Date().toISOString(),
      notes
    });

    await updateDoc(docRef, {
      currentStage: 'rejected',
      status: 'rejected',
      approvalHistory: history,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting BAPB:', error);
    return { success: false, error: error.message };
  }
};
