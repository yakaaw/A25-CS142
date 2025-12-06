import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Logout as LogoutIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, permissions, userProfile } = useAuth();

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, permission: null },
    { to: '/bapb', label: 'BAPB', icon: DescriptionIcon, permission: 'bapb.view' },
    { to: '/bapp', label: 'BAPP', icon: DescriptionIcon, permission: 'bapp.view' },
    { to: '/status-berkas', label: 'Status Berkas', icon: FolderIcon, permission: null },
  ];

  const adminItems = [
    { to: '/admin/members', label: 'Anggota', icon: PeopleIcon },
    { to: '/admin/roles', label: 'Akses Role', icon: ShieldIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* App Title */}
        <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }} variant="rounded">
            <DescriptionIcon fontSize="small" />
          </Avatar>
          <Typography variant="subtitle1" component="div" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            Reportify
          </Typography>
        </Box>
        <Divider />

        {/* Scrollable Menu Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => {
              // Check permissions
              if (item.permission && !permissions.includes(item.permission)) {
                return null;
              }

              const Icon = item.icon;
              const active = isActive(item.to);

              return (
                <ListItem key={item.to} disablePadding>
                  <ListItemButton
                    selected={active}
                    onClick={() => navigate(item.to)}
                  >
                    <ListItemIcon>
                      <Icon color={active ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Admin Section */}
          {(permissions.includes('manage_users') || permissions.includes('manage_roles')) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="overline"
                sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}
              >
                TEAMS
              </Typography>
              <List>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);

                  return (
                    <ListItem key={item.to} disablePadding>
                      <ListItemButton
                        selected={active}
                        onClick={() => navigate(item.to)}
                      >
                        <ListItemIcon>
                          <Icon color={active ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </Box>

        {/* User Profile Section (Fixed at Bottom) */}
        <Box>
          <Divider />
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={userProfile?.photoURL}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              {!userProfile?.photoURL && (userProfile?.name?.charAt(0).toUpperCase() || 'U')}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {userProfile?.name || 'Guest'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {userProfile?.role || 'User'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => navigate('/settings/profile')}
              sx={{ color: 'text.secondary' }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Logout Button */}
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
