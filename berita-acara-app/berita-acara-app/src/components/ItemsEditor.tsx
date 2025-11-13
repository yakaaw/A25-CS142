import React from 'react';

interface Item {
  id?: string;
  description: string;
  qty: number | '';
  unit: string;
  condition?: string;
}

interface Props {
  items: Item[];
  onChange: (items: Item[]) => void;
}

const ItemsEditor: React.FC<Props> = ({ items, onChange }) => {
  const handleAdd = () => {
    const next: Item = { description: '', qty: 1, unit: '', condition: '' };
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">Items</label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >
          + Tambah Item
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-gray-500">Belum ada item.</div>}
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <input
              className="col-span-6 p-2 border rounded"
              placeholder="Deskripsi item"
              value={it.description}
              onChange={(e) => handleChange(idx, 'description', e.target.value)}
            />
            <input
              className="col-span-2 p-2 border rounded"
              placeholder="Qty"
              type="number"
              min={0}
              value={it.qty as any}
              onChange={(e) => handleChange(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <input
              className="col-span-2 p-2 border rounded"
              placeholder="Unit"
              value={it.unit}
              onChange={(e) => handleChange(idx, 'unit', e.target.value)}
            />
            <input
              className="col-span-1 p-2 border rounded"
              placeholder="Cond"
              value={it.condition}
              onChange={(e) => handleChange(idx, 'condition', e.target.value)}
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

export default ItemsEditor;
