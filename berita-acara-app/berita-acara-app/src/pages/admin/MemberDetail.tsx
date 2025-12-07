import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    MenuItem,
    Stack,
    Chip,
    CircularProgress,
    Avatar,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { getAllUsers, updateUserDetails } from '../../services/userService';
import { UserProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/PageHeader';

const MemberDetail: React.FC = () => {
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [member, setMember] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editData, setEditData] = useState({
        name: '',
        email: '',
        role: '',
    });

    // Dialog states
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);

    useEffect(() => {
        fetchMemberDetail();
    }, [uid]);

    const fetchMemberDetail = async () => {
        setLoading(true);
        const result = await getAllUsers();
        if (result.success && result.data) {
            const foundMember = result.data.find((u) => u.uid === uid);
            if (foundMember) {
                setMember(foundMember);
                setEditData({
                    name: foundMember.name || '',
                    email: foundMember.email || '',
                    role: foundMember.role || 'vendor',
                });
            } else {
                showToast('Anggota tidak ditemukan', 'error');
                navigate('/admin/members');
            }
        } else {
            showToast('Gagal mengambil data anggota', 'error');
        }
        setLoading(false);
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancelClick = () => {
        setCancelDialogOpen(true);
    };

    const handleCancelConfirm = () => {
        setIsEditMode(false);
        // Reset to original data
        if (member) {
            setEditData({
                name: member.name || '',
                email: member.email || '',
                role: member.role || 'vendor',
            });
        }
        setCancelDialogOpen(false);
    };

    const handleSaveClick = () => {
        setSaveDialogOpen(true);
    };

    const handleSaveConfirm = async () => {
        if (!uid) return;

        setSaving(true);
        const result = await updateUserDetails(uid, {
            name: editData.name,
            email: editData.email,
            role: editData.role,
        });

        if (result.success) {
            showToast('Detail anggota berhasil diperbarui', 'success');
            setIsEditMode(false);
            fetchMemberDetail();
        } else {
            showToast('Gagal memperbarui detail', 'error');
        }
        setSaving(false);
        setSaveDialogOpen(false);
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

    const getRoleLabel = (role: string) => {
        return role?.replace('_', ' ').toUpperCase() || 'VENDOR';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography>Loading...</Typography>
                </Stack>
            </Box>
        );
    }

    if (!member) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography>Anggota tidak ditemukan</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <PageHeader
                title="Detail Anggota"
                description="Informasi lengkap anggota"
                breadcrumbs={[
                    { label: 'Admin', to: '/admin/members' },
                    { label: 'Anggota', to: '/admin/members' },
                    { label: member.name || member.email || 'Detail' }
                ]}
            />

            <Paper sx={{ p: 4, mt: 3 }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'primary.main',
                                fontSize: '2rem',
                                fontWeight: 600,
                            }}
                        >
                            {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {member.name || 'Nama tidak tersedia'}
                            </Typography>
                            <Chip
                                label={getRoleLabel(member.role || '')}
                                color={getRoleColor(member.role || '') as any}
                                size="small"
                            />
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/admin/members')}
                        >
                            Kembali
                        </Button>
                        {!isEditMode ? (
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={handleEdit}
                            >
                                Edit
                            </Button>
                        ) : (
                            <>
                                <Button
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancelClick}
                                    disabled={saving}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveClick}
                                    disabled={saving}
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Information Section */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Email
                        </Typography>
                        {isEditMode ? (
                            <TextField
                                fullWidth
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                size="small"
                            />
                        ) : (
                            <Typography variant="body1" fontWeight={600}>
                                {member.email || '-'}
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Nama Lengkap
                        </Typography>
                        {isEditMode ? (
                            <TextField
                                fullWidth
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                size="small"
                            />
                        ) : (
                            <Typography variant="body1" fontWeight={600}>
                                {member.name || '-'}
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Role
                        </Typography>
                        {isEditMode ? (
                            <TextField
                                select
                                fullWidth
                                value={editData.role}
                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                size="small"
                            >
                                <MenuItem value="vendor">Vendor</MenuItem>
                                <MenuItem value="pic_gudang">PIC Gudang</MenuItem>
                                <MenuItem value="pemesan">Pemesan</MenuItem>
                                <MenuItem value="direksi">Direksi</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </TextField>
                        ) : (
                            <Chip
                                label={getRoleLabel(member.role || '')}
                                color={getRoleColor(member.role || '') as any}
                                size="small"
                            />
                        )}
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Bergabung
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                            {member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })
                                : '-'}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            User ID
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                            {member.uid || '-'}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Cancel Edit Confirmation Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>Batalkan Perubahan?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Apakah Anda yakin ingin membatalkan perubahan? Semua perubahan yang belum disimpan akan hilang.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>
                        Tidak
                    </Button>
                    <Button variant="contained" color="error" onClick={handleCancelConfirm}>
                        Ya, Batalkan
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Save Changes Confirmation Dialog */}
            <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <DialogTitle>Simpan Perubahan?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Apakah Anda yakin ingin menyimpan perubahan data anggota ini?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>
                        Batal
                    </Button>
                    <Button variant="contained" onClick={handleSaveConfirm} disabled={saving}>
                        {saving ? 'Menyimpan...' : 'Ya, Simpan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MemberDetail;
