import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllBAPB } from '../services/bapbService';
import { getAllBAPP } from '../services/bappService';
import { Link } from 'react-router-dom';
import { FileText, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        totalBAPB: 0,
        totalBAPP: 0,
        pendingBAPB: 0,
        pendingBAPP: 0,
        approvedBAPB: 0,
        approvedBAPP: 0,
    });
    const [actionItems, setActionItems] = useState<{ type: 'BAPB' | 'BAPP', id: string, date: string, status: string }[]>([]);
    const [mySubmissions, setMySubmissions] = useState<{ type: 'BAPB' | 'BAPP', id: string, date: string, status: string }[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [bapbResult, bappResult] = await Promise.all([getAllBAPB(), getAllBAPP()]);

                if (bapbResult.success && bapbResult.data && bappResult.success && bappResult.data) {
                    const bapbData = bapbResult.data;
                    const bappData = bappResult.data;

                    // Calculate Stats
                    setStats({
                        totalBAPB: bapbData.length,
                        totalBAPP: bappData.length,
                        pendingBAPB: bapbData.filter((item) => item.status === 'pending').length,
                        pendingBAPP: bappData.filter((item) => item.status === 'pending').length,
                        approvedBAPB: bapbData.filter((item) => item.status === 'approved').length,
                        approvedBAPP: bappData.filter((item) => item.status === 'approved').length,
                    });

                    // Filter Action Items (for PIC/Direksi)
                    const newActionItems: { type: 'BAPB' | 'BAPP', id: string, date: string, status: string }[] = [];

                    if (userProfile?.role === 'pic_gudang') {
                        bapbData.forEach(d => {
                            if (d.currentStage === 'waiting_pic') newActionItems.push({ type: 'BAPB', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        bappData.forEach(d => {
                            if (d.currentStage === 'waiting_pic') newActionItems.push({ type: 'BAPP', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                    } else if (userProfile?.role === 'direksi') {
                        bapbData.forEach(d => {
                            if (d.currentStage === 'waiting_direksi') newActionItems.push({ type: 'BAPB', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        bappData.forEach(d => {
                            if (d.currentStage === 'waiting_direksi') newActionItems.push({ type: 'BAPP', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                    }
                    setActionItems(newActionItems);

                    // Filter My Submissions (for Vendor)
                    if (userProfile?.role === 'vendor') {
                        const myItems: { type: 'BAPB' | 'BAPP', id: string, date: string, status: string }[] = [];
                        bapbData.filter(d => d.vendorId === userProfile.uid || d.vendorId === userProfile.email).forEach(d => {
                            myItems.push({ type: 'BAPB', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        bappData.filter(d => d.vendorId === userProfile.uid || d.vendorId === userProfile.email).forEach(d => {
                            myItems.push({ type: 'BAPP', id: d.id!, date: d.createdAt || '', status: d.status || 'pending' });
                        });
                        setMySubmissions(myItems);
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        fetchStats();
    }, [userProfile]);

    return (
        <div className="dashboard-page">
            {/* Welcome Card */}
            <div className="welcome-card">
                <div className="welcome-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="welcome-avatar-icon">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
                <div className="welcome-info">
                    <h2 className="welcome-title">
                        Selamat Datang, {userProfile?.name || "User"}!
                    </h2>
                    <p className="welcome-role capitalize">
                        Role: {userProfile?.role?.replace('_', ' ') || "—"}
                    </p>
                </div>
            </div>

            {/* Action Items (For PIC/Direksi) */}
            {actionItems.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" size={20} />
                        Menunggu Persetujuan Anda
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {actionItems.map((item) => (
                            <Link to={`/ ${item.type.toLowerCase()}/${item.id}`} key={`${item.type}-${item.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow flex justify-between items-center group" >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{item.type}</span>
                                        <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <p className="font-medium text-gray-900">#{item.id}</p>
                                    <p className="text-sm text-orange-600">Perlu Review</p>
                                </div>
                                <ArrowRight className="text-gray-300 group-hover:text-blue-600 transition-colors" size={20} />
                            </Link >
                        ))}
                    </div >
                </div >
            )}

            {/* My Submissions (For Vendor) */}
            {
                userProfile?.role === 'vendor' && mySubmissions.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="text-blue-500" size={20} />
                            Pengajuan Terkini
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Tipe</th>
                                        <th className="px-6 py-3">ID Dokumen</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {mySubmissions.slice(0, 5).map((item) => (
                                        <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{item.type}</td>
                                            <td className="px-6 py-4 text-gray-900">#{item.id}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`status-badge status-${item.status}`}>{item.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/${item.type.toLowerCase()}/${item.id}`} className="text-blue-600 hover:underline font-medium">Lihat</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* Stats Grid */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Sistem</h3>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-blue">
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total BAPB</p>
                        <p className="stat-value">{stats.totalBAPB}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-blue">
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total BAPP</p>
                        <p className="stat-value">{stats.totalBAPP}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-purple">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Pending BAPB</p>
                        <p className="stat-value">{stats.pendingBAPB}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-purple">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Pending BAPP</p>
                        <p className="stat-value">{stats.pendingBAPP}</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
