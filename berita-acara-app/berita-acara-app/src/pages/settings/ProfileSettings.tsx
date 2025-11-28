import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Lock, Save } from 'lucide-react';

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
        <div className="page-enter max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h2>
                <p className="text-gray-500">Kelola informasi akun dan keamanan Anda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Information Card */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <User size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="form-group">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={userProfile?.email || ''}
                                disabled
                                className="glass-input w-full bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                id="fullName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loadingProfile}
                                className="glass-button w-full flex items-center justify-center gap-2"
                            >
                                {loadingProfile ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Card */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Keamanan</h3>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="form-group">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Minimal 6 karakter"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Ulangi password baru"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loadingPassword || !password}
                                className="glass-button w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                                {loadingPassword ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Ubah Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
