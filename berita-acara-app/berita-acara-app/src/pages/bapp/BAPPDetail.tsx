import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBAPPById, approveBAPP, rejectBAPP, BAPP } from '../../services/bappService';
import { useAuth } from '../../context/AuthContext';

const BAPPDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BAPP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const res = await getBAPPById(id);
      if (res.success) setData(res.data ?? null);
      else setError(res.error || 'Dokumen tidak ditemukan');
      setLoading(false);
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    if (!id || !userProfile) return;
    await approveBAPP(id, { userId: userProfile.email || 'unknown', name: userProfile.name });
    const refreshed = await getBAPPById(id);
    if (refreshed.success) setData(refreshed.data ?? null);
  };

  const handleReject = async () => {
    if (!id || !userProfile) return;
    const reason = prompt('Alasan penolakan:') || 'No reason provided';
    await rejectBAPP(id, reason, { userId: userProfile.email || 'unknown', name: userProfile.name });
    const refreshed = await getBAPPById(id);
    if (refreshed.success) setData(refreshed.data ?? null);
  };

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!data) return <div className="detail-empty">Tidak ada data</div>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h3 className="detail-title">BAPP Detail</h3>
      </div>

      <div className="detail-card">
        <div className="detail-row"><strong>ID:</strong> <span>{data.id}</span></div>
        <div className="detail-row"><strong>Vendor:</strong> <span>{data.vendorId}</span></div>
        <div className="detail-row"><strong>Status:</strong> <span>{data.status}</span></div>
        <div className="detail-row"><strong>Created:</strong> <span>{data.createdAt}</span></div>

        <div className="detail-row">
          <strong>Work Details:</strong>
          <pre className="detail-pre">{JSON.stringify(data.workDetails, null, 2)}</pre>
        </div>

        <div className="detail-row">
          <strong>Notes:</strong>
          <div className="detail-notes">{data.notes}</div>
        </div>

        <div className="detail-actions">
          <button
            onClick={handleApprove}
            disabled={data.status === 'approved'}
            className="btn btn-approve"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={data.status === 'rejected'}
            className="btn btn-reject"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default BAPPDetail;
