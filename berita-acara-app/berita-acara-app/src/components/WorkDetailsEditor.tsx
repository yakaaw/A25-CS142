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
    <div className="work-details-editor">
      <div className="work-details-header">
        <label className="work-details-label">Work Details</label>
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-add"
        >
          + Tambah
        </button>
      </div>

      <div className="work-details-list">
        {details.length === 0 && <div className="work-details-empty">Belum ada detail pekerjaan.</div>}
        {details.map((d, idx) => (
          <div key={idx} className="work-details-row">
            <input
              className="work-input work-input-desc"
              placeholder="Deskripsi pekerjaan"
              value={d.description}
              onChange={(e) => handleChange(idx, 'description', e.target.value)}
            />
            <input
              className="work-input work-input-hours"
              placeholder="Jam"
              type="number"
              min={0}
              value={d.hours as any}
              onChange={(e) => handleChange(idx, 'hours', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <input
              className="work-input work-input-notes"
              placeholder="Catatan singkat"
              value={d.notes}
              onChange={(e) => handleChange(idx, 'notes', e.target.value)}
            />
            <button
              type="button"
              className="btn btn-remove"
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
