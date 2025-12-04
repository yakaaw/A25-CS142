import React from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Work as WorkIcon } from '@mui/icons-material';

interface WorkDetail {
  description: string;
  hours?: number | '';
  notes?: string;
  tempId?: string;
}

interface Props {
  details: WorkDetail[];
  onChange: (d: WorkDetail[]) => void;
}

const WorkDetailsEditor: React.FC<Props> = ({ details, onChange }) => {
  const handleAdd = () => {
    onChange([...details, { description: '', hours: '', notes: '', tempId: Math.random().toString(36).substring(2, 11) }]);
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
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Tambah Pekerjaan
        </Button>
      </Box>

      {details.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" fontWeight={600} gutterBottom>
            Belum ada detail pekerjaan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Klik tombol "Tambah Pekerjaan" untuk menambahkan detail baru
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}>#</TableCell>
                <TableCell>Deskripsi Pekerjaan</TableCell>
                <TableCell width={100}>Jam</TableCell>
                <TableCell width={200}>Catatan</TableCell>
                <TableCell width={80} align="center">
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.map((d, idx) => (
                <TableRow key={d.tempId || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Masukkan deskripsi pekerjaan"
                      value={d.description}
                      onChange={(e) => handleChange(idx, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      placeholder="0"
                      slotProps={{ htmlInput: { min: 0 } }}
                      value={d.hours}
                      onChange={(e) => handleChange(idx, 'hours', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Catatan singkat"
                      value={d.notes}
                      onChange={(e) => handleChange(idx, 'notes', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleRemove(idx)} title="Hapus pekerjaan">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default WorkDetailsEditor;
