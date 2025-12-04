import React, { useState } from 'react';
import { BAPB, createBAPB, BAPBItem } from '../services/bapbService';
import ItemsEditor from './ItemsEditor';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Save, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';

interface BAPBFormData {
  vendorId: string;
  items: BAPBItem[];
}

interface Props {
  initial?: Partial<BAPB>;
  onSaved?: (id: string) => void;
}

const schema = yup.object({
  vendorId: yup.string().required('Vendor ID wajib diisi'),
  items: yup
    .array()
    .of(
      yup.object({
        description: yup.string().required('Deskripsi item wajib'),
        qty: yup.number().min(0).required('Qty wajib'),
        unit: yup.string().required('Unit wajib'),
        condition: yup.string().optional()
      })
    )
    .min(1, 'Minimal 1 item')
    .required('Daftar item wajib diisi')
});

const BAPBForm: React.FC<Props> = ({ initial = {}, onSaved }) => {
  const [items, setItems] = useState<any[]>(initial.items || []);
  const [notes, setNotes] = useState(initial.notes || '');
  const [attachments, setAttachments] = useState<string[]>(initial.attachments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState, setValue } = useForm<BAPBFormData>({
    resolver: yupResolver(schema),
    defaultValues: { vendorId: initial.vendorId || '', items: initial.items || [] }
  });

  // Sync items state with form
  React.useEffect(() => {
    setValue('items', items);
  }, [items, setValue]);

  const onSubmit = async (vals: BAPBFormData) => {
    setError(null);
    setLoading(true);

    try {
      const payload: Partial<BAPB> = { vendorId: vals.vendorId, items: items, notes, attachments };
      const res = await createBAPB(payload);
      if (res.success && res.id) {
        onSaved && onSaved(res.id);
      } else {
        setError(res.error || 'Gagal menyimpan BAPB');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menyimpan');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-modern">
      {error && (
        <div className="form-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-section">
        <h3 className="form-section-title">Informasi Vendor</h3>
        <div className="form-group">
          <label className="form-label">Vendor ID <span className="form-required">*</span></label>
          <Controller
            control={control}
            name="vendorId"
            render={({ field }: { field: ControllerRenderProps<BAPBFormData, 'vendorId'> }) => (
              <input
                {...field}
                className="form-input"
                placeholder="Masukkan ID vendor"
              />
            )}
          />
          {formState.errors.vendorId && (
            <p className="form-error">{(formState.errors.vendorId as any).message}</p>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Daftar Item</h3>
        <ItemsEditor items={items} onChange={setItems} />
        {formState.errors.items && (
          <p className="form-error">{(formState.errors.items as any).message}</p>
        )}
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Catatan & Lampiran</h3>
        <div className="form-group">
          <label className="form-label">Catatan</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Tambahkan catatan jika diperlukan..."
          />
        </div>

        <div className="form-group">
          <FileUpload
            path="bapb"
            label="Lampiran (opsional)"
            onUploadComplete={(url) => setAttachments((prev) => [...prev, url])}
          />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium text-gray-700">File Terlampir:</p>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {attachments.map((url, idx) => (
                  <li key={idx}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Lampiran {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="form-submit-btn">
          <Save size={18} />
          <span>{loading ? 'Menyimpan...' : 'Simpan BAPB'}</span>
        </button>
      </div>
    </form>
  );
};

export default BAPBForm;
