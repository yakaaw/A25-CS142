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
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ApprovalLog {
  stage: 'vendor_submit' | 'pic_review' | 'direksi_review';
  status: 'pending' | 'approved' | 'rejected';
  actorId: string;
  actorName: string;
  signatureUrl?: string;
  timestamp: string;
  notes?: string;
}

export interface BAPBItem {
  id?: string;
  description: string;
  qty: number;
  unit: string;
  condition?: string;
}

export interface BAPB {
   id?: string;
   vendorId?: string;
   vendorName?: string;
   items?: BAPBItem[];
   status?: 'pending' | 'approved' | 'rejected';
   currentStage?: 'draft' | 'waiting_pic' | 'waiting_direksi' | 'approved' | 'rejected';
   approvalHistory?: ApprovalLog[];
   attachments?: string[];
   isArchived?: boolean;
   archivedAt?: string;
   archivedBy?: string;
   createdAt?: string;
   updatedAt?: string;
   vendorSignatureUrl?: string;
   [key: string]: any;
 }

const COLLECTION_NAME = 'bapb';

export const createBAPB = async (data: Partial<BAPB>, userId: string, userName?: string, userSignatureUrl?: string) => {
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
      vendorId: userId,
      vendorName: userName,
      vendorSignatureUrl: userSignatureUrl,
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

export const getAllBAPB = async (options?: { limit?: number; lastDoc?: any; status?: string; userId?: string; userRole?: string }) => {
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
        let bapbList: BAPB[] = [];

        // Filter out archived documents on client side
        querySnapshot.forEach((d: DocumentSnapshot) => {
            const data = { id: d.id, ...d.data() } as BAPB;
            if (!data.isArchived) {
                bapbList.push(data);
            }
        });


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
    querySnapshot.forEach((d: DocumentSnapshot) => bapbList.push({ id: d.id, ...d.data() } as BAPB));
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

export const approveBAPB = async (id: string, actor: { uid: string, name: string, role: string, signatureUrl?: string }, notes?: string) => {
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

    // Admin can approve at any stage
    if (role === 'admin') {
      if (currentStage === 'waiting_pic') {
        nextStage = 'waiting_direksi';
        const entry: any = {
          stage: 'pic_review',
          status: 'approved',
          actorId: actor.uid,
          actorName: actor.name,
          timestamp: new Date().toISOString()
        };
        if (actor.signatureUrl) entry.signatureUrl = actor.signatureUrl;
        if (notes) entry.notes = notes;
        history.push(entry);
      } else if (currentStage === 'waiting_direksi') {
        nextStage = 'approved';
        newStatus = 'approved';
        const entry: any = {
          stage: 'direksi_review',
          status: 'approved',
          actorId: actor.uid,
          actorName: actor.name,
          timestamp: new Date().toISOString()
        };
        if (actor.signatureUrl) entry.signatureUrl = actor.signatureUrl;
        if (notes) entry.notes = notes;
        history.push(entry);
      }
      authorizedAction = true;
    } else if (currentStage === 'waiting_pic' && role === 'pic_gudang') {
      nextStage = 'waiting_direksi';
      const entry: any = {
        stage: 'pic_review',
        status: 'approved',
        actorId: actor.uid,
        actorName: actor.name,
        timestamp: new Date().toISOString()
      };
      if (actor.signatureUrl) entry.signatureUrl = actor.signatureUrl;
      if (notes) entry.notes = notes;
      history.push(entry);
      authorizedAction = true;
    } else if (currentStage === 'waiting_direksi' && role === 'direksi') {
      nextStage = 'approved';
      newStatus = 'approved';
      const entry: any = {
        stage: 'direksi_review',
        status: 'approved',
        actorId: actor.uid,
        actorName: actor.name,
        timestamp: new Date().toISOString()
      };
      if (actor.signatureUrl) entry.signatureUrl = actor.signatureUrl;
      if (notes) entry.notes = notes;
      history.push(entry);
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

    const entry: any = {
      stage: stage,
      status: 'rejected',
      actorId: actor.uid,
      actorName: actor.name,
      timestamp: new Date().toISOString()
    };
    if (notes) entry.notes = notes;
    history.push(entry);

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

export const archiveBAPB = async (id: string, actorId: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isArchived: true,
      archivedAt: new Date().toISOString(),
      archivedBy: actorId,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error archiving BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const getArchivedBAPB = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isArchived', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const bapbList: BAPB[] = [];
    querySnapshot.forEach((d: DocumentSnapshot) => bapbList.push({ id: d.id, ...d.data() } as BAPB));

    // Sort by archivedAt on client-side
    bapbList.sort((a, b) => {
      const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
      const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
      return dateB - dateA; // descending order
    });

    return { success: true, data: bapbList };
  } catch (error: any) {
    console.error('Error getting archived BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const restoreBAPB = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error restoring BAPB:', error);
    return { success: false, error: error.message };
  }
};

export const deleteBAPB = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    // First check if document is archived
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Document not found' };
    }

    const data = docSnap.data() as BAPB;
    if (!data.isArchived) {
      return { success: false, error: 'Only archived documents can be deleted' };
    }

    // Delete the document permanently
    await import('firebase/firestore').then(({ deleteDoc }) => deleteDoc(docRef));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting BAPB:', error);
    return { success: false, error: error.message };
  }
};


