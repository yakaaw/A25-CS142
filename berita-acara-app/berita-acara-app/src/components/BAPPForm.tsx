import React, { useState } from 'react';
import { BAPP, createBAPP } from '../services/bappService';
import WorkDetailsEditor from './WorkDetailsEditor';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { uploadFile } from '../services/storageService';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Vendor ID</label>
        <Controller
          control={control}
          name="vendorId"
          render={({ field }) => (
            <input
              {...field}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          )}
        />
        {formState.errors.vendorId && <div className="text-red-600 text-sm">{(formState.errors.vendorId as any).message}</div>}
      </div>

      <div>
        <WorkDetailsEditor details={workDetails} onChange={setWorkDetails} />
        {formState.errors.workDetails && <div className="text-red-600 text-sm">{(formState.errors.workDetails as any).message}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Lampiran (opsional)</label>
        <input type="file" {...register('attachment')} className="mt-1" />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Menyimpan...' : 'Simpan BAPP'}
        </button>
      </div>
    </form>
  );
};

export default BAPPForm;
