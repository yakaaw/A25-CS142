import React, { useState } from 'react';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  HomeOutlined as HomeIcon,
  DescriptionOutlined as DescriptionIcon,
  FolderOutlined as FolderIcon,
  LogoutOutlined as LogoutIcon,
  ShieldOutlined as ShieldIcon,
  PeopleOutlined as PeopleIcon,
  SettingsOutlined as SettingsIcon,
  ArchiveOutlined as ArchiveIcon,
  Inventory2Outlined as InventoryIcon,
  AssignmentOutlined as AssignmentIcon,
  ViewSidebarOutlined as ViewSidebarIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, permissions, userProfile } = useAuth();
  const [open, setOpen] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, permission: null },
    { to: '/bapb', label: 'BAPB', icon: InventoryIcon, permission: 'bapb.view' },
    { to: '/bapp', label: 'BAPP', icon: AssignmentIcon, permission: 'bapp.view' },
    { to: '/status-berkas', label: 'Status Berkas', icon: FolderIcon, permission: null },
    { to: '/archive', label: 'Arsip', icon: ArchiveIcon, permission: 'manage_users' },
  ];

  const adminItems = [
    { to: '/admin/members', label: 'Anggota', icon: PeopleIcon },
    { to: '/admin/roles', label: 'Akses Role', icon: ShieldIcon },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* App Title with Toggle Button */}
          <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', gap: 1.5 }}>
            {open && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }} variant="rounded">
                  <DescriptionIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1" component="div" fontWeight={700} sx={{ lineHeight: 1.2 }} noWrap>
                  Reportify
                </Typography>
              </Box>
            )}
            <IconButton
              onClick={toggleSidebar}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ViewSidebarIcon />
            </IconButton>
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

                const button = (
                  <ListItemButton
                    selected={active}
                    onClick={() => navigate(item.to)}
                    sx={{ justifyContent: open ? 'initial' : 'center', px: open ? 2 : 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}>
                      <Icon color={active ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    {open && <ListItemText primary={item.label} />}
                  </ListItemButton>
                );

                return (
                  <ListItem key={item.to} disablePadding>
                    {open ? (
                      button
                    ) : (
                      <Tooltip title={item.label} placement="right">
                        {button}
                      </Tooltip>
                    )}
                  </ListItem>
                );
              })}
            </List>

            {/* Admin Section */}
            {(permissions.includes('manage_users') || permissions.includes('manage_roles')) && (
              <>
                <Divider sx={{ my: 1 }} />
                {open && (
                  <Typography
                    variant="overline"
                    sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}
                  >
                    TEAMS
                  </Typography>
                )}
                <List>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to);

                    const button = (
                      <ListItemButton
                        selected={active}
                        onClick={() => navigate(item.to)}
                        sx={{ justifyContent: open ? 'initial' : 'center', px: open ? 2 : 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}>
                          <Icon color={active ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        {open && <ListItemText primary={item.label} />}
                      </ListItemButton>
                    );

                    return (
                      <ListItem key={item.to} disablePadding>
                        {open ? (
                          button
                        ) : (
                          <Tooltip title={item.label} placement="right">
                            {button}
                          </Tooltip>
                        )}
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
            {open ? (
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
            ) : (
              <Box sx={{ py: 1.5, display: 'flex', justifyContent: 'center' }}>
                <Tooltip title={`${userProfile?.name || 'Guest'} - Settings`} placement="right">
                  <IconButton
                    onClick={() => navigate('/settings/profile')}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Avatar
                      src={userProfile?.photoURL}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {!userProfile?.photoURL && (userProfile?.name?.charAt(0).toUpperCase() || 'U')}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Logout Button */}
            <Divider />
            <List>
              <ListItem disablePadding>
                <Tooltip title={!open ? 'Logout' : ''} placement="right">
                  <ListItemButton
                    onClick={handleLogoutClick}
                    sx={{
                      color: 'error.main',
                      justifyContent: open ? 'initial' : 'center',
                      px: open ? 2 : 1
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}>
                      <LogoutIcon color="error" />
                    </ListItemIcon>
                    {open && <ListItemText primary="Logout" />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Logout?</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin keluar dari aplikasi?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            Batal
          </Button>
          <Button variant="contained" color="error" onClick={handleLogoutConfirm}>
            Ya, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
