import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';

interface Item {
  id?: string;
  description: string;
  qty: number | '';
  unit: string;
  condition?: string;
  tempId?: string; // For UI key only
}

interface Props {
  items: Item[];
  onChange: (items: Item[]) => void;
}

const ItemsEditor: React.FC<Props> = ({ items, onChange }) => {
  const handleAdd = () => {
    const next: Item = {
      description: '',
      qty: 1,
      unit: '',
      condition: '',
      tempId: Math.random().toString(36).substr(2, 9)
    };
    onChange([...items, next]);
  };

  const handleRemove = (index: number) => {
    const next = items.slice();
    next.splice(index, 1);
    onChange(next);
  };

  const handleChange = (index: number, field: keyof Item, value: any) => {
    const next = items.slice();
    (next[index] as any)[field] = value;
    onChange(next);
  };

  return (
    <div className="items-editor">
      <div className="items-editor-header">
        <button type="button" onClick={handleAdd} className="items-add-btn">
          <Plus size={16} />
          <span>Tambah Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="items-empty">
          <Package size={32} className="items-empty-icon" />
          <p>Belum ada item ditambahkan</p>
          <span>Klik tombol "Tambah Item" untuk menambahkan item baru</span>
        </div>
      ) : (
        <div className="items-list">
          <div className="items-table-header">
            <span className="items-col-desc">Deskripsi Item</span>
            <span className="items-col-qty">Qty</span>
            <span className="items-col-unit">Unit</span>
            <span className="items-col-cond">Kondisi</span>
            <span className="items-col-action"></span>
          </div>
          {items.map((it, idx) => (
            <div key={it.id || it.tempId || idx} className="items-row">
              <div className="items-row-number">{idx + 1}</div>
              <input
                className="items-input items-input-desc"
                placeholder="Masukkan deskripsi item"
                value={it.description}
                onChange={(e) => handleChange(idx, 'description', e.target.value)}
              />
              <input
                className="items-input items-input-qty"
                placeholder="0"
                type="number"
                min={0}
                value={it.qty as any}
                onChange={(e) => handleChange(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
              />
              <input
                className="items-input items-input-unit"
                placeholder="pcs"
                value={it.unit}
                onChange={(e) => handleChange(idx, 'unit', e.target.value)}
              />
              <input
                className="items-input items-input-cond"
                placeholder="Baik"
                value={it.condition}
                onChange={(e) => handleChange(idx, 'condition', e.target.value)}
              />
              <button
                type="button"
                className="items-remove-btn"
                onClick={() => handleRemove(idx)}
                title="Hapus item"
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

export default ItemsEditor;
