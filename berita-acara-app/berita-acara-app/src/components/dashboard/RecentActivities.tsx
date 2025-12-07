import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Box, Chip } from '@mui/material';
import { CheckCircle, Cancel, Edit, Add, Archive as ArchiveIcon, Schedule } from '@mui/icons-material';
import { Activity } from '../../types/dashboardTypes';
import { useNavigate } from 'react-router-dom';

interface RecentActivitiesProps {
    activities: Activity[];
    loading?: boolean;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, loading = false }) => {
    const navigate = useNavigate();

    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'approved':
                return <CheckCircle />;
            case 'rejected':
                return <Cancel />;
            case 'archived':
                return <ArchiveIcon />;
            case 'created':
                return <Add />;
            case 'updated':
                return <Schedule />;
            default:
                return <Edit />;
        }
    };

    const getAvatarColors = (type: Activity['type']): { bgcolor: string; color: string } => {
        switch (type) {
            case 'approved':
                return { bgcolor: 'success.light', color: 'success.main' };
            case 'rejected':
                return { bgcolor: 'error.light', color: 'error.main' };
            case 'archived':
                return { bgcolor: 'grey.200', color: 'grey.600' };
            case 'created':
                return { bgcolor: 'primary.light', color: 'primary.main' };
            case 'updated':
                return { bgcolor: 'warning.light', color: 'warning.main' };
            default:
                return { bgcolor: 'warning.light', color: 'warning.main' };
        }
    };

    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const handleActivityClick = (activity: Activity) => {
        const path = activity.documentType === 'BAPB' ? `/bapb/${activity.documentId}` : `/bapp/${activity.documentId}`;
        navigate(path);
    };

    if (loading) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">Loading...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No recent activities</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {activities.map((activity) => (
                        <ListItem key={activity.id} disablePadding>
                            <ListItemButton onClick={() => handleActivityClick(activity)}>
                                <ListItemAvatar>
                                    <Avatar sx={{
                                        bgcolor: getAvatarColors(activity.type).bgcolor,
                                        color: getAvatarColors(activity.type).color
                                    }}>
                                        {getIcon(activity.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" component="span">
                                                <strong>{activity.userName}</strong> {activity.type}
                                            </Typography>
                                            <Chip
                                                label={activity.documentType}
                                                size="small"
                                                color={activity.documentType === 'BAPB' ? 'primary' : 'secondary'}
                                                sx={{ height: 20 }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" component="span">
                                                {activity.documentNumber}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                                                • {getRelativeTime(activity.timestamp)}
                                            </Typography>
                                        </Box>
                                    }
                                    primaryTypographyProps={{ component: 'div' }}
                                    secondaryTypographyProps={{ component: 'div' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default RecentActivities;
