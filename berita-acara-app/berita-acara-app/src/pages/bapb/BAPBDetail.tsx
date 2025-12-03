import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getBAPBById, approveBAPB, rejectBAPB, BAPB } from '../../services/bapbService';
import { useAuth } from '../../context/AuthContext';
import ApprovalTimeline from '../../components/ApprovalTimeline';
import { Printer, Paperclip } from 'lucide-react';
import { generateBAPBPDF } from '../../utils/pdfGenerator';

const BAPBDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BAPB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, permissions } = useAuth();

  const fetchData = useCallback(async () => {
    if (!id) return;
    const res = await getBAPBById(id);
    if (res.success) setData(res.data ?? null);
    else setError(res.error || 'Dokumen tidak ditemukan');
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id, fetchData]);

  const handleApprove = async () => {
    if (!id || !userProfile?.uid) return;

    console.log('handleApprove called with:', {
      id,
      userProfile: {
        uid: userProfile.uid,
        name: userProfile.name,
        role: userProfile.role
      }
    });

    const notes = prompt('Catatan approval (opsional):');

    const result = await approveBAPB(id, {
      uid: userProfile.uid,
      name: userProfile.name || userProfile.email || 'Unknown',
      role: userProfile.role || 'unknown'
    }, notes || undefined);

    console.log('approveBAPB result:', result);

    if (result.success) {
      fetchData();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleReject = async () => {
    if (!id || !userProfile?.uid) return;
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    await rejectBAPB(id, {
      uid: userProfile.uid,
      name: userProfile.name || userProfile.email || 'Unknown',
      role: userProfile.role || 'unknown'
    }, reason);

    fetchData();
  };

  const canApprove = () => {
    console.log('canApprove check:', {
      data: !!data,
      permissions,
      hasVerify: permissions.includes('bapb.verify'),
      hasApprove: permissions.includes('bapb.approve'),
      currentStage: data?.currentStage,
      status: data?.status
    });

    if (!data || (!permissions.includes('bapb.verify') && !permissions.includes('bapb.approve'))) return false;
    if (data.status === 'rejected') return false;

    // PIC Gudang can verify at waiting_pic, Direksi can approve at waiting_direksi
    if (permissions.includes('bapb.verify') && data.currentStage === 'waiting_pic') return true;
    if (permissions.includes('bapb.approve') && data.currentStage === 'waiting_direksi') return true;
    return false;
  };

  const canReject = () => {
    return canApprove(); // Same logic for reject
  };

  const getApproveButtonText = () => {
    if (permissions.includes('bapb.verify')) return 'Verifikasi & Terbitkan';
    if (permissions.includes('bapb.approve')) return 'Setujui Dokumen';
    return 'Setujui';
  };

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!data) return <div className="detail-empty">Tidak ada data</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Dashboard / BAPB / Detail</div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">BAPB Detail</h1>
            <span className={`status-badge status-${data.status}`}>{data.status}</span>
          </div>
        </div>
        <button
          onClick={() => data && generateBAPBPDF(data)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Printer size={18} />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Dokumen</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">ID Dokumen</p>
                <p className="font-medium text-gray-900">{data.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Vendor ID</p>
                <p className="font-medium text-gray-900">{data.vendorId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tanggal Dibuat</p>
                <p className="font-medium text-gray-900">{new Date(data.createdAt || '').toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tahapan Saat Ini</p>
                <p className="font-medium text-gray-900 capitalize">{data.currentStage?.replaceAll('_', ' ').replace('waiting', 'Menunggu')}</p>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Daftar Barang</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Deskripsi</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3 rounded-r-lg">Kondisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.items?.map((item, idx) => (
                    <tr key={`${item.description}-${item.qty}-${item.unit}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                      <td className="px-4 py-3">{item.qty}</td>
                      <td className="px-4 py-3">{item.unit}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs">{item.condition}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Card */}
          {data.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Catatan</h4>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{data.notes}</p>
            </div>
          )}

          {/* Attachments Card */}
          {data.attachments && data.attachments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Lampiran</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.attachments.map((url, idx) => (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                      <Paperclip size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">Lampiran {idx + 1}</p>
                      <p className="text-xs text-blue-600">Klik untuk melihat</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Approval Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ApprovalTimeline currentStage={data.currentStage} approvalHistory={data.approvalHistory} />
          </div>

          {/* Actions */}
          {canApprove() && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Tindakan</h4>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApprove}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
                >
                  {getApproveButtonText()}
                </button>
                {canReject() && (
                  <button
                    onClick={handleReject}
                    className="w-full bg-white text-red-600 border border-red-200 py-2.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    Tolak Dokumen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BAPBDetail;
