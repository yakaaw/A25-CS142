import React, { useEffect, useState } from 'react';
import { getAllBAPB, BAPB } from '../../services/bapbService';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';

const BAPBList: React.FC = () => {
  const [list, setList] = useState<BAPB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const res = await getAllBAPB({
      limit: 10,
      status: filterStatus,
      lastDoc: isLoadMore ? lastDoc : undefined
    });

    if (res.success) {
      const newData = res.data ?? [];
      if (isLoadMore) {
        setList(prev => [...prev, ...newData]);
      } else {
        setList(newData);
      }
      setLastDoc(res.lastDoc);
      setHasMore(newData.length === 10);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

  if (loading) return (
    <div className="list-loading-container">
      <div className="loading-container glass-card">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading BAPB...</p>
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot" style={{ animationDelay: '0.1s' }}></div>
          <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="list-page page-enter">
      <div className="list-container">
        <div className="list-header">
          <div className="list-title-group">
            <div className="list-icon float-animation">
              <span>📄</span>
            </div>
            <h3 className="list-title text-gradient">
              Daftar BAPB
            </h3>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                className="glass-input pl-10 pr-8 py-2 appearance-none cursor-pointer hover:bg-white/50 transition-colors"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>

            <Link to="/bapb/new" className="glass-button list-add-btn pulse-glow">
              <span>➕</span>
              Buat BAPB baru
            </Link>
          </div>
        </div>

        <div className="glass-card list-card">
          <div className="table-wrapper">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b, index) => (
                  <tr key={b.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fadeIn">
                    <td>{b.id}</td>
                    <td>{b.vendorId}</td>
                    <td>
                      <span className={`status-badge ${b.status === 'approved'
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
                    <td>
                      {new Date(b.createdAt || '').toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <Link to={`/bapb/${b.id}`} className="view-link">
                        <span>👁️</span>
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="p-4 flex justify-center border-t border-gray-100">
              <button
                onClick={() => load(true)}
                disabled={loadingMore}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Memuat...
                  </>
                ) : (
                  'Muat Lebih Banyak'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BAPBList;
