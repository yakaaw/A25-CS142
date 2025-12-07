import React, { useEffect, useState } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Link as MuiLink,
    Stack,
    CircularProgress,
} from '@mui/material';
import {
    Description as DescriptionIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    Person as PersonIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getAllBAPB } from '../services/bapbService';
import { getAllBAPP } from '../services/bappService';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        totalBAPB: 0,
        totalBAPP: 0,
        pendingBAPB: 0,
        pendingBAPP: 0,
        approvedBAPB: 0,
        approvedBAPP: 0,
    });
    const [actionItems, setActionItems] = useState<{ type: 'BAPB' | 'BAPP'; id: string; date: string; status: string }[]>([]);
    const [mySubmissions, setMySubmissions] = useState<{ type: 'BAPB' | 'BAPP'; id: string; date: string; status: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [bapbResult, bappResult] = await Promise.all([getAllBAPB(), getAllBAPP()]);

                if (bapbResult.success && bapbResult.data && bappResult.success && bappResult.data) {
                    const bapbData = bapbResult.data;
                    const bappData = bappResult.data;

                    setStats({
                        totalBAPB: bapbData.length,
                        totalBAPP: bappData.length,
                        pendingBAPB: bapbData.filter((item) => item.status === 'pending').length,
                        pendingBAPP: bappData.filter((item) => item.status === 'pending').length,
                        approvedBAPB: bapbData.filter((item) => item.status === 'approved').length,
                        approvedBAPP: bappData.filter((item) => item.status === 'approved').length,
                    });

                    const newActionItems: { type: 'BAPB' | 'BAPP'; id: string; date: string; status: string }[] = [];

                    if (userProfile?.role === 'pic_gudang') {
                        bapbData.forEach((d) => {
                            if (d.currentStage === 'waiting_pic') newActionItems.push({ type: 'BAPB', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        bappData.forEach((d) => {
                            if (d.currentStage === 'waiting_pic') newActionItems.push({ type: 'BAPP', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                    } else if (userProfile?.role === 'direksi') {
                        bapbData.forEach((d) => {
                            if (d.currentStage === 'waiting_direksi') newActionItems.push({ type: 'BAPB', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        bappData.forEach((d) => {
                            if (d.currentStage === 'waiting_direksi') newActionItems.push({ type: 'BAPP', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                    }
                    setActionItems(newActionItems);

                    if (userProfile?.role === 'vendor') {
                        const myItems: { type: 'BAPB' | 'BAPP'; id: string; date: string; status: string }[] = [];
                        bapbData.filter((d) => d.vendorId === userProfile.uid || d.vendorId === userProfile.email).forEach((d) => {
                            myItems.push({ type: 'BAPB', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        bappData.filter((d) => d.vendorId === userProfile.uid || d.vendorId === userProfile.email).forEach((d) => {
                            myItems.push({ type: 'BAPP', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        setMySubmissions(myItems);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userProfile]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            default:
                return 'warning';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <>
                    <PageHeader
                        title="Dashboard"
                        description="Selamat datang di Reportify"
                    />

                    {/* Welcome Card */}
                    <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.3)' }}>
                                    <PersonIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight={700}>
                                        Selamat Datang, {userProfile?.name || 'User'}!
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'capitalize' }}>
                                        Role: {userProfile?.role?.replace('_', ' ') || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Action Items */}
                    {actionItems.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningIcon color="warning" />
                                Menunggu Persetujuan Anda
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                                    gap: 2,
                                }}
                            >
                                {actionItems.map((item) => (
                                    <Card
                                        key={`${item.type}-${item.id}`}
                                        component={Link}
                                        to={`/${item.type.toLowerCase()}/${item.id}`}
                                        sx={{
                                            textDecoration: 'none',
                                            '&:hover': { boxShadow: 4 },
                                            transition: 'box-shadow 0.2s',
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Box>
                                                    <Chip label={item.type} size="small" color="primary" sx={{ mb: 1 }} />
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {new Date(item.date).toLocaleDateString('id-ID')}
                                                    </Typography>
                                                </Box>
                                                <ArrowForwardIcon color="action" />
                                            </Box>
                                            <Typography variant="body1" fontWeight={600}>
                                                #{item.id}
                                            </Typography>
                                            <Typography variant="body2" color="warning.main">
                                                Perlu Review
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* My Submissions (Vendor) */}
                    {userProfile?.role === 'vendor' && mySubmissions.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon color="primary" />
                                Pengajuan Terkini
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tipe</TableCell>
                                            <TableCell>ID Dokumen</TableCell>
                                            <TableCell>Tanggal</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Aksi</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mySubmissions.slice(0, 5).map((item) => (
                                            <TableRow key={`${item.type}-${item.id}`} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{item.type}</TableCell>
                                                <TableCell>#{item.id}</TableCell>
                                                <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>
                                                    <Chip label={item.status} size="small" color={getStatusColor(item.status) as any} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <MuiLink component={Link} to={`/${item.type.toLowerCase()}/${item.id}`}>
                                                        Lihat
                                                    </MuiLink>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* Stats Grid */}
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        Ringkasan Sistem
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 3,
                        }}
                    >
                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <DescriptionIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Total BAPB
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {stats.totalBAPB}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <DescriptionIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Total BAPP
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {stats.totalBAPP}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <ScheduleIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending BAPB
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {stats.pendingBAPB}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <ScheduleIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending BAPP
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {stats.pendingBAPP}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default Dashboard;
