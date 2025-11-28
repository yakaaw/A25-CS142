import React, { useState } from 'react';
import { BAPP, createBAPP } from '../services/bappService';
import WorkDetailsEditor from './WorkDetailsEditor';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Save, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';

interface Props {
  initial?: Partial<BAPP>;
  onSaved?: (id: string) => void;
}

const schema = yup.object({
  vendorId: yup.string().required('Vendor ID wajib diisi'),
  workDetails: yup
    .array()
    .of(
      yup.object({
        description: yup.string().required('Deskripsi pekerjaan wajib')
      })
    )
    .min(1, 'Minimal 1 detail pekerjaan')
});

const BAPPForm: React.FC<Props> = ({ initial = {}, onSaved }) => {
  const [workDetails, setWorkDetails] = useState<any[]>(initial.workDetails || []);
  const [notes, setNotes] = useState(initial.notes || '');
  const [attachments, setAttachments] = useState<string[]>(initial.attachments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: { vendorId: initial.vendorId || '', workDetails: initial.workDetails || [] }
  });

  const onSubmit = async (vals: any) => {
    setError(null);
    setLoading(true);

    try {
      const payload: Partial<BAPP> = { vendorId: vals.vendorId, workDetails, notes, attachments };
      const res = await createBAPP(payload);
      if (res.success && res.id) {
        onSaved?.(res.id);
      } else {
        setError(res.error || 'Gagal menyimpan BAPP');
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan BAPP');
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
          <label htmlFor="vendorId" className="form-label">Vendor ID <span className="form-required">*</span></label>
          <Controller
            control={control}
            name="vendorId"
            render={({ field }) => (
              <input
                {...field}
                id="vendorId"
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
        <h3 className="form-section-title">Detail Pekerjaan</h3>
        <WorkDetailsEditor details={workDetails} onChange={setWorkDetails} />
        {formState.errors.workDetails && (
          <p className="form-error">{(formState.errors.workDetails as any).message}</p>
        )}
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Catatan & Lampiran</h3>
        <div className="form-group">
          <label htmlFor="notes" className="form-label">Catatan</label>
          <textarea
            id="notes"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Tambahkan catatan jika diperlukan..."
          />
        </div>

        <div className="form-group">
          <FileUpload
            path="bapp"
            label="Lampiran (opsional)"
            onUploadComplete={(url) => setAttachments((prev) => [...prev, url])}
          />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium text-gray-700">File Terlampir:</p>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {attachments.map((url, idx) => (
                  <li key={`${url}-${idx}`}>
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
          <span>{loading ? 'Menyimpan...' : 'Simpan BAPP'}</span>
        </button>
      </div>
    </form>
  );
};

export default BAPPForm;
