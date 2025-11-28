import React, { useEffect, useState } from 'react';
import { getAllRoles, updateRole, createRole, deleteRole, RoleData } from '../../services/roleService';
import { getAllUsers } from '../../services/userService';
import { UserProfile } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Shield, Plus, Trash2, Search, X } from 'lucide-react';

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
        ]
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
        ]
    },
    {
        name: 'Admin',
        permissions: [
            { id: 'admin.access', label: 'Akses Admin' },
        ]
    }
];

const RoleManager: React.FC = () => {
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
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
        return users.filter(u => u.role === roleName).length;
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        const result = await createRole({
            name: newRoleName,
            permissions: [],
            description: newRoleDescription
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
                setSelectedRole(null); // Close modal if open
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

        // Optimistic update
        const updatedRole = { ...role, permissions: newPermissions };
        setRoles(roles.map((r) => (r.id === roleId ? updatedRole : r)));
        if (selectedRole?.id === roleId) {
            setSelectedRole(updatedRole);
        }

        const result = await updateRole(roleId, { permissions: newPermissions });
        if (!result.success) {
            showToast('Gagal memperbarui izin', 'error');
            // Revert on failure
            fetchData();
        }
    };

    return (
        <div className="list-page page-enter">
            <div className="list-container">
                {/* Header */}
                <div className="list-header">
                    <div className="list-title-group">
                        <div className="list-icon float-animation">
                            <Shield size={28} />
                        </div>
                        <div>
                            <h3 className="list-title text-gradient">Role & Access</h3>
                            <p className="text-gray-500 text-sm mt-1">{roles.length} Roles Configured</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="glass-button list-add-btn pulse-glow"
                    >
                        <Plus size={18} />
                        Add Role
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6 relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Role..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="glass-card list-card">
                    {loading ? (
                        <div className="list-loading-container">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading Roles...</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>Role Name</th>
                                        <th>Description</th>
                                        <th>Created By</th>
                                        <th className="text-center">Active Users</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoles.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No roles found</td>
                                        </tr>
                                    ) : (
                                        filteredRoles.map((role, index) => (
                                            <tr key={role.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fadeIn">
                                                <td className="font-medium text-gray-900">{role.name}</td>
                                                <td className="text-gray-500 max-w-xs truncate">{role.description || '-'}</td>
                                                <td className="text-gray-500">Admin</td>
                                                <td className="text-center text-gray-500">{getActiveUserCount(role.name)}</td>
                                                <td className="text-center">
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => setSelectedRole(role)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                                                    >
                                                        See Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Role Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add New Role</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                <input
                                    id="roleName"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. sales_manager"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="roleDescription"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Role description..."
                                    rows={3}
                                    value={newRoleDescription}
                                    onChange={(e) => setNewRoleDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateRole}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Details / Permissions Modal */}
            {selectedRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedRole.name}</h2>
                                <p className="text-gray-500 text-sm">{selectedRole.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => selectedRole.id && handleDeleteRole(selectedRole.id)}
                                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    title="Delete Role"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button onClick={() => setSelectedRole(null)} className="text-gray-400 hover:text-gray-600 p-2">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {PERMISSION_GROUPS.map((group) => (
                                    <div key={group.name} className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Shield size={16} className="text-blue-600" />
                                            {group.name}
                                        </h4>
                                        <div className="space-y-2">
                                            {group.permissions.map((perm) => (
                                                <label key={perm.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                        checked={selectedRole.permissions.includes(perm.id)}
                                                        onChange={(e) => selectedRole.id && handlePermissionChange(selectedRole.id, perm.id, e.target.checked)}
                                                    />
                                                    <span className="text-sm text-gray-700">{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setSelectedRole(null)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManager;
