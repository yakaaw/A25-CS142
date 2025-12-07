import React, { useEffect, useState, useCallback } from 'react';
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
    MenuItem,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Close as CloseIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { getAllUsers, updateUserRole, createUser, deleteUser } from '../../services/userService';
import { UserProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';

const MemberList: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Add Member State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        email: '',
        password: '',
        name: '',
        role: 'vendor',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [creating, setCreating] = useState(false);

    // Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // Edit Role State
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [editRoleValue, setEditRoleValue] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const result = await getAllUsers();
        if (result.success && result.data) {
            setUsers(result.data);
        } else {
            showToast('Gagal mengambil data pengguna', 'error');
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async () => {
        if (!selectedUser?.uid) return;

        const result = await updateUserRole(selectedUser.uid, editRoleValue);
        if (result.success) {
            showToast('Role pengguna berhasil diperbarui', 'success');
            fetchUsers();
            setIsEditRoleOpen(false);
            setEditRoleValue('');
            setSelectedUser(null);
        } else {
            showToast('Gagal memperbarui role', 'error');
        }
    };

    const handleCreateMember = async () => {
        if (!newMember.email || !newMember.password || !newMember.name) {
            showToast('Mohon lengkapi semua field', 'warning');
            return;
        }

        setCreating(true);
        const result = await createUser(newMember.email, newMember.password, {
            name: newMember.name,
            role: newMember.role,
        });

        if (result.success) {
            showToast('Anggota berhasil ditambahkan', 'success');
            setIsAddModalOpen(false);
            setNewMember({ email: '', password: '', name: '', role: 'vendor' });
            fetchUsers();
        } else {
            showToast('Gagal menambahkan anggota: ' + result.error, 'error');
        }
        setCreating(false);
    };

    const handleDeleteMember = async () => {
        if (!selectedUser?.uid || !selectedUser?.email) return;

        if (window.confirm(`Apakah Anda yakin ingin menghapus anggota ${selectedUser.email}? Akses mereka akan dicabut.`)) {
            const result = await deleteUser(selectedUser.uid);
            if (result.success) {
                showToast('Anggota berhasil dihapus', 'success');
                fetchUsers();
            } else {
                showToast('Gagal menghapus anggota', 'error');
            }
        }
        handleMenuClose();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserProfile) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleEditClick = () => {
        if (selectedUser) {
            setEditRoleValue(selectedUser.role || 'vendor');
            setIsEditRoleOpen(true);
        }
        setAnchorEl(null); // Keep selectedUser for the dialog
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'direksi':
                return 'primary';
            case 'pic_gudang':
            case 'pemesan':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography>Loading Users...</Typography>
                </Stack>
            </Box>
        );

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
            <PageHeader
                title="Manajemen Anggota"
                description="Kelola role dan akses pengguna"
                breadcrumbs={[
                    { label: 'Admin', to: '/admin/members' },
                    { label: 'Anggota' }
                ]}
            />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddModalOpen(true)}>
                    Tambah Anggota
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Nama</TableCell>
                            <TableCell>Bergabung</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.uid || user.email} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{user.email}</TableCell>
                                <TableCell>{user.name || '-'}</TableCell>
                                <TableCell>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role?.replace('_', ' ')}
                                        size="small"
                                        color={getRoleColor(user.role || '') as any}
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, user)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Role</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeleteMember} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Hapus Anggota</ListItemText>
                </MenuItem>
            </Menu>

            {/* Edit Role Dialog */}
            <Dialog open={isEditRoleOpen} onClose={() => setIsEditRoleOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Ubah Role Pengguna</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                            Mengubah role untuk <strong>{selectedUser?.email}</strong>
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            label="Role"
                            value={editRoleValue}
                            onChange={(e) => setEditRoleValue(e.target.value)}
                        >
                            <MenuItem value="vendor">Vendor</MenuItem>
                            <MenuItem value="pic_gudang">PIC Gudang</MenuItem>
                            <MenuItem value="pemesan">Pemesan</MenuItem>
                            <MenuItem value="direksi">Direksi</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditRoleOpen(false)}>Batal</Button>
                    <Button variant="contained" onClick={handleRoleChange}>
                        Simpan
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Tambah Anggota Baru
                        <IconButton onClick={() => setIsAddModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Nama Lengkap"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={newMember.password}
                            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Role"
                            value={newMember.role}
                            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        >
                            <MenuItem value="vendor">Vendor</MenuItem>
                            <MenuItem value="pic_gudang">PIC Gudang</MenuItem>
                            <MenuItem value="pemesan">Pemesan</MenuItem>
                            <MenuItem value="direksi">Direksi</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateMember}
                        disabled={creating}
                        startIcon={creating ? <CircularProgress size={20} /> : null}
                    >
                        {creating ? 'Menambahkan...' : 'Tambah Anggota'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MemberList;
