import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
} from '@mui/material';
import { Save as SaveIcon, Warning as WarningIcon } from '@mui/icons-material';
import { BAPP, createBAPP, BAPPWorkDetail } from '../services/bappService';
import WorkDetailsEditor from './WorkDetailsEditor';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FileUpload from './FileUpload';
import { useAuth } from '../context/AuthContext';

interface BAPPFormData {
  vendorId: string;
  workDetails: BAPPWorkDetail[];
}

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
        description: yup.string().required('Deskripsi pekerjaan wajib'),
        hours: yup.number().optional(),
        notes: yup.string().optional(),
      })
    )
    .min(1, 'Minimal 1 detail pekerjaan')
    .required('Detail pekerjaan wajib diisi'),
});

const BAPPForm: React.FC<Props> = ({ initial = {}, onSaved }) => {
  const { userProfile } = useAuth();
  const [workDetails, setWorkDetails] = useState<any[]>(initial.workDetails || []);
  const [notes, setNotes] = useState(initial.notes || '');
  const [attachments, setAttachments] = useState<string[]>(initial.attachments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState, setValue } = useForm<BAPPFormData>({
    resolver: yupResolver(schema),
    defaultValues: { vendorId: initial.vendorId || userProfile?.uid || '', workDetails: initial.workDetails || [] },
  });

  React.useEffect(() => {
    setValue('workDetails', workDetails);
  }, [workDetails, setValue]);

  const onSubmit = async (vals: BAPPFormData) => {
    setError(null);
    setLoading(true);

    try {
      const payload: Partial<BAPP> = { vendorId: vals.vendorId, workDetails, notes, attachments };
      const res = await createBAPP(payload, userProfile?.uid || '', userProfile?.name, userProfile?.signatureUrl);
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
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Vendor Information */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informasi Vendor
          </Typography>
          <Controller
            control={control}
            name="vendorId"
            render={({ field }: { field: ControllerRenderProps<BAPPFormData, 'vendorId'> }) => (
              <TextField
                {...field}
                fullWidth
                label="Vendor ID"
                placeholder="Masukkan ID vendor"
                required
                disabled={userProfile?.role === 'vendor'}
                error={!!formState.errors.vendorId}
                helperText={formState.errors.vendorId?.message}
              />
            )}
          />
        </Paper>

        {/* Work Details */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detail Pekerjaan
          </Typography>
          <WorkDetailsEditor details={workDetails} onChange={setWorkDetails} />
          {formState.errors.workDetails && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {(formState.errors.workDetails as any).message}
            </Typography>
          )}
        </Paper>

        {/* Notes & Attachments */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Catatan & Lampiran
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Catatan"
              placeholder="Tambahkan catatan jika diperlukan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <FileUpload
              path="bapp"
              label="Lampiran (opsional)"
              onUploadComplete={(url) => setAttachments((prev) => [...prev, url])}
            />

            {attachments.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  File Terlampir:
                </Typography>
                <List dense>
                  {attachments.map((url, idx) => (
                    <ListItem key={`${url}-${idx}`}>
                      <ListItemText>
                        <MuiLink href={url} target="_blank" rel="noopener noreferrer">
                          Lampiran {idx + 1}
                        </MuiLink>
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading ? 'Menyimpan...' : 'Simpan BAPP'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default BAPPForm;
