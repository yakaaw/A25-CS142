import React from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';

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
    <div className="items-editor">
      <div className="items-editor-header">
        <button type="button" onClick={handleAdd} className="items-add-btn">
          <Plus size={16} />
          <span>Tambah Pekerjaan</span>
        </button>
      </div>

      {details.length === 0 ? (
        <div className="items-empty">
          <Briefcase size={32} className="items-empty-icon" />
          <p>Belum ada detail pekerjaan</p>
          <span>Klik tombol "Tambah Pekerjaan" untuk menambahkan detail baru</span>
        </div>
      ) : (
        <div className="items-list">
          <div className="work-table-header">
            <span className="work-col-desc">Deskripsi Pekerjaan</span>
            <span className="work-col-hours">Jam</span>
            <span className="work-col-notes">Catatan</span>
            <span className="work-col-action"></span>
          </div>
          {details.map((d, idx) => (
            <div key={idx} className="items-row">
              <div className="items-row-number">{idx + 1}</div>
              <input
                className="items-input work-input-desc"
                placeholder="Masukkan deskripsi pekerjaan"
                value={d.description}
                onChange={(e) => handleChange(idx, 'description', e.target.value)}
              />
              <input
                className="items-input work-input-hours"
                placeholder="0"
                type="number"
                min={0}
                value={d.hours as any}
                onChange={(e) => handleChange(idx, 'hours', e.target.value === '' ? '' : Number(e.target.value))}
              />
              <input
                className="items-input work-input-notes"
                placeholder="Catatan singkat"
                value={d.notes}
                onChange={(e) => handleChange(idx, 'notes', e.target.value)}
              />
              <button
                type="button"
                className="items-remove-btn"
                onClick={() => handleRemove(idx)}
                title="Hapus pekerjaan"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkDetailsEditor;
