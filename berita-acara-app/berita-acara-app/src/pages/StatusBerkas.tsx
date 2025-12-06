import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Avatar,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAllBAPB } from '../services/bapbService';
import { getAllBAPP } from '../services/bappService';
import PageHeader from '../components/PageHeader';

const StatusBerkas: React.FC = () => {
    const [stats, setStats] = useState({
        totalBAPB: 0,
        totalBAPP: 0,
        pendingApproval: 0,
        completed: 0,
    });
    const [recentActivities, setRecentActivities] = useState<{
        id: string;
        type: 'BAPB' | 'BAPP';
        date: string;
        status: string;
    }[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper function to get status color
    const getStatusColor = (status: string): 'success' | 'error' | 'warning' => {
        if (status === 'approved') return 'success';
        if (status === 'rejected') return 'error';
        return 'warning';
    };

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [bapbResult, bappResult] = await Promise.all([getAllBAPB(), getAllBAPP()]);

                const bapbData = bapbResult.success && bapbResult.data ? bapbResult.data : [];
                const bappData = bappResult.success && bappResult.data ? bappResult.data : [];

                const allDocs = [...bapbData, ...bappData];

                const pendingApproval = allDocs.filter(
                    (doc) => doc.status === 'pending' || doc.currentStage === 'waiting_pic' || doc.currentStage === 'waiting_direksi'
                ).length;

                const completed = allDocs.filter((doc) => doc.status === 'approved').length;

                setStats({
                    totalBAPB: bapbData.length,
                    totalBAPP: bappData.length,
                    pendingApproval,
                    completed,
                });

                // Get recent activities (last 10)
                const activities: {
                    id: string;
                    type: 'BAPB' | 'BAPP';
                    date: string;
                    status: string;
                }[] = [];

                bapbData.forEach((doc) => {
                    activities.push({
                        id: doc.id || '',
                        type: 'BAPB',
                        date: doc.createdAt || '',
                        status: doc.status || 'pending',
                    });
                });

                bappData.forEach((doc) => {
                    activities.push({
                        id: doc.id || '',
                        type: 'BAPP',
                        date: doc.createdAt || '',
                        status: doc.status || 'pending',
                    });
                });

                // Sort by date (newest first) and take first 10
                activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setRecentActivities(activities.slice(0, 10));
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const statCards = [
        {
            label: 'Total BAPB',
            value: stats.totalBAPB,
            icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
            color: 'primary.main',
            bgColor: 'primary.light',
        },
        {
            label: 'Total BAPP',
            value: stats.totalBAPP,
            icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
            color: 'success.main',
            bgColor: 'success.light',
        },
        {
            label: 'Menunggu Approval',
            value: stats.pendingApproval,
            icon: <ScheduleIcon sx={{ fontSize: 32 }} />,
            color: 'warning.main',
            bgColor: 'warning.light',
        },
        {
            label: 'Selesai',
            value: stats.completed,
            icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
            color: 'success.main',
            bgColor: 'success.light',
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <PageHeader
                title="Status Berkas"
                description="Monitoring status semua Berita Acara"
                breadcrumbs={[
                    { label: 'Status Berkas' }
                ]}
            />

            {/* Stats Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3,
                    mb: 4,
                }}
            >
                {statCards.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color={stat.color}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color, width: 56, height: 56 }}>
                                    {stat.icon}
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Recent Activity */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimelineIcon />
                        Aktivitas Terbaru
                    </Typography>
                    {recentActivities.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Belum ada aktivitas Berita Acara
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aktivitas akan muncul di sini setelah ada BA yang dibuat
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {recentActivities.map((activity, index) => (
                                <React.Fragment key={`${activity.type}-${activity.id}`}>
                                    {index > 0 && <Divider />}
                                    <ListItem
                                        component={Link}
                                        to={`/${activity.type.toLowerCase()}/${activity.id}`}
                                        sx={{
                                            textDecoration: 'none',
                                            '&:hover': { bgcolor: 'action.hover' },
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                mr: 2,
                                                bgcolor: activity.type === 'BAPB' ? 'primary.light' : 'success.light',
                                                color: activity.type === 'BAPB' ? 'primary.main' : 'success.main',
                                            }}
                                        >
                                            {activity.type === 'BAPB' ? <DescriptionIcon /> : <AssignmentIcon />}
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {activity.type} #{activity.id}
                                                    </Typography>
                                                    <Chip
                                                        label={activity.status}
                                                        size="small"
                                                        color={getStatusColor(activity.status)}
                                                    />
                                                </Box>
                                            }
                                            secondary={new Date(activity.date).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        />
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default StatusBerkas;
