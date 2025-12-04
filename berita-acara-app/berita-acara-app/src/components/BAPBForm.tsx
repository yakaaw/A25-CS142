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
import { BAPB, createBAPB, BAPBItem } from '../services/bapbService';
import ItemsEditor from './ItemsEditor';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
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
        condition: yup.string().optional(),
      })
    )
    .min(1, 'Minimal 1 item')
    .required('Daftar item wajib diisi'),
});

const BAPBForm: React.FC<Props> = ({ initial = {}, onSaved }) => {
  const [items, setItems] = useState<any[]>(initial.items || []);
  const [notes, setNotes] = useState(initial.notes || '');
  const [attachments, setAttachments] = useState<string[]>(initial.attachments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState, setValue } = useForm<BAPBFormData>({
    resolver: yupResolver(schema),
    defaultValues: { vendorId: initial.vendorId || '', items: initial.items || [] },
  });

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
        onSaved?.(res.id);
      } else {
        setError(res.error || 'Gagal menyimpan BAPB');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menyimpan');
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
            render={({ field }: { field: ControllerRenderProps<BAPBFormData, 'vendorId'> }) => (
              <TextField
                {...field}
                fullWidth
                label="Vendor ID"
                placeholder="Masukkan ID vendor"
                required
                error={!!formState.errors.vendorId}
                helperText={formState.errors.vendorId?.message}
              />
            )}
          />
        </Paper>

        {/* Items List */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Daftar Item
          </Typography>
          <ItemsEditor items={items} onChange={setItems} />
          {formState.errors.items && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {(formState.errors.items as any).message}
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
              path="bapb"
              label="Lampiran (opsional)"
              onUploadComplete={(url) => setAttachments((prev) => [...prev, url])}
            />

            {attachments.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  File Terlampir:
                </Typography>
                <List dense>
                  {attachments.map((url) => (
                    <ListItem key={url}>
                      <ListItemText>
                        <MuiLink href={url} target="_blank" rel="noopener noreferrer">
                          Lampiran {attachments.indexOf(url) + 1}
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
            {loading ? 'Menyimpan...' : 'Simpan BAPB'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default BAPBForm;
