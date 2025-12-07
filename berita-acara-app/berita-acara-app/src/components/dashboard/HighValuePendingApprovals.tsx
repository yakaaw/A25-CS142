import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { PendingApproval } from '../../types/dashboardTypes';
import { useNavigate } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface HighValuePendingApprovalsProps {
    approvals: PendingApproval[];
    loading?: boolean;
}

const HighValuePendingApprovals: React.FC<HighValuePendingApprovalsProps> = ({ approvals, loading = false }) => {
    const navigate = useNavigate();

    // Filter for high priority: Urgent (>7 days) or BAPP (Payment related)
    const highPriorityDocs = approvals.filter(doc => doc.isUrgent || doc.documentType === 'BAPP');

    // Sort by urgency then by type
    const sortedDocs = [...highPriorityDocs].sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return 0;
    }).slice(0, 5); // Show top 5

    const handleViewDocument = (approval: PendingApproval) => {
        const path = approval.documentType === 'BAPB' ? `/bapb/${approval.id}` : `/bapp/${approval.id}`;
        navigate(path);
    };

    if (loading) return null;
    if (sortedDocs.length === 0) return null;

    return (
        <Card elevation={3} sx={{ borderLeft: '6px solid #f44336' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <WarningIcon color="error" />
                    <Typography variant="h6" fontWeight="bold">Action Required: High Priority</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These documents require your immediate attention due to urgency or financial impact.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sortedDocs.map((doc) => (
                        <Box key={doc.id} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{doc.documentNumber}</Typography>
                                        <Chip
                                            label={doc.documentType}
                                            size="small"
                                            color={doc.documentType === 'BAPP' ? 'warning' : 'primary'}
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                        {doc.isUrgent && (
                                            <Chip
                                                label={`${doc.daysPending} days`}
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                            />
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Vendor: {doc.vendorName}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => handleViewDocument(doc)}
                                >
                                    Review
                                </Button>
                            </Box>
                            {doc.documentType === 'BAPP' && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                    <MonetizationOnIcon fontSize="small" color="action" />
                                    <Typography variant="caption" color="text.secondary">
                                        Payment Document - Requires careful review
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default HighValuePendingApprovals;
