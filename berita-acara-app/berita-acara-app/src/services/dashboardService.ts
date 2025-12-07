import { collection, getDocs, query, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BAPB } from './bapbService';
import { BAPP } from './bappService';
import {
    DocumentStats,
    ApprovalMetrics,
    VendorStat,
    TimelineDataPoint,
    Activity,
    DateRange,
    PendingApproval
} from '../types/dashboardTypes';

/**
 * Dashboard Service
 * Provides aggregated statistics and analytics for dashboard
 */

// Helper: Get date range
const getDateRange = (days: number): DateRange => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
};

// Helper: Check if date is in range
const isInDateRange = (dateStr: string, range?: DateRange): boolean => {
    if (!range) return true;
    const date = new Date(dateStr);
    return date >= range.start && date <= range.end;
};

/**
 * Get document statistics
 * @param userId - Current user ID (for vendor filtering)
 * @param userRole - Current user role
 * @param dateRange - Optional date range filter
 */
export const getDocumentStats = async (userId: string, userRole: string, dateRange?: DateRange): Promise<DocumentStats> => {
    try {
        // Fetch all BAPB and BAPP documents
        const [bapbSnapshot, bappSnapshot] = await Promise.all([
            getDocs(collection(db, 'bapb')),
            getDocs(collection(db, 'bapp'))
        ]);

        const bapbDocs: BAPB[] = [];
        const bappDocs: BAPP[] = [];

        bapbSnapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() } as BAPB;
            // Filter by role: vendor sees only their documents
            const isVendorDoc = userRole === 'vendor' ? data.vendorId === userId : true;
            if (!data.isArchived && isInDateRange(data.createdAt || '', dateRange) && isVendorDoc) {
                bapbDocs.push(data);
            }
        });

        bappSnapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() } as BAPP;
            // Filter by role: vendor sees only their documents
            const isVendorDoc = userRole === 'vendor' ? data.vendorId === userId : true;
            if (!data.isArchived && isInDateRange(data.createdAt || '', dateRange) && isVendorDoc) {
                bappDocs.push(data);
            }
        });

        const allDocs = [...bapbDocs, ...bappDocs];

        // Calculate stats
        const byStatus = {
            pending: allDocs.filter(d => d.status === 'pending').length,
            approved: allDocs.filter(d => d.status === 'approved').length,
            rejected: allDocs.filter(d => d.status === 'rejected').length
        };

        const byStage: Record<string, number> = {};
        allDocs.forEach(doc => {
            const stage = doc.currentStage || 'draft';
            byStage[stage] = (byStage[stage] || 0) + 1;
        });

        return {
            total: allDocs.length,
            bapb: bapbDocs.length,
            bapp: bappDocs.length,
            byStatus,
            byStage
        };
    } catch (error) {
        console.error('Error getting document stats:', error);
        return {
            total: 0,
            bapb: 0,
            bapp: 0,
            byStatus: { pending: 0, approved: 0, rejected: 0 },
            byStage: {}
        };
    }
};

/**
 * Get approval metrics
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param dateRange - Optional date range filter
 */
