import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Breadcrumbs,
    Link as MuiLink,
    Avatar,
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

const StatusBerkas: React.FC = () => {
    const [stats, setStats] = useState({
        totalBAPB: 0,
        totalBAPP: 0,
        pendingApproval: 0,
        completed: 0,
    });
    const [loading, setLoading] = useState(true);

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
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs sx={{ mb: 1 }}>
                    <MuiLink component={Link} to="/dashboard" underline="hover">
                        Dashboard
                    </MuiLink>
                    <Typography color="text.primary">Status Berkas</Typography>
                </Breadcrumbs>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Status Berkas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Monitoring status semua Berita Acara
                </Typography>
            </Box>

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
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Aktivitas Terbaru
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            Belum ada aktivitas Berita Acara
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Aktivitas akan muncul di sini setelah ada BA yang dibuat
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default StatusBerkas;
