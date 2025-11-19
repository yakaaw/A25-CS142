import React, { useEffect, useState } from 'react';
import { getAllBAPB, BAPB } from '../../services/bapbService';
import { Link } from 'react-router-dom';

const BAPBList: React.FC = () => {
  const [list, setList] = useState<BAPB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getAllBAPB();
      if (res.success) setList(res.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="loading-container glass-card">
        <div className="loading-spinner mb-4"></div>
        <p className="text-white text-lg font-semibold">Loading BAPB...</p>
        <div className="mt-4 flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 page-enter">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 bg-opacity-20 rounded-xl float-animation">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-3xl font-bold text-gradient">
              Daftar BAPB
            </h3>
          </div>
          <Link to="/bapb/new" className="glass-button px-6 py-3 text-white font-semibold whitespace-nowrap pulse-glow">
            <span className="mr-2">➕</span>
            Buat BAPB baru
          </Link>
        </div>

        <div className="glass-card p-6">
          <div className="overflow-x-auto">
            <table className="glass-table min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Vendor</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Created</th>
                  <th className="px-6 py-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b, index) => (
                  <tr key={b.id} style={{animationDelay: `${index * 0.1}s`}} className="animate-fadeIn">
                    <td className="px-6 py-4 text-sm font-medium">{b.id}</td>
                    <td className="px-6 py-4 text-sm">{b.vendorId}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 hover:scale-105 ${
                        b.status === 'approved'
                          ? 'status-approved'
                          : b.status === 'rejected'
                          ? 'status-rejected'
                          : 'status-pending'
                      }`}>
                        {b.status === 'approved' && '✅ '}
                        {b.status === 'rejected' && '❌ '}
                        {b.status === 'pending' && '⏳ '}
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-opacity-80">
                      {new Date(b.createdAt || '').toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/bapb/${b.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded-lg hover:bg-blue-500 hover:bg-opacity-30 hover:text-blue-200 transition-all duration-300 hover:scale-105"
                      >
                        <span className="mr-1">👁️</span>
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BAPBList;
