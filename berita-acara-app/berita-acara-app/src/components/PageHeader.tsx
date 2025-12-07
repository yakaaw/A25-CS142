import React from 'react';
import { Breadcrumbs, Typography, Link as MuiLink, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';

interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs = [], description }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 0,
                mb: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 1.5 }}
                    aria-label="breadcrumb"
                >
                    <MuiLink
                        component={Link}
                        to="/dashboard"
                        underline="hover"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                        }}
                    >
                        <HomeIcon fontSize="small" />
                        Dashboard
                    </MuiLink>
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        const key = `${crumb.label}-${index}`;

                        if (isLast || !crumb.to) {
                            return (
                                <Typography key={key} color="text.primary" fontWeight={500}>
                                    {crumb.label}
                                </Typography>
                            );
                        }

                        return (
                            <MuiLink
                                key={key}
                                component={Link}
                                to={crumb.to}
                                underline="hover"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'primary.main' },
                                }}
                            >
                                {crumb.label}
                            </MuiLink>
                        );
                    })}
                </Breadcrumbs>
            )}

            {/* Page Title */}
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                {title}
            </Typography>

            {/* Description (optional) */}
            {description && (
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            )}
        </Paper>
    );
};

export default PageHeader;
