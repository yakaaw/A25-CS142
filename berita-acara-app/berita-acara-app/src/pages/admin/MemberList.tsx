import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '../../services/userService';
import { UserProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users } from 'lucide-react';

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

    return (
        <div className="list-page page-enter">
            <div className="list-container">
                <div className="list-header">
                    <div className="list-title-group">
                        <div className="list-icon float-animation">
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="list-title text-gradient">Manajemen Anggota</h3>
                            <p className="text-gray-500 text-sm mt-1">Kelola role dan akses pengguna</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card list-card">
                    {loading ? (
                        <div className="list-loading-container">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading Users...</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Nama</th>
                                        <th>Bergabung</th>
                                        <th>Role</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={user.uid || user.email} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fadeIn">
                                            <td>
                                                <div className="font-medium text-gray-900">{user.email}</div>
                                            </td>
                                            <td>{user.name || '-'}</td>
                                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                                            <td>
                                                <span className={`role-badge role-${user.role} px-3 py-1 rounded-full text-xs font-medium capitalize bg-opacity-20`}>
                                                    {user.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => user.uid && handleRoleChange(user.uid, e.target.value)}
                                                    className="bg-white/50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                >
                                                    <option value="vendor">Vendor</option>
                                                    <option value="pic_gudang">PIC Gudang</option>
                                                    <option value="pemesan">Pemesan</option>
                                                    <option value="direksi">Direksi</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberList;
