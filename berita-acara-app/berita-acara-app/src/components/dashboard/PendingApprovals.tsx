import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    IconButton,
    Tooltip
} from '@mui/material';
import { Visibility as VisibilityIcon, Warning as WarningIcon } from '@mui/icons-material';
import { PendingApproval } from '../../types/dashboardTypes';
import { useNavigate } from 'react-router-dom';

interface PendingApprovalsProps {
    approvals: PendingApproval[];
    loading?: boolean;
    title?: string;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ approvals, loading = false, title = "Pending Your Approval" }) => {
    const navigate = useNavigate();

    const handleViewDocument = (approval: PendingApproval) => {
        const path = approval.documentType === 'BAPB' ? `/bapb/${approval.id}` : `/bapp/${approval.id}`;
        navigate(path);
    };

    const getStageLabel = (stage: string) => {
        switch (stage) {
            case 'waiting_pic':
                return 'Waiting PIC';
            case 'waiting_direksi':
                return 'Waiting Direksi';
            case 'draft':
                return 'Draft';
            default:
                return stage;
        }
    };

    if (loading) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Pending Your Approval</Typography>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">Loading...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (approvals.length === 0) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Pending Your Approval</Typography>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No pending approvals</Typography>
                        <Typography variant="caption" color="text.secondary">
                            You're all caught up! 🎉
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card elevation={2}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{title}</Typography>
                    <Chip
                        label={`${approvals.length} pending`}
                        color="warning"
                        size="small"
                    />
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Document</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Vendor</TableCell>
                                <TableCell>Stage</TableCell>
                                <TableCell align="center">Days</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {approvals.map((approval) => (
                                <TableRow
                                    key={approval.id}
                                    hover
                                    sx={{
                                        '&:hover': { bgcolor: 'action.hover' },
                                        bgcolor: approval.isUrgent ? 'error.lighter' : 'inherit'
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {approval.isUrgent && (
                                                <Tooltip title="Urgent - Over 7 days">
                                                    <WarningIcon color="error" fontSize="small" />
                                                </Tooltip>
                                            )}
                                            <Typography variant="body2">{approval.documentNumber}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={approval.documentType}
                                            size="small"
                                            color={approval.documentType === 'BAPB' ? 'primary' : 'secondary'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                            {approval.vendorName || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStageLabel(approval.currentStage)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography
                                            variant="body2"
                                            color={approval.isUrgent ? 'error' : 'text.secondary'}
                                            fontWeight={approval.isUrgent ? 600 : 400}
                                        >
                                            {approval.daysPending}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewDocument(approval)}
                                            color="primary"
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default PendingApprovals;
