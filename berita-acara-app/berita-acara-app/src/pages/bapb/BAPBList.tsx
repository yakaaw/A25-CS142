import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Typography,
  Box,
  CircularProgress,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { getAllBAPB, BAPB } from '../../services/bapbService';
import { Link } from 'react-router-dom';

const BAPBList: React.FC = () => {
  const [list, setList] = useState<BAPB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const res = await getAllBAPB({
      limit: 10,
      status: filterStatus,
      lastDoc: isLoadMore ? lastDoc : undefined,
    });

    if (res.success) {
      const newData = res.data ?? [];
      if (isLoadMore) {
        setList((prev) => [...prev, ...newData]);
      } else {
        setList(newData);
      }
      setLastDoc(res.lastDoc);
      setHasMore(newData.length === 10);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading BAPB...</Typography>
        </Stack>
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          📄 Daftar BAPB
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }}
            slotProps={{
              input: {
                startAdornment: <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />,
              },
            }}
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/bapb/new">
            Buat BAPB Baru
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.vendorId}</TableCell>
                <TableCell>
                  <Chip label={b.status} size="small" color={getStatusColor(b.status || 'pending') as any} />
                </TableCell>
                <TableCell>{new Date(b.createdAt || '').toLocaleDateString('id-ID')}</TableCell>
                <TableCell align="right">
                  <Button
                    component={Link}
                    to={`/bapb/${b.id}`}
                    size="small"
                    startIcon={<VisibilityIcon />}
                    variant="outlined"
                  >
                    Lihat
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMore && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button onClick={() => load(true)} disabled={loadingMore}>
            {loadingMore ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default BAPBList;