export const getApprovalMetrics = async (userId: string, userRole: string, dateRange?: DateRange): Promise<ApprovalMetrics> => {
    try {
        const [bapbSnapshot, bappSnapshot] = await Promise.all([
            getDocs(collection(db, 'bapb')),
            getDocs(collection(db, 'bapp'))
        ]);

        const allDocs: (BAPB | BAPP)[] = [];

        bapbSnapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() } as BAPB;
            const isVendorDoc = userRole === 'vendor' ? (data.vendorId === userId) : true;
            if (!data.isArchived && isVendorDoc) allDocs.push(data);
        });

        bappSnapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() } as BAPP;
            const isVendorDoc = userRole === 'vendor' ? (data.vendorId === userId) : true;
            if (!data.isArchived && isVendorDoc) allDocs.push(data);
        });

        // Calculate average approval time
        const approvedDocs = allDocs.filter(d => d.status === 'approved' && d.createdAt && d.updatedAt);
        let totalApprovalTime = 0;

        approvedDocs.forEach(doc => {
            const created = new Date(doc.createdAt!).getTime();
            const updated = new Date(doc.updatedAt!).getTime();
            totalApprovalTime += (updated - created) / (1000 * 60 * 60); // convert to hours
        });

        const avgApprovalTime = approvedDocs.length > 0 ? totalApprovalTime / approvedDocs.length : 0;

        // This month stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthDocs = allDocs.filter(d => {
            const updated = new Date(d.updatedAt || d.createdAt || '');
            return updated >= startOfMonth;
        });

        const approvedThisMonth = thisMonthDocs.filter(d => d.status === 'approved').length;
        const rejectedThisMonth = thisMonthDocs.filter(d => d.status === 'rejected').length;
        const pendingCount = allDocs.filter(d => d.status === 'pending').length;

        const totalProcessed = approvedDocs.length + allDocs.filter(d => d.status === 'rejected').length;
        const approvalRate = totalProcessed > 0 ? (approvedDocs.length / totalProcessed) * 100 : 0;

        return {
            avgApprovalTime: Math.round(avgApprovalTime * 10) / 10,
            pendingCount,
            approvedThisMonth,
            rejectedThisMonth,
            approvalRate: Math.round(approvalRate * 10) / 10
        };
    } catch (error) {
        console.error('Error getting approval metrics:', error);
        return {
            avgApprovalTime: 0,
            pendingCount: 0,
            approvedThisMonth: 0,
            rejectedThisMonth: 0,
            approvalRate: 0
        };
    }
};

/**
 * Get vendor statistics
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param limitCount - Max number of vendors to return
 */
export const getVendorStats = async (userId: string, userRole: string, limitCount: number = 10): Promise<VendorStat[]> => {
    try {
        const [bapbSnapshot, bappSnapshot] = await Promise.all([
            getDocs(collection(db, 'bapb')),
            getDocs(collection(db, 'bapp'))
        ]);

        const vendorMap = new Map<string, { count: number; approved: number }>();

        const processDocs = (snapshot: any) => {
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                if (data.isArchived) return;

                // Vendor role: only show their own stats
                if (userRole === 'vendor' && data.vendorId !== userId) return;

                const vendorId = data.vendorId || 'Unknown';
                const existing = vendorMap.get(vendorId) || { count: 0, approved: 0 };

                existing.count++;
                if (data.status === 'approved') existing.approved++;

                vendorMap.set(vendorId, existing);
            });
        };

        processDocs(bapbSnapshot);
        processDocs(bappSnapshot);

        const vendorStats: VendorStat[] = Array.from(vendorMap.entries())
            .map(([vendorId, stats]) => ({
                vendorId,
                // NOTE: Currently using vendorId as display name.
                // Future enhancement: Fetch actual vendor names from vendor collection
                vendorName: vendorId,
                documentCount: stats.count,
                approvalRate: stats.count > 0 ? (stats.approved / stats.count) * 100 : 0
            }))
            .sort((a, b) => b.documentCount - a.documentCount)
            .slice(0, limitCount);

        return vendorStats;
    } catch (error) {
        console.error('Error getting vendor stats:', error);
        return [];
    }
};

/**
 * Get timeline data for charts
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param months - Number of months to show
 */
export const getTimelineData = async (userId: string, userRole: string, months: number = 6): Promise<TimelineDataPoint[]> => {
    try {
        const [bapbSnapshot, bappSnapshot] = await Promise.all([
            getDocs(collection(db, 'bapb')),
            getDocs(collection(db, 'bapp'))
        ]);

        const monthlyData = new Map<string, { bapb: number; bapp: number }>();

        // Initialize last N months
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
            monthlyData.set(key, { bapb: 0, bapp: 0 });
        }

        const processSnapshot = (snapshot: any, type: 'bapb' | 'bapp') => {
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                if (data.isArchived || !data.createdAt) return;

                // Vendor role: only their documents
                if (userRole === 'vendor' && data.vendorId !== userId) return;

                const date = new Date(data.createdAt);
                const key = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });

                if (monthlyData.has(key)) {
                    const existing = monthlyData.get(key)!;
                    existing[type]++;
                }
            });
        };

        processSnapshot(bapbSnapshot, 'bapb');
        processSnapshot(bappSnapshot, 'bapp');

        return Array.from(monthlyData.entries()).map(([month, data]) => ({
            month,
            bapb: data.bapb,
            bapp: data.bapp,
            total: data.bapb + data.bapp
        }));
    } catch (error) {
        console.error('Error getting timeline data:', error);
        return [];
    }
};

