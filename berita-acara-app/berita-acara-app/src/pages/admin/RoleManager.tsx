import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    CircularProgress,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Chip,
    IconButton,
    Stack,
    InputAdornment,
} from '@mui/material';
import {
    Security as SecurityIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { getAllRoles, updateRole, createRole, deleteRole, RoleData } from '../../services/roleService';
import { getAllUsers } from '../../services/userService';
import { UserProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const PERMISSION_GROUPS = [
    {
        name: 'BAPB',
        permissions: [
            { id: 'bapb.view', label: 'Lihat BAPB' },
            { id: 'bapb.create', label: 'Buat BAPB' },
            { id: 'bapb.edit', label: 'Edit BAPB' },
            { id: 'bapb.delete', label: 'Hapus BAPB' },
            { id: 'bapb.approve', label: 'Setujui BAPB' },
            { id: 'bapb.reject', label: 'Tolak BAPB' },
        ],
    },
    {
        name: 'BAPP',
        permissions: [
            { id: 'bapp.view', label: 'Lihat BAPP' },
            { id: 'bapp.create', label: 'Buat BAPP' },
            { id: 'bapp.edit', label: 'Edit BAPP' },
            { id: 'bapp.delete', label: 'Hapus BAPP' },
            { id: 'bapp.approve', label: 'Setujui BAPP' },
            { id: 'bapp.reject', label: 'Tolak BAPP' },
        ],
    },
    {
        name: 'Admin',
        permissions: [{ id: 'admin.access', label: 'Akses Admin' }],
    },
];

const RoleManager: React.FC = () => {
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [rolesResult, usersResult] = await Promise.all([getAllRoles(), getAllUsers()]);

        if (rolesResult.success && rolesResult.data) {
            setRoles(rolesResult.data);
        } else {
            showToast('Gagal mengambil data role', 'error');
        }

        if (usersResult.success && usersResult.data) {
            setUsers(usersResult.data);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getActiveUserCount = (roleName: string) => {
        return users.filter((u) => u.role === roleName).length;
    };

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        const result = await createRole({
            name: newRoleName,
            permissions: [],
            description: newRoleDescription,
        });

        if (result.success) {
            showToast('Role berhasil dibuat', 'success');
            setNewRoleName('');
            setNewRoleDescription('');
            setIsAddModalOpen(false);
            fetchData();
        } else {
            showToast('Gagal membuat role', 'error');
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (globalThis.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            const result = await deleteRole(id);
            if (result.success) {
                showToast('Role berhasil dihapus', 'success');
                fetchData();
                setSelectedRole(null);
            } else {
                showToast('Gagal menghapus role', 'error');
            }
        }
    };

    const handlePermissionChange = async (roleId: string, permission: string, checked: boolean) => {
        const role = roles.find((r) => r.id === roleId);
        if (!role) return;

        const newPermissions = checked
            ? [...role.permissions, permission]
            : role.permissions.filter((p) => p !== permission);

        const updatedRole = { ...role, permissions: newPermissions };
        setRoles(roles.map((r) => (r.id === roleId ? updatedRole : r)));
        if (selectedRole?.id === roleId) {
            setSelectedRole(updatedRole);
        }

        const result = await updateRole(roleId, { permissions: newPermissions });
        if (!result.success) {
            showToast('Gagal memperbarui izin', 'error');
            fetchData();
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography>Loading Roles...</Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Role & Access
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {roles.length} Roles Configured
                        </Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddModalOpen(true)}>
                    Add Role
                </Button>
            </Box>

            {/* Search */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search Role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{ maxWidth: 400 }}
                />
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Role Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell align="center">Active Users</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRoles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No roles found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRoles.map((role) => (
                                <TableRow key={role.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{role.name}</TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" noWrap>
                                            {role.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>Admin</TableCell>
                                    <TableCell align="center">{getActiveUserCount(role.name)}</TableCell>
                                    <TableCell align="center">
                                        <Chip label="Active" size="small" color="success" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => setSelectedRole(role)}>
                                            See Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Role Dialog */}
            <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Add New Role
                        <IconButton onClick={() => setIsAddModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Role Name"
                            placeholder="e.g. sales_manager"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            placeholder="Role description..."
                            multiline
                            rows={3}
                            value={newRoleDescription}
                            onChange={(e) => setNewRoleDescription(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateRole}>
                        Create Role
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Role Details Dialog */}
            <Dialog
                open={!!selectedRole}
                onClose={() => setSelectedRole(null)}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { maxHeight: '90vh' } } }}
            >
                {selectedRole && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {selectedRole.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedRole.description || 'No description'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        color="error"
                                        onClick={() => selectedRole.id && handleDeleteRole(selectedRole.id)}
                                        title="Delete Role"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton onClick={() => setSelectedRole(null)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Permissions
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                                {PERMISSION_GROUPS.map((group) => (
                                    <Paper key={group.name} sx={{ p: 2 }} variant="outlined">
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SecurityIcon fontSize="small" color="primary" />
                                            {group.name}
                                        </Typography>
                                        <Stack spacing={0.5}>
                                            {group.permissions.map((perm) => (
                                                <FormControlLabel
                                                    key={perm.id}
                                                    control={
                                                        <Checkbox
                                                            size="small"
                                                            checked={selectedRole.permissions.includes(perm.id)}
                                                            onChange={(e) =>
                                                                selectedRole.id && handlePermissionChange(selectedRole.id, perm.id, e.target.checked)
                                                            }
                                                        />
                                                    }
                                                    label={<Typography variant="body2">{perm.label}</Typography>}
                                                />
                                            ))}
                                        </Stack>
                                    </Paper>
                                ))}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" onClick={() => setSelectedRole(null)}>
                                Done
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default RoleManager;
