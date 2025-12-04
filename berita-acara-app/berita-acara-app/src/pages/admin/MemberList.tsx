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
    Typography,
    Box,
    CircularProgress,
    TextField,
    MenuItem,
    Chip,
    Stack,
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { getAllUsers, updateUserRole } from '../../services/userService';
import { UserProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MemberList: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        const result = await getAllUsers();
        if (result.success && result.data) {
            setUsers(result.data);
        } else {
            showToast('Gagal mengambil data pengguna', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (uid: string, newRole: string) => {
        const result = await updateUserRole(uid, newRole);
        if (result.success) {
            showToast('Role pengguna berhasil diperbarui', 'success');
            fetchUsers();
        } else {
            showToast('Gagal memperbarui role', 'error');
        }
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Manajemen Anggota
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Kelola role dan akses pengguna
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Nama</TableCell>
                            <TableCell>Bergabung</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Aksi</TableCell>
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
                                <TableCell>
                                    <TextField
                                        select
                                        size="small"
                                        value={user.role}
                                        onChange={(e) => user.uid && handleRoleChange(user.uid, e.target.value)}
                                        sx={{ minWidth: 150 }}
                                    >
                                        <MenuItem value="vendor">Vendor</MenuItem>
                                        <MenuItem value="pic_gudang">PIC Gudang</MenuItem>
                                        <MenuItem value="pemesan">Pemesan</MenuItem>
                                        <MenuItem value="direksi">Direksi</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </TextField>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default MemberList;
