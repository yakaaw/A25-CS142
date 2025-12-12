import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    MenuItem,
    TextField,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Speed as SpeedIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

// Dashboard components
import StatsCard from '../components/dashboard/StatsCard';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import DocumentTimelineChart from '../components/dashboard/DocumentTimelineChart';
import VendorAnalyticsChart from '../components/dashboard/VendorAnalyticsChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import PendingApprovals from '../components/dashboard/PendingApprovals';
import MyDocumentsStatus from '../components/dashboard/MyDocumentsStatus';
import SystemOverview from '../components/dashboard/SystemOverview';
import HighValuePendingApprovals from '../components/dashboard/HighValuePendingApprovals';

// Dashboard service
import {
    getDocumentStats,
    getApprovalMetrics,
    getVendorStats,
    getTimelineData,
    getRecentActivities,
    getPendingApprovals,
    getDateRange
} from '../services/dashboardService';

import {
    DocumentStats,
    ApprovalMetrics,
    VendorStat,
    TimelineDataPoint,
    Activity,
    PendingApproval
} from '../types/dashboardTypes';

const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();

    // State
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // days
    const [docStats, setDocStats] = useState<DocumentStats>({
        total: 0,
        bapb: 0,
        bapp: 0,
        byStatus: { pending: 0, approved: 0, rejected: 0 },
        byStage: {}
    });
    const [approvalMetrics, setApprovalMetrics] = useState<ApprovalMetrics>({
        avgApprovalTime: 0,
        pendingCount: 0,
        approvedThisMonth: 0,
        rejectedThisMonth: 0,
        approvalRate: 0
    });
    const [vendorStats, setVendorStats] = useState<VendorStat[]>([]);
    const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

    // Load dashboard data
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const userId = userProfile?.uid || '';
            const userRole = userProfile?.role || '';
            const dateFilter = getDateRange(parseInt(dateRange));

            const [stats, metrics, vendors, timeline, recentActivities, pending] = await Promise.all([
                getDocumentStats(userId, userRole, dateFilter),
                getApprovalMetrics(userId, userRole, dateFilter),
                getVendorStats(userId, userRole, 10),
                getTimelineData(userId, userRole, 6),
                getRecentActivities(userId, userRole, 10),
                getPendingApprovals(userId, userRole)
            ]);

            setDocStats(stats);
            setApprovalMetrics(metrics);
            setVendorStats(vendors);
            setTimelineData(timeline);
            setActivities(recentActivities);
            setPendingApprovals(pending);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userProfile) {
            loadDashboardData();
        }
    }, [userProfile, dateRange]);

    const handleRefresh = () => {
        loadDashboardData();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header with controls */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Dashboard Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Selamat datang, {userProfile?.name || 'User'}! ({userProfile?.role?.replace('_', ' ')})
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            select
                            size="small"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            sx={{ minWidth: 150 }}
                            label="Period"
                        >
                            <MenuItem value="7">Last 7 days</MenuItem>
                            <MenuItem value="30">Last 30 days</MenuItem>
                            <MenuItem value="90">Last 3 months</MenuItem>
                        </TextField>

                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <>
                    {/* VENDOR DASHBOARD */}
                    {userProfile?.role === 'vendor' && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                            {/* Vendor-specific widget */}
                            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                                <MyDocumentsStatus stats={docStats} loading={loading} />
                            </Box>

                            {/* Charts for vendor */}
                            <Box>
                                <StatusDistributionChart data={docStats.byStatus} />
                            </Box>
                            <Box>
                                <DocumentTimelineChart data={timelineData} />
                            </Box>

                            {/* Recent activities */}
                            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                                <RecentActivities activities={activities} />
                            </Box>
                        </Box>
                    )}

                    {/* ADMIN DASHBOARD */}
                    {userProfile?.role === 'admin' && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                            {/* Stats Cards Row */}
                            <Box sx={{ height: 140 }}>
                                <StatsCard
                                    title="Total Documents"
                                    value={docStats.total}
                                    icon={<DescriptionIcon />}
                                    color="primary"
                                    subtitle={`${docStats.bapb} BAPB, ${docStats.bapp} BAPP`}
                                />
                            </Box>
                            <Box sx={{ height: 140 }}>
                                <StatsCard
                                    title="Pending Approvals"
                                    value={approvalMetrics.pendingCount}
                                    icon={<ScheduleIcon />}
                                    color="warning"
                                    subtitle="Awaiting review"
                                />
                            </Box>
                            <Box sx={{ height: 140 }}>
                                <StatsCard
                                    title="Approved This Month"
                                    value={approvalMetrics.approvedThisMonth}
                                    icon={<CheckCircleIcon />}
                                    color="success"
                                    subtitle={`${approvalMetrics.approvalRate}% approval rate`}
                                />
                            </Box>
                            <Box sx={{ height: 140 }}>
                                <StatsCard
                                    title="Avg Approval Time"
                                    value={`${approvalMetrics.avgApprovalTime}h`}
                                    icon={<SpeedIcon />}
                                    color="info"
                                    subtitle="Average processing time"
                                />
                            </Box>

                            {/* System Overview - Admin only */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <SystemOverview totalDocs={docStats.total} pendingDocs={approvalMetrics.pendingCount} />
                            </Box>

                            {/* Charts */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <StatusDistributionChart data={docStats.byStatus} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <DocumentTimelineChart data={timelineData} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <VendorAnalyticsChart data={vendorStats} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <RecentActivities activities={activities} />
                            </Box>

                            {/* Pending Approvals */}
                            {pendingApprovals.length > 0 && (
                                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                                    <PendingApprovals approvals={pendingApprovals} />
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* PIC DASHBOARD (PIC Gudang / PIC Pemesan) */}
                    {(userProfile?.role === 'pic_gudang' || userProfile?.role === 'pic_pemesan' || userProfile?.role === 'pemesan') && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                            {/* Stats Cards Row */}
                            <StatsCard
                                title="Total Documents"
                                value={docStats.total}
                                icon={<DescriptionIcon />}
                                color="primary"
                                subtitle={`${docStats.bapb} BAPB, ${docStats.bapp} BAPP`}
                            />
                            <StatsCard
                                title="Pending Your Review"
                                value={pendingApprovals.length}
                                icon={<ScheduleIcon />}
                                color="warning"
                                subtitle="Awaiting your approval"
                            />
                            <StatsCard
                                title="Approved This Month"
                                value={approvalMetrics.approvedThisMonth}
                                icon={<CheckCircleIcon />}
                                color="success"
                                subtitle={`${approvalMetrics.approvalRate}% approval rate`}
                            />
                            <StatsCard
                                title="Avg Approval Time"
                                value={`${approvalMetrics.avgApprovalTime}h`}
                                icon={<SpeedIcon />}
                                color="info"
                                subtitle="Average processing time"
                            />

                            {/* Charts - Status Distribution and Document Timeline */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <StatusDistributionChart data={docStats.byStatus} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <DocumentTimelineChart data={timelineData} />
                            </Box>

                            {/* Top Vendors and Recent Activities */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <VendorAnalyticsChart data={vendorStats} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <RecentActivities activities={activities} />
                            </Box>
                        </Box>
                    )}

                    {/* DIREKSI DASHBOARD */}
                    {userProfile?.role === 'direksi' && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                            {/* Stats Cards Row */}
                            <StatsCard
                                title="Total Documents"
                                value={docStats.total}
                                icon={<DescriptionIcon />}
                                color="primary"
                                subtitle={`${docStats.bapb} BAPB, ${docStats.bapp} BAPP`}
                            />
                            <StatsCard
                                title="Pending Your Approval"
                                value={pendingApprovals.length}
                                icon={<ScheduleIcon />}
                                color="warning"
                                subtitle="Awaiting your decision"
                            />
                            <StatsCard
                                title="Approved This Month"
                                value={approvalMetrics.approvedThisMonth}
                                icon={<CheckCircleIcon />}
                                color="success"
                                subtitle={`${approvalMetrics.approvalRate}% approval rate`}
                            />
                            <StatsCard
                                title="Avg Approval Time"
                                value={`${approvalMetrics.avgApprovalTime}h`}
                                icon={<SpeedIcon />}
                                color="info"
                                subtitle="Average processing time"
                            />

                            {/* High Priority Approvals - Direksi specific */}
                            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                                <HighValuePendingApprovals approvals={pendingApprovals} />
                            </Box>

                            {/* Executive Charts */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <StatusDistributionChart data={docStats.byStatus} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <DocumentTimelineChart data={timelineData} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <VendorAnalyticsChart data={vendorStats} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <RecentActivities activities={activities} />
                            </Box>

                            {/* All Pending Approvals */}
                            {pendingApprovals.length > 0 && (
                                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                                    <PendingApprovals
                                        approvals={pendingApprovals}
                                        title="All Pending Approvals"
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default Dashboard;
