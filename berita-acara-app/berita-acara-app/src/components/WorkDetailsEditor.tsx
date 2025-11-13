import React from 'react';

interface WorkDetail {
  description: string;
  hours?: number | '';
  notes?: string;
}

interface Props {
  details: WorkDetail[];
  onChange: (d: WorkDetail[]) => void;
}

const WorkDetailsEditor: React.FC<Props> = ({ details, onChange }) => {
  const handleAdd = () => {
    onChange([...details, { description: '', hours: '', notes: '' }]);
  };

  const handleRemove = (index: number) => {
    const next = details.slice();
    next.splice(index, 1);
    onChange(next);
  };

  const handleChange = (index: number, field: keyof WorkDetail, value: any) => {
    const next = details.slice();
    (next[index] as any)[field] = value;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">Work Details</label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >
          + Tambah
        </button>
      </div>

      <div className="space-y-2">
        {details.length === 0 && <div className="text-sm text-gray-500">Belum ada detail pekerjaan.</div>}
        {details.map((d, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <input
              className="col-span-6 p-2 border rounded"
              placeholder="Deskripsi pekerjaan"
              value={d.description}
              onChange={(e) => handleChange(idx, 'description', e.target.value)}
            />
            <input
              className="col-span-2 p-2 border rounded"
              placeholder="Jam"
              type="number"
              min={0}
              value={d.hours as any}
              onChange={(e) => handleChange(idx, 'hours', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <input
              className="col-span-3 p-2 border rounded"
              placeholder="Catatan singkat"
              value={d.notes}
              onChange={(e) => handleChange(idx, 'notes', e.target.value)}
            />
            <button
              type="button"
              className="col-span-1 inline-flex justify-center items-center p-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => handleRemove(idx)}
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkDetailsEditor;
