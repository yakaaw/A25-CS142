import React from 'react';
import { CheckCircle, Clock, XCircle, Circle } from 'lucide-react';

interface ApprovalLog {
    stage: string;
    status: 'pending' | 'approved' | 'rejected';
    actorName: string;
    timestamp: string;
    notes?: string;
}

interface ApprovalTimelineProps {
    currentStage?: string;
    approvalHistory?: ApprovalLog[];
}

const STAGES = [
    { id: 'vendor_submit', label: 'Vendor Submission' },
    { id: 'pic_review', label: 'Review PIC Gudang' },
    { id: 'direksi_review', label: 'Approval Direksi' }
];

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ currentStage, approvalHistory = [] }) => {
    // Helper functions removed as they were unused

    return (
        <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Status Approval</h3>
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-2.5 top-0 h-full w-0.5 bg-gray-200 -z-10" />

                <div className="space-y-6">
                    {STAGES.map((stage, index) => {
                        const log = approvalHistory.find(h => h.stage === stage.id);
                        const isCompleted = !!log;
                        const isCurrent = !isCompleted && (
                            (stage.id === 'pic_review' && currentStage === 'waiting_pic') ||
                            (stage.id === 'direksi_review' && currentStage === 'waiting_direksi')
                        );

                        let status = 'upcoming';
                        if (log) status = log.status;
                        else if (isCurrent) status = 'current';

                        return (
                            <div key={stage.id} className="flex gap-4 items-start bg-white p-2 rounded-lg">
                                <div className="mt-1 bg-white">
                                    {status === 'approved' && <CheckCircle className="text-green-600 fill-green-100" size={24} />}
                                    {status === 'rejected' && <XCircle className="text-red-600 fill-red-100" size={24} />}
                                    {status === 'current' && <Clock className="text-blue-600 animate-pulse" size={24} />}
                                    {status === 'upcoming' && <Circle className="text-gray-300" size={24} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-medium ${status === 'current' ? 'text-blue-600' : 'text-gray-900'}`}>
                                        {stage.label}
                                    </h4>
                                    {log && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            <p>Oleh: <span className="font-medium text-gray-700">{log.actorName}</span></p>
                                            <p>{new Date(log.timestamp).toLocaleString('id-ID')}</p>
                                            {log.notes && (
                                                <p className="mt-1 text-gray-600 italic">"{log.notes}"</p>
                                            )}
                                        </div>
                                    )}
                                    {status === 'current' && (
                                        <p className="text-sm text-blue-500 mt-1">Menunggu persetujuan...</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ApprovalTimeline;
