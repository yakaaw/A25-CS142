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
import { Add as AddIcon, Delete as DeleteIcon, Inventory as InventoryIcon } from '@mui/icons-material';

interface Item {
  id?: string;
  description: string;
  qty: number | '';
  unit: string;
  condition?: string;
  tempId?: string;
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
      tempId: Math.random().toString(36).substring(2, 11),
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
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Tambah Item
        </Button>
      </Box>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" fontWeight={600} gutterBottom>
            Belum ada item ditambahkan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Klik tombol "Tambah Item" untuk menambahkan item baru
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}>#</TableCell>
                <TableCell>Deskripsi Item</TableCell>
                <TableCell width={100}>Qty</TableCell>
                <TableCell width={120}>Unit</TableCell>
                <TableCell width={150}>Kondisi</TableCell>
                <TableCell width={80} align="center">
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it, idx) => (
                <TableRow key={it.id || it.tempId || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Masukkan deskripsi item"
                      value={it.description}
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
                      value={it.qty}
                      onChange={(e) => handleChange(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="pcs"
                      value={it.unit}
                      onChange={(e) => handleChange(idx, 'unit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Baik"
                      value={it.condition}
                      onChange={(e) => handleChange(idx, 'condition', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleRemove(idx)} title="Hapus item">
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

export default ItemsEditor;
