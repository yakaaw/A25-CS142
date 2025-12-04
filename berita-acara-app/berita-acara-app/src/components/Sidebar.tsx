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
} from '@mui/material';
import {
  Home as HomeIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Logout as LogoutIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, permissions } = useAuth();

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
          top: '64px', // Height of AppBar
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
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
              Admin
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

        {/* Logout Button */}
        <Divider sx={{ my: 1 }} />
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
    </Drawer>
  );
};

export default Sidebar;
