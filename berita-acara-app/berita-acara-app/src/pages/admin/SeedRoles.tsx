import React, { useState } from 'react';
import { createRole, getRoleByName, updateRole } from '../../services/roleService';
import { useToast } from '../../context/ToastContext';
import { Database } from 'lucide-react';

const DEFAULT_ROLES = [
    {
        name: 'admin',
        permissions: [
            'admin.access', 'manage_users', 'manage_roles',
            'bapb.view', 'bapb.create', 'bapb.edit', 'bapb.delete', 'bapb.approve', 'bapb.reject',
            'bapp.view', 'bapp.create', 'bapp.edit', 'bapp.delete', 'bapp.approve', 'bapp.reject',
            'ba.initiate', 'ba.view_all', 'master.manage'
        ]
    },
    {
        name: 'vendor',
        permissions: ['bapb.view', 'bapb.create', 'bapb.edit', 'bapp.view', 'bapp.create', 'bapp.edit']
    },
    {
        name: 'pic_gudang',
        permissions: ['bapb.view', 'bapb.verify', 'bapb.publish', 'bapb.reject']
    },
    {
        name: 'pic_pemesan',
        permissions: ['bapp.view', 'bapp.verify', 'bapp.publish', 'bapp.reject']
    },
    {
        name: 'direksi',
        permissions: ['bapb.view', 'bapp.view', 'bapb.approve', 'bapp.approve', 'bapb.reject', 'bapp.reject']
    }
];

const SeedRoles: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const { showToast } = useToast();

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    };

    const handleSeed = async () => {
        setLoading(true);
        setLogs([]);
        addLog('Starting role initialization...');

        try {
            for (const role of DEFAULT_ROLES) {
                addLog(`Checking role: ${role.name}...`);
                const existing = await getRoleByName(role.name);

                if (existing.success && existing.data) {
                    addLog(`Role '${role.name}' already exists. Updating permissions...`);
                    const updateResult = await updateRole(existing.data.id!, {
                        permissions: role.permissions
                    });
                    if (updateResult.success) {
                        addLog(`Role '${role.name}' updated successfully.`);
                    } else {
                        addLog(`Failed to update role '${role.name}': ${updateResult.error}`);
                    }
                } else {
                    addLog(`Creating role '${role.name}'...`);
                    const result = await createRole({
                        name: role.name,
                        permissions: role.permissions
                    });

                    if (result.success) {
                        addLog(`Role '${role.name}' created successfully.`);
                    } else {
                        addLog(`Failed to create role '${role.name}': ${result.error}`);
                    }
                }
            }
            addLog('Role initialization completed.');
            showToast('Inisialisasi role selesai', 'success');
        } catch (error: any) {
            addLog(`Error: ${error.message}`);
            showToast('Terjadi kesalahan', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Setup Database Roles</h1>
                        <p className="text-gray-500">Inisialisasi role default dan permission</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-medium mb-2">Role yang akan dibuat:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {DEFAULT_ROLES.map(role => (
                            <li key={role.name}>
                                <span className="font-medium text-gray-900">{role.name}</span>
                                <span className="text-sm ml-2">({role.permissions.length} permissions)</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Memproses...' : 'Inisialisasi Role Default'}
                </button>

                {logs.length > 0 && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono text-sm max-h-60 overflow-y-auto">
                        {logs.map((log, index) => (
                            <div key={`${index}-${log.substring(0, 10)}`} className="mb-1 text-gray-700">{log}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeedRoles;
