import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { VendorStat } from '../../types/dashboardTypes';

interface VendorAnalyticsChartProps {
    data: VendorStat[];
    loading?: boolean;
}

// Custom tooltip component for vendor analytics
const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
    if (active && payload?.length) {
        const data = payload[0].payload;
        return (
            <Box sx={{ bgcolor: 'background.paper', p: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="body2"><strong>{data.vendorName}</strong></Typography>
                <Typography variant="caption">Documents: {data.documentCount}</Typography><br />
                <Typography variant="caption">Approval Rate: {data.approvalRate.toFixed(1)}%</Typography>
            </Box>
        );
    }
    return null;
};

const VendorAnalyticsChart: React.FC<VendorAnalyticsChartProps> = ({ data, loading = false }) => {
    // Color based on approval rate
    const getColor = (approvalRate: number) => {
        if (approvalRate >= 80) return '#4caf50'; // green
        if (approvalRate >= 60) return '#ff9800'; // orange
        return '#f44336'; // red
    };

    if (loading) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Top Vendors</Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Loading...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Top Vendors</Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No data available</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Top Vendors</Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                    By document count (color indicates approval rate)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="vendorName" type="category" />
                        <Tooltip content={<CustomTooltip /> as any} />
                        <Bar dataKey="documentCount" name="Documents">
                            {data.map((entry) => (
                                <Cell key={entry.vendorId} fill={getColor(entry.approvalRate)} />
                            )) as any}
                        </Bar>
                    </BarChart> as any
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default VendorAnalyticsChart;
