import { db } from '../config/firebase';
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

export interface BAPPWorkDetail {
  description: string;
  hours?: number;
  notes?: string;
}

export interface ApprovalLog {
  stage: 'vendor_submit' | 'pic_review' | 'direksi_review';
  status: 'pending' | 'approved' | 'rejected';
  actorId: string;
  actorName: string;
  signatureUrl?: string;
  timestamp: string;
  notes?: string;
}

export interface BAPP {
  id?: string;
  vendorId?: string;

  // Project & Contract Info
  contractNumber?: string; // Nomor Kontrak/PO
  projectName?: string; // Nama Pekerjaan
  startDate?: string; // Tanggal Mulai Proyek
  endDate?: string; // Tanggal Selesai Proyek

  // Parties Info (Snapshot at creation time)
  party1?: { // Pelaksana (Vendor)
    name: string;
    position: string;
    companyName: string;
    address: string;
  };
  party2?: { // Pemberi Kerja (Klien)
    name: string;
    position: string;
    companyName: string;
    address: string;
  };

  workDetails?: BAPPWorkDetail[];
  status?: 'pending' | 'approved' | 'rejected';
  currentStage?: 'draft' | 'waiting_pic' | 'waiting_direksi' | 'approved' | 'rejected';
  approvalHistory?: ApprovalLog[];
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const COLLECTION_NAME = 'bapp';

export const createBAPP = async (data: Partial<BAPP>) => {
  try {
    const initialHistory: ApprovalLog[] = [{
      stage: 'vendor_submit',
      status: 'approved',
      actorId: data.vendorId || 'unknown',
      actorName: 'Vendor',
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
    console.error('Error creating BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const updateBAPP = async (id: string, data: Partial<BAPP>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const approveBAPP = async (id: string, actor: { uid: string, name: string, role: string, signatureUrl?: string }, notes?: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { success: false, error: 'Document not found' };

    const data = docSnap.data() as BAPP;
    const history = data.approvalHistory || [];
    const currentStage = data.currentStage;
    const role = actor.role;

    let nextStage: string | undefined;
    let newStatus = data.status;
    let authorizedAction = false;

    // Admin can approve at any stage
    if (role === 'admin') {
      if (currentStage === 'waiting_pic') {
        nextStage = 'waiting_direksi';
        history.push({
          stage: 'pic_review',
          status: 'approved',
          actorId: actor.uid,
          actorName: actor.name,
          signatureUrl: actor.signatureUrl,
          timestamp: new Date().toISOString(),
          notes
        });
      } else if (currentStage === 'waiting_direksi') {
        nextStage = 'approved';
        newStatus = 'approved';
        history.push({
          stage: 'direksi_review',
          status: 'approved',
          actorId: actor.uid,
          actorName: actor.name,
          signatureUrl: actor.signatureUrl,
          timestamp: new Date().toISOString(),
          notes
        });
      }
      authorizedAction = true;
    } else if (currentStage === 'waiting_pic' && role === 'pic_pemesan') {
      nextStage = 'waiting_direksi';
      history.push({
        stage: 'pic_review',
        status: 'approved',
        actorId: actor.uid,
        actorName: actor.name,
        signatureUrl: actor.signatureUrl,
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
        signatureUrl: actor.signatureUrl,
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
    console.error('Error approving BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const rejectBAPP = async (id: string, actor: { uid: string, name: string, role: string }, notes: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { success: false, error: 'Document not found' };

    const data = docSnap.data() as BAPP;
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
    console.error('Error rejecting BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const getBAPPById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } as BAPP };
    }
    return { success: false, error: 'Document not found' };
  } catch (error: any) {
    console.error('Error getting BAPP:', error);
    return { success: false, error: error.message };
  }
};

export const getAllBAPP = async (options?: { limit?: number; lastDoc?: any; status?: string }) => {
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
    const bappList: BAPP[] = [];
    querySnapshot.forEach((d: DocumentSnapshot) => bappList.push({ id: d.id, ...d.data() } as BAPP));

    const lastDoc = querySnapshot.docs.at(-1);

    return {
      success: true,
      data: bappList,
      lastDoc
    };
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
    querySnapshot.forEach((d: DocumentSnapshot) => bappList.push({ id: d.id, ...d.data() } as BAPP));
    return { success: true, data: bappList };
  } catch (error: any) {
    console.error('Error getting BAPP by vendor:', error);
    return { success: false, error: error.message };
  }
};

