import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Stack,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProfileSettings: React.FC = () => {
    const { userProfile, updateUserProfile, changePassword } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(userProfile?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            await updateUserProfile({ name });
            showToast('Profil berhasil diperbarui', 'success');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showToast('Gagal memperbarui profil', 'error');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast('Password tidak cocok', 'error');
            return;
        }
        if (password.length < 6) {
            showToast('Password minimal 6 karakter', 'error');
            return;
        }

        setLoadingPassword(true);
        try {
            await changePassword(password);
            showToast('Password berhasil diubah', 'success');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            showToast('Gagal mengubah password. Login ulang mungkin diperlukan.', 'error');
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Pengaturan Profil
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Kelola informasi akun dan keamanan Anda
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 3,
                }}
            >
                {/* Profile Information Card */}
                <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'primary.main',
                                }}
                            >
                                <PersonIcon />
                            </Box>
                            <Typography variant="h6" fontWeight={600}>
                                Informasi Dasar
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3 }} />

                        <Box component="form" onSubmit={handleUpdateProfile}>
                            <Stack spacing={2.5}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={userProfile?.email || ''}
                                    disabled
                                    helperText="Email tidak dapat diubah"
                                />

                                <TextField
                                    fullWidth
                                    label="Nama Lengkap"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loadingProfile}
                                    startIcon={
                                        loadingProfile ? (
                                            <CircularProgress size={20} color="inherit" />
                                        ) : (
                                            <SaveIcon />
                                        )
                                    }
                                    sx={{ mt: 1 }}
                                >
                                    {loadingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: 'secondary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'secondary.main',
                                }}
                            >
                                <LockIcon />
                            </Box>
                            <Typography variant="h6" fontWeight={600}>
                                Keamanan
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3 }} />

                        <Box component="form" onSubmit={handleChangePassword}>
                            <Stack spacing={2.5}>
                                <TextField
                                    fullWidth
                                    label="Password Baru"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                />

                                <TextField
                                    fullWidth
                                    label="Konfirmasi Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    disabled={loadingPassword || !password}
                                    startIcon={
                                        loadingPassword ? (
                                            <CircularProgress size={20} color="inherit" />
                                        ) : (
                                            <SaveIcon />
                                        )
                                    }
                                    sx={{ mt: 1 }}
                                >
                                    {loadingPassword ? 'Mengubah...' : 'Ubah Password'}
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default ProfileSettings;
