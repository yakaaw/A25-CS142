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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Tidak ada data</div>;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">BAPP Detail</h3>
      </div>

      <div className="bg-white rounded shadow p-4 space-y-3">
        <div><strong>ID:</strong> <span className="text-gray-700">{data.id}</span></div>
        <div><strong>Vendor:</strong> <span className="text-gray-700">{data.vendorId}</span></div>
        <div><strong>Status:</strong> <span className="text-gray-700">{data.status}</span></div>
        <div><strong>Created:</strong> <span className="text-gray-700">{data.createdAt}</span></div>

        <div>
          <strong>Work Details:</strong>
          <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(data.workDetails, null, 2)}</pre>
        </div>

        <div>
          <strong>Notes:</strong>
          <div className="mt-1 text-gray-700">{data.notes}</div>
        </div>

        <div className="pt-3">
          <button
            onClick={handleApprove}
            disabled={data.status === 'approved'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
            disabled={data.status === 'rejected'}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default BAPPDetail;
