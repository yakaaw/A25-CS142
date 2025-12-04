import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import {
  Print as PrintIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { getBAPBById, approveBAPB, rejectBAPB, BAPB } from '../../services/bapbService';
import { useAuth } from '../../context/AuthContext';
import ApprovalTimeline from '../../components/ApprovalTimeline';
import { generateBAPBPDF } from '../../utils/pdfGenerator';

const BAPBDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BAPB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, permissions } = useAuth();

  const fetchData = useCallback(async () => {
    if (!id) return;
    const res = await getBAPBById(id);
    if (res.success) setData(res.data ?? null);
    else setError(res.error || 'Dokumen tidak ditemukan');
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id, fetchData]);

  const handleApprove = async () => {
    if (!id || !userProfile?.uid) return;
    const notes = prompt('Catatan approval (opsional):');

    const result = await approveBAPB(
      id,
      {
        uid: userProfile.uid,
        name: userProfile.name || userProfile.email || 'Unknown',
        role: userProfile.role || 'unknown',
      },
      notes || undefined
    );

    if (result.success) {
      fetchData();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleReject = async () => {
    if (!id || !userProfile?.uid) return;
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    await rejectBAPB(id, {
      uid: userProfile.uid,
      name: userProfile.name || userProfile.email || 'Unknown',
      role: userProfile.role || 'unknown',
    }, reason);

    fetchData();
  };

  const canApprove = () => {
    if (!data || (!permissions.includes('bapb.verify') && !permissions.includes('bapb.approve'))) return false;
    if (data.status === 'rejected') return false;
    if (permissions.includes('bapb.verify') && data.currentStage === 'waiting_pic') return true;
    if (permissions.includes('bapb.approve') && data.currentStage === 'waiting_direksi') return true;
    return false;
  };

  const getApproveButtonText = () => {
    if (permissions.includes('bapb.verify')) return 'Verifikasi & Terbitkan';
    if (permissions.includes('bapb.approve')) return 'Setujui Dokumen';
    return 'Setujui';
  };

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
        <CircularProgress />
      </Box>
    );
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;
  if (!data) return <Container><Typography>Tidak ada data</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/bapb" underline="hover">
            BAPB
          </MuiLink>
          <Typography color="text.primary">Detail</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight={700}>
              BAPB Detail
            </Typography>
            <Chip label={data.status} color={getStatusColor(data.status || 'pending') as any} />
          </Box>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => data && generateBAPBPDF(data)}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Main Content */}
        <Stack spacing={3}>
          {/* Document Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informasi Dokumen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ID Dokumen
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {data.id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Vendor ID
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {data.vendorId}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tanggal Dibuat
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(data.createdAt || '').toLocaleString('id-ID')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tahapan Saat Ini
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                  {data.currentStage?.replaceAll('_', ' ').replace('waiting', 'Menunggu')}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Items */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daftar Barang
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Deskripsi</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Kondisi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items?.map((item, idx) => (
                    <TableRow key={item.id || `item-${idx}-${item.description}`} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{item.description}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <Chip label={item.condition} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Notes */}
          {data.notes && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Catatan
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                {data.notes}
              </Typography>
            </Paper>
          )}

          {/* Attachments */}
          {data.attachments && data.attachments.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Lampiran
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {data.attachments.map((url, idx) => (
                  <Button
                    key={`attachment-${idx}-${url.substring(url.length - 20)}`}
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Lampiran {idx + 1}
                  </Button>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>

        {/* Sidebar */}
        <Stack spacing={3}>
          {/* Approval Timeline */}
          <Paper sx={{ p: 3 }}>
            <ApprovalTimeline currentStage={data.currentStage} approvalHistory={data.approvalHistory} />
          </Paper>

          {/* Actions */}
          {canApprove() && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tindakan
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApprove}
                >
                  {getApproveButtonText()}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<CancelIcon />}
                  onClick={handleReject}
                >
                  Tolak Dokumen
                </Button>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default BAPBDetail;
