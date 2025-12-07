import React, { useEffect, useState, useCallback } from "react";
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
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import { getAllBAPP, BAPP, archiveBAPP } from "../../services/bappService";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getPendingStatusMessage } from "../../utils/statusHelper";

const BAPPList: React.FC = () => {
  const [list, setList] = useState<BAPP[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Action menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBAPP, setSelectedBAPP] = useState<BAPP | null>(null);

  // Archive dialog state
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isAdmin = userProfile?.role === "admin";

  const load = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await getAllBAPP({
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
    },
    [filterStatus, lastDoc]
  );

  useEffect(() => {
    load();
  }, [filterStatus, load]);

  // Filter list based on search query
  const filteredList = list.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.id?.toLowerCase().includes(query) ||
      item.vendorId?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query) ||
      item.currentStage?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, bapp: BAPP) => {
    setAnchorEl(event.currentTarget);
    setSelectedBAPP(bapp);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetail = () => {
    if (selectedBAPP?.id) {
      navigate(`/bapp/${selectedBAPP.id}`);
    }
    handleMenuClose();
  };

  const handleArchiveClick = () => {
    setArchiveDialogOpen(true);
    handleMenuClose();
  };

  const handleArchiveConfirm = async () => {
    if (!selectedBAPP?.id || !userProfile?.uid) return;

    setArchiving(true);
    const result = await archiveBAPP(selectedBAPP.id, userProfile.uid);

    if (result.success) {
      showToast("BAPP berhasil diarsipkan", "success");
      setArchiveDialogOpen(false);
      setSelectedBAPP(null);
      // Reload list
      load();
    } else {
      showToast("Gagal mengarsipkan BAPP", "error");
    }

    setArchiving(false);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading BAPP...</Typography>
        </Stack>
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <PageHeader
        title="Daftar BAPP"
        description="Berita Acara Penyelesaian Pekerjaan"
        breadcrumbs={[{ label: "BAPP" }]}
      />

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Cari ID, vendor, atau status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "action.active" }} />
              ),
            },
          }}
        />
        <Stack direction="row" spacing={2}>
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }}
            slotProps={{
              input: {
                startAdornment: (
                  <FilterListIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              },
            }}
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/bapp/new"
          >
            Buat BAPP Baru
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
            {filteredList.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.vendorId}</TableCell>
                <TableCell>
                  <Chip
                    label={b.status}
                    size="small"
                    color={getStatusColor(b.status || "pending") as any}
                  />
                </TableCell>
                <TableCell>
                  {new Date(b.createdAt || "").toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, b)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMore && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button onClick={() => load(true)} disabled={loadingMore}>
            {loadingMore ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
          </Button>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetail}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Detail
        </MenuItem>
        <MenuItem onClick={handleArchiveClick} disabled={!isAdmin}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Arsipkan
        </MenuItem>
      </Menu>

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={archiveDialogOpen}
        onClose={() => !archiving && setArchiveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Konfirmasi Arsipkan BAPP</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              Dokumen yang diarsipkan akan dipindahkan ke halaman arsip dan
              tidak akan muncul di daftar utama.
            </Alert>

            {selectedBAPP && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Nomor Dokumen
                </Typography>
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {selectedBAPP.id}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Status Saat Ini
                </Typography>
                <Typography variant="body2">
                  {getPendingStatusMessage(
                    selectedBAPP.currentStage || "draft",
                    "BAPP"
                  )}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setArchiveDialogOpen(false)}
            disabled={archiving}
          >
            Batal
          </Button>
          <Button
            onClick={handleArchiveConfirm}
            variant="contained"
            color="warning"
            disabled={archiving}
          >
            {archiving ? "Mengarsipkan..." : "Arsipkan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BAPPList;
