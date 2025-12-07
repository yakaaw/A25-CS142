import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimelineDataPoint } from '../../types/dashboardTypes';

interface DocumentTimelineChartProps {
    data: TimelineDataPoint[];
    loading?: boolean;
}

const DocumentTimelineChart: React.FC<DocumentTimelineChartProps> = ({ data, loading = false }) => {
    if (loading) {
        return (
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Document Timeline</Typography>
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
                    <Typography variant="h6" gutterBottom>Document Timeline</Typography>
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
                <Typography variant="h6" gutterBottom>Document Timeline</Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                    Documents created over time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bapb" stroke="#1976d2" strokeWidth={2} name="BAPB" />
                        <Line type="monotone" dataKey="bapp" stroke="#ff9800" strokeWidth={2} name="BAPP" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default DocumentTimelineChart;
