import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

interface SystemOverviewProps {
    totalDocs: number;
    pendingDocs: number;
    loading?: boolean;
}

const SystemOverview: React.FC<SystemOverviewProps> = ({ totalDocs, pendingDocs, loading = false }) => {
    // Mock data for system health - in a real app this would come from a service
    const systemHealth = [
        { name: 'Database', status: 'healthy', latency: '24ms' },
        { name: 'Storage', status: 'healthy', usage: '45%' },
        { name: 'Auth Service', status: 'healthy', uptime: '99.9%' }
    ];

    return (
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>System Overview</Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}><StorageIcon /></Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{totalDocs}</Typography>
                            <Typography variant="caption" color="text.secondary">Total Documents</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: pendingDocs > 10 ? 'warning.main' : 'success.main' }}>
                            {pendingDocs > 10 ? <WarningIcon /> : <CheckCircleIcon />}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{pendingDocs}</Typography>
                            <Typography variant="caption" color="text.secondary">Pending Actions</Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>System Health</Typography>
                <List dense>
                    {systemHealth.map((item) => (
                        <ListItem key={item.name}>
                            <ListItemAvatar>
                                <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemAvatar>
                            <ListItemText
                                primary={item.name}
                                secondary={item.latency || item.usage || item.uptime}
                            />
                            <Typography variant="caption" color="success.main" fontWeight="bold">
                                OPERATIONAL
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default SystemOverview;
