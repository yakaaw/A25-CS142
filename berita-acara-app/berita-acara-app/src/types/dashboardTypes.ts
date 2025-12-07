/**
 * Dashboard Types & Interfaces
 */

export interface DocumentStats {
    total: number;
    bapb: number;
    bapp: number;
    byStatus: {
        pending: number;
        approved: number;
        rejected: number;
    };
    byStage: Record<string, number>;
}

export interface ApprovalMetrics {
    avgApprovalTime: number; // in hours
    pendingCount: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    approvalRate: number; // percentage
}

export interface VendorStat {
    vendorId: string;
    vendorName: string;
    documentCount: number;
    approvalRate: number;
}

export interface TimelineDataPoint {
    month: string;
    bapb: number;
    bapp: number;
    total: number;
}

export interface Activity {
    id: string;
    type: 'created' | 'approved' | 'rejected' | 'updated' | 'archived';
    documentId: string;
    documentNumber: string;
    documentType: 'BAPB' | 'BAPP';
    userId: string;
    userName: string;
    timestamp: string;
    description: string;
}

export interface DateRange {
    start: Date;
    end: Date;
}

export interface PendingApproval {
    id: string;
    documentNumber: string;
    documentType: 'BAPB' | 'BAPP';
    vendorId?: string;
    vendorName?: string;
    currentStage: string;
    createdAt: string;
    daysPending: number;
    isUrgent: boolean;
}
