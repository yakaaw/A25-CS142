import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, Button } from '@mui/material';
import { DocumentStats } from '../../types/dashboardTypes';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

interface MyDocumentsStatusProps {
    stats: DocumentStats;
    loading?: boolean;
}

// Helper function to get progress bar color based on approval rate
const getProgressColor = (rate: number): "success" | "warning" | "error" => {
    if (rate > 80) return "success";
    if (rate > 50) return "warning";
    return "error";
};

const MyDocumentsStatus: React.FC<MyDocumentsStatusProps> = ({ stats, loading = false }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>My Documents Status</Typography>
                    <LinearProgress />
                </CardContent>
            </Card>
        );
    }

    const approvalRate = stats.total > 0
        ? Math.round((stats.byStatus.approved / stats.total) * 100)
        : 0;

    return (
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">My Documents Status</Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/bapb/create')}
                    >
                        New BAPB
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Approval Rate</Typography>
                        <Typography variant="body2" fontWeight="bold">{approvalRate}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={approvalRate}
                        color={getProgressColor(approvalRate)}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText', textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                        <Typography variant="caption">Total</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#ff9800', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">{stats.byStatus.pending}</Typography>
                        <Typography variant="caption">Pending</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#4caf50', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">{stats.byStatus.approved}</Typography>
                        <Typography variant="caption">Approved</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#f44336', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold">{stats.byStatus.rejected}</Typography>
                        <Typography variant="caption">Rejected</Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${stats.bapb} BAPB`} size="small" variant="outlined" />
                    <Chip label={`${stats.bapp} BAPP`} size="small" variant="outlined" />
                </Box>
            </CardContent>
        </Card>
    );
};

export default MyDocumentsStatus;
