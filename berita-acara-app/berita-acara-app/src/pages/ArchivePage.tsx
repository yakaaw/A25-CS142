import React, { useEffect, useState, useCallback } from 'react';
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
    Stack,
    Tabs,
    Tab,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    MoreVert as MoreVertIcon,
    RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import { getArchivedBAPB, restoreBAPB, BAPB } from '../services/bapbService';
import { getArchivedBAPP, restoreBAPP, BAPP } from '../services/bappService';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStatusColor } from '../utils/statusHelper';

type DocumentType = 'BAPB' | 'BAPP';

const ArchivePage: React.FC = () => {
    const [documentType, setDocumentType] = useState<DocumentType>('BAPB');
    const [bapbList, setBapbList] = useState<BAPB[]>([]);
    const [bappList, setBappList] = useState<BAPP[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Action menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDocument, setSelectedDocument] = useState<BAPB | BAPP | null>(null);

    // Restore dialog state
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [restoring, setRestoring] = useState(false);

    const { userProfile } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const isAdmin = userProfile?.role === 'admin';

    const loadArchived = useCallback(async () => {
        setLoading(true);

        if (documentType === 'BAPB') {
            const res = await getArchivedBAPB();
            if (res.success) {
                setBapbList(res.data || []);
            }
        } else {
            const res = await getArchivedBAPP();
            if (res.success) {
                setBappList(res.data || []);
            }
        }

        setLoading(false);
    }, [documentType]);

    useEffect(() => {
        loadArchived();
    }, [loadArchived]);

    // Filter list based on search query
    const getFilteredList = (): (BAPB | BAPP)[] => {
        if (!searchQuery) {
            return documentType === 'BAPB' ? bapbList : bappList;
        }

        const query = searchQuery.toLowerCase();

        if (documentType === 'BAPB') {
            return bapbList.filter((item) =>
                item.id?.toLowerCase().includes(query) ||
                item.vendorId?.toLowerCase().includes(query) ||
                item.status?.toLowerCase().includes(query)
            );
        } else {
            return bappList.filter((item) =>
                item.id?.toLowerCase().includes(query) ||
                item.vendorId?.toLowerCase().includes(query) ||
                item.status?.toLowerCase().includes(query)
            );
        }
    };

    const filteredList = getFilteredList();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, doc: BAPB | BAPP) => {
        setAnchorEl(event.currentTarget);
        setSelectedDocument(doc);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleViewDetail = () => {
        if (selectedDocument?.id) {
            const path = documentType === 'BAPB' ? `/bapb/${selectedDocument.id}` : `/bapp/${selectedDocument.id}`;
            navigate(path);
        }
        handleMenuClose();
    };

    const handleRestoreClick = () => {
        setRestoreDialogOpen(true);
        handleMenuClose();
    };

    const handleRestoreConfirm = async () => {
        if (!selectedDocument?.id) return;

        setRestoring(true);
        const result = documentType === 'BAPB'
            ? await restoreBAPB(selectedDocument.id)
            : await restoreBAPP(selectedDocument.id);

        if (result.success) {
            showToast(`${documentType} berhasil dipulihkan`, 'success');
            setRestoreDialogOpen(false);
            setSelectedDocument(null);
            // Reload list
            loadArchived();
        } else {
            showToast(`Gagal memulihkan ${documentType}`, 'error');
        }

        setRestoring(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography>Memuat arsip...</Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <PageHeader
                title="Arsip Dokumen"
                description="Dokumen yang telah diarsipkan"
            />

            <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    {/* Document Type Tabs */}
                    <Tabs value={documentType} onChange={(_, newValue) => setDocumentType(newValue)}>
                        <Tab label="BAPB" value="BAPB" />
                        <Tab label="BAPP" value="BAPP" />
                    </Tabs>

                    {/* Search */}
                    <TextField
                        size="small"
                        placeholder="Cari dokumen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 300 }}
                        slotProps={{
                            input: {
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                            },
                        }}
                    />
                </Stack>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Vendor</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Diarsipkan</TableCell>
                            <TableCell>Oleh</TableCell>
                            <TableCell align="right">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary" sx={{ py: 4 }}>
                                        Tidak ada dokumen yang diarsipkan
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredList.map((doc) => (
                                <TableRow key={doc.id} hover>
                                    <TableCell>{doc.id}</TableCell>
                                    <TableCell>{doc.vendorId}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={doc.status}
                                            size="small"
                                            color={getStatusColor(doc.currentStage || 'draft') as any}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {doc.archivedAt ? new Date(doc.archivedAt).toLocaleDateString('id-ID') : '-'}
                                    </TableCell>
                                    <TableCell>{doc.archivedBy || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, doc)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                <MenuItem
                    onClick={handleRestoreClick}
                    disabled={!isAdmin}
                >
                    <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                    Pulihkan
                </MenuItem>
            </Menu>

            {/* Restore Confirmation Dialog */}
            <Dialog
                open={restoreDialogOpen}
                onClose={() => !restoring && setRestoreDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Konfirmasi Pulihkan Dokumen</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Typography>
                            Dokumen akan dipulihkan dan kembali muncul di daftar utama {documentType}.
                        </Typography>

                        {selectedDocument && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Nomor Dokumen
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {selectedDocument.id}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRestoreDialogOpen(false)} disabled={restoring}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleRestoreConfirm}
                        variant="contained"
                        color="primary"
                        disabled={restoring}
                    >
                        {restoring ? 'Memulihkan...' : 'Pulihkan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ArchivePage;
