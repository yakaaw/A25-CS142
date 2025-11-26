import React, { useState } from 'react';
import { BAPP, createBAPP } from '../services/bappService';
import WorkDetailsEditor from './WorkDetailsEditor';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { uploadFile } from '../services/storageService';
import { Save, AlertCircle, Upload } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState, register } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: { vendorId: initial.vendorId || '', workDetails: initial.workDetails || [] }
  });

  const onSubmit = async (vals: any) => {
    setError(null);
    setLoading(true);

    try {
      let attachmentUrl: string | undefined;
      if (vals.attachment && vals.attachment.length > 0) {
        const file: File = vals.attachment[0];
        const res = await uploadFile(file, 'bapp');
        attachmentUrl = res.url;
      }

      const payload: Partial<BAPP> = { vendorId: vals.vendorId, workDetails, notes, attachmentUrl };
      const res = await createBAPP(payload);
      if (res.success && res.id) {
        onSaved && onSaved(res.id);
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
          <label className="form-label">Vendor ID <span className="form-required">*</span></label>
          <Controller
            control={control}
            name="vendorId"
            render={({ field }) => (
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
        <h3 className="form-section-title">Detail Pekerjaan</h3>
        <WorkDetailsEditor details={workDetails} onChange={setWorkDetails} />
        {formState.errors.workDetails && (
          <p className="form-error">{(formState.errors.workDetails as any).message}</p>
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
          <label className="form-label">
            <Upload size={16} className="form-label-icon" />
            Lampiran (opsional)
          </label>
          <div className="form-file-wrapper">
            <input type="file" {...register('attachment')} className="form-file-input" />
            <p className="form-file-hint">PDF, DOC, atau gambar (maks. 5MB)</p>
          </div>
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
