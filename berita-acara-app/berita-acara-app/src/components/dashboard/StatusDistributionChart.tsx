import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusDistributionChartProps {
    data: {
        pending: number;
        approved: number;
        rejected: number;
    };
    loading?: boolean;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data, loading = false }) => {
    const chartData = [
        { name: 'Pending', value: data.pending, color: '#ff9800' },
        { name: 'Approved', value: data.approved, color: '#4caf50' },
        { name: 'Rejected', value: data.rejected, color: '#f44336' }
    ];

    const total = data.pending + data.approved + data.rejected;

    if (loading) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Status Distribution</Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Loading...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (total === 0) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Status Distribution</Typography>
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
                <Typography variant="h6" gutterBottom>Status Distribution</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    {(
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    ) as any}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default StatusDistributionChart;
