import React, { useEffect, useState } from 'react';
import { getAllBAPP, BAPP } from '../../services/bappService';
import { Link } from 'react-router-dom';

const BAPPList: React.FC = () => {
  const [list, setList] = useState<BAPP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getAllBAPP();
      if (res.success) setList(res.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="detail-loading">Loading BAPP...</div>;

  return (
    <div className="list-page page-enter">
      <div className="list-container">
        <div className="list-header">
          <div className="list-title-group">
            <div className="list-icon float-animation">
              <span>📋</span>
            </div>
            <h3 className="list-title text-gradient">Daftar BAPP</h3>
          </div>
          <Link to="/bapp/new" className="glass-button list-add-btn pulse-glow">
            <span>➕</span>
            Buat BAPP baru
          </Link>
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
                  <tr key={b.id} style={{animationDelay: `${index * 0.1}s`}} className="animate-fadeIn">
                    <td>{b.id}</td>
                    <td>{b.vendorId}</td>
                    <td>
                      <span className={`status-badge ${
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
                    <td>{new Date(b.createdAt || '').toLocaleDateString('id-ID')}</td>
                    <td>
                      <Link to={`/bapp/${b.id}`} className="view-link">
                        <span>👁️</span>
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

export default BAPPList;