/**
 * Helper: Get activity type from document data
 */
const getActivityType = (data: any, lastApproval: any): Activity['type'] => {
    if (data.isArchived) return 'archived';
    if (data.status === 'approved') return 'approved';
    if (data.status === 'rejected') return 'rejected';
    if (lastApproval) return 'updated';
    return 'created';
};

/**
 * Helper: Get activity description
 */
const getActivityDescription = (type: Activity['type'], docType: 'BAPB' | 'BAPP', docId: string): string => {
    const actionMap: Record<Activity['type'], string> = {
        created: 'Created',
        approved: 'Approved',
        rejected: 'Rejected',
        updated: 'Updated',
        archived: 'Archived'
    };
    const action = actionMap[type] || 'Updated';
    return `${action} ${docType} ${docId}`;
};

/**
 * Get recent activities
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param limitCount - Max number of activities
 */
export const getRecentActivities = async (userId: string, userRole: string, limitCount: number = 10): Promise<Activity[]> => {
    try {
        const [bapbSnapshot, bappSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'bapb'), orderBy('updatedAt', 'desc'), firestoreLimit(limitCount))),
            getDocs(query(collection(db, 'bapp'), orderBy('updatedAt', 'desc'), firestoreLimit(limitCount)))
        ]);

        const activities: Activity[] = [];

        const processSnapshot = (snapshot: any, docType: 'BAPB' | 'BAPP') => {
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                if (data.isArchived) return;

                // Vendor role: only their documents
                if (userRole === 'vendor' && data.vendorId !== userId) return;

                const lastApproval = data.approvalHistory?.[data.approvalHistory.length - 1];
                const type = getActivityType(data, lastApproval);

                activities.push({
                    id: doc.id,
                    type,
                    documentId: doc.id,
                    documentNumber: doc.id,
                    documentType: docType,
                    userId: lastApproval?.actorId || 'system',
                    userName: lastApproval?.actorName || 'System',
                    timestamp: data.updatedAt || data.createdAt || new Date().toISOString(),
                    description: getActivityDescription(type, docType, doc.id)
                });
            });
        };

        processSnapshot(bapbSnapshot, 'BAPB');
        processSnapshot(bappSnapshot, 'BAPP');

        // Sort activities by timestamp (most recent first)
        // Using array copy to avoid mutating original array
        return [...activities]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limitCount);
    } catch (error) {
        console.error('Error getting recent activities:', error);
        return [];
    }
};

/**
 * Get pending approvals for current user
 */
export const getPendingApprovals = async (userId: string, userRole: string): Promise<PendingApproval[]> => {
    try {
        const [bapbSnapshot, bappSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'bapb'), where('status', '==', 'pending'))),
            getDocs(query(collection(db, 'bapp'), where('status', '==', 'pending')))
        ]);

        const pendingApprovals: PendingApproval[] = [];

        const processSnapshot = (snapshot: any, docType: 'BAPB' | 'BAPP') => {
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                if (data.isArchived) return;

                // Check if current user needs to approve based on stage and role
                const stage = data.currentStage;
                const needsApproval =
                    (stage === 'waiting_pic' && (userRole === 'pic_gudang' || userRole === 'pic_pemesan')) ||
                    (stage === 'waiting_direksi' && userRole === 'direksi') ||
                    userRole === 'admin';

                if (!needsApproval) return;

                const createdAt = new Date(data.createdAt || Date.now());
                const now = new Date();
                const daysPending = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

                pendingApprovals.push({
                    id: doc.id,
                    documentNumber: doc.id,
                    documentType: docType,
                    vendorId: data.vendorId,
                    // NOTE: Currently using vendorId as display name.
                    // Future enhancement: Fetch actual vendor name from vendor collection
                    vendorName: data.vendorId,
                    currentStage: stage,
                    createdAt: data.createdAt,
                    daysPending,
                    isUrgent: daysPending > 7
                });
            });
        };

        processSnapshot(bapbSnapshot, 'BAPB');
        processSnapshot(bappSnapshot, 'BAPP');

        return pendingApprovals.sort((a, b) => b.daysPending - a.daysPending);
    } catch (error) {
        console.error('Error getting pending approvals:', error);
        return [];
    }
};
