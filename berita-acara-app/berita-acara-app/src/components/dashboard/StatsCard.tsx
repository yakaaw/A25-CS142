import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    color = 'primary',
    trend,
    subtitle,
    loading = false
}) => {
    return (
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" fontWeight={600}>
                            {loading ? '...' : value}
                        </Typography>

                        {subtitle && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {subtitle}
                            </Typography>
                        )}

                        {trend && !loading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {trend.isPositive ? (
                                    <TrendingUp fontSize="small" color="success" />
                                ) : (
                                    <TrendingDown fontSize="small" color="error" />
                                )}
                                <Typography
                                    variant="caption"
                                    color={trend.isPositive ? 'success.main' : 'error.main'}
                                    sx={{ ml: 0.5 }}
                                >
                                    {trend.value > 0 ? '+' : ''}{trend.value}%
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Avatar
                        sx={{
                            bgcolor: `${color}.main`,
                            width: 56,
                            height: 56
                        }}
                    >
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
};

export default StatsCard;
