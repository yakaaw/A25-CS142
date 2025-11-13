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

  if (loading) return <div className="p-6">Loading BAPP...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold">Daftar BAPP</h3>
        <Link to="/bapp/new" className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Buat BAPP baru
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vendor</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {list.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-sm text-gray-800">{b.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{b.vendorId}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{b.status}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{b.createdAt}</td>
                <td className="px-4 py-3 text-sm">
                  <Link to={`/bapp/${b.id}`} className="text-indigo-600 hover:underline">Lihat</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BAPPList;
