import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Avatar,
    Divider,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Cancel as CancelIcon,
    RadioButtonUnchecked as RadioButtonUncheckedIcon,
    VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

interface ApprovalLog {
    stage: string;
    status: 'pending' | 'approved' | 'rejected';
    actorName: string;
    signatureUrl?: string;
    timestamp: string;
    notes?: string;
}

interface ApprovalTimelineProps {
    currentStage?: string;
    approvalHistory?: ApprovalLog[];
    isBAPP?: boolean;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ currentStage, approvalHistory = [], isBAPP = false }) => {
    const STAGES = [
        { id: 'vendor_submit', label: 'Vendor Submission' },
        { id: 'pic_review', label: isBAPP ? 'Review PIC Pemesan' : 'Review PIC Gudang' },
        { id: 'direksi_review', label: 'Approval Direksi' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />;
            case 'rejected':
                return <CancelIcon sx={{ color: 'error.main', fontSize: 32 }} />;
            case 'current':
                return <ScheduleIcon sx={{ color: 'primary.main', fontSize: 32 }} />;
            default:
                return <RadioButtonUncheckedIcon sx={{ color: 'grey.300', fontSize: 32 }} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'success.light';
            case 'rejected':
                return 'error.light';
            case 'current':
                return 'primary.light';
            default:
                return 'grey.100';
        }
    };

    return (
        <Box sx={{ py: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Status Approval
            </Typography>
            <Box sx={{ position: 'relative' }}>
                {/* Vertical Line */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 15,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor: 'grey.200',
                        zIndex: 0,
                    }}
                />

                <Stack spacing={3}>
                    {STAGES.map((stage) => {
                        const log = approvalHistory.find((h) => h.stage === stage.id);
                        const isCompleted = !!log;
                        const isCurrent =
                            !isCompleted &&
                            ((stage.id === 'pic_review' && currentStage === 'waiting_pic') ||
                                (stage.id === 'direksi_review' && currentStage === 'waiting_direksi'));

                        let status = 'upcoming';
                        if (log) status = log.status;
                        else if (isCurrent) status = 'current';

                        return (
                            <Paper
                                key={stage.id}
                                elevation={status === 'current' ? 3 : 1}
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    gap: 2,
                                    bgcolor: status === 'current' ? getStatusColor(status) : 'background.paper',
                                    position: 'relative',
                                    zIndex: 1,
                                    border: log?.signatureUrl ? '2px solid' : 'none',
                                    borderColor: log?.signatureUrl ? 'success.main' : 'transparent',
                                }}
                            >
                                <Avatar sx={{ bgcolor: 'background.paper', width: 32, height: 32 }}>
                                    {getStatusIcon(status)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color={status === 'current' ? 'primary.main' : 'text.primary'}
                                        >
                                            {stage.label}
                                        </Typography>
                                        {log?.signatureUrl && (
                                            <VerifiedUserIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                        )}
                                    </Stack>

                                    {log && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Oleh: <strong>{log.actorName}</strong>
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(log.timestamp).toLocaleString('id-ID')}
                                            </Typography>

                                            {log.notes && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                    "{log.notes}"
                                                </Typography>
                                            )}

                                            {/* Digital Signature Display */}
                                            {log.signatureUrl && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Divider sx={{ mb: 1 }} />
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box>
                                                            <Typography variant="caption" color="success.main" fontWeight={600} display="block" gutterBottom>
                                                                ✓ Ditandatangani Secara Digital
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    border: '1px solid',
                                                                    borderColor: 'success.main',
                                                                    borderRadius: 1,
                                                                    bgcolor: 'background.paper',
                                                                    display: 'inline-block',
                                                                }}
                                                            >
                                                                <img
                                                                    src={log.signatureUrl}
                                                                    alt={`Tanda Tangan ${log.actorName}`}
                                                                    style={{
                                                                        maxWidth: '200px',
                                                                        maxHeight: '60px',
                                                                        display: 'block',
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                                {log.actorName}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                    {status === 'current' && (
                                        <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                                            Menunggu persetujuan...
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
};

export default ApprovalTimeline;
