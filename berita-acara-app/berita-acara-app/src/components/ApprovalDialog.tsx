import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Stack,
    IconButton,
    Divider,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';

interface ApprovalDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (notes: string) => Promise<void>;
    type: 'approve' | 'reject';
    documentType?: string;
    documentNumber?: string;
    title?: string;
    description?: string;
}

// Helper function to get button icon
const getButtonIcon = (loading: boolean, isApproval: boolean) => {
    if (loading) {
        return <CircularProgress size={20} color="inherit" />;
    }
    return isApproval ? <ApproveIcon /> : <RejectIcon />;
};

// Helper function to get button text
const getButtonText = (loading: boolean, isApproval: boolean): string => {
    if (loading) {
        return 'Memproses...';
    }
    return isApproval ? 'Setujui Berkas' : 'Tolak Berkas';
};

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
    open,
    onClose,
    onConfirm,
    type,
    documentType = 'Berkas',
    documentNumber,
    title,
    description,
}) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const isApproval = type === 'approve';

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(notes);
            setNotes(''); // Clear notes after success
            onClose();
        } catch (error) {
            console.error('Approval action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setNotes('');
            onClose();
        }
    };

    const getDialogTitle = () => {
        return title || (isApproval ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan');
    };

    const getDialogDescription = () => {
        return description || `${isApproval ? 'Setujui' : 'Tolak'} ${documentType}`;
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                    }
                }
            }}
        >
            <DialogTitle sx={{ pb: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: isApproval ? 'success.lighter' : 'error.lighter',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isApproval ? 'success.main' : 'error.main',
                            }}
                        >
                            {isApproval ? <ApproveIcon /> : <RejectIcon />}
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                {getDialogTitle()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {getDialogDescription()}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton
                        onClick={handleClose}
                        disabled={loading}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ py: 3 }}>
                <Stack spacing={3}>
                    {/* Warning Alert */}
                    <Alert
                        severity={isApproval ? 'info' : 'warning'}
                        icon={<WarningIcon />}
                        sx={{ mb: 1 }}
                    >
                        {isApproval ? (
                            <>
                                Pastikan Anda telah memeriksa semua detail berkas sebelum menyetujui.
                                {' '}
                                <strong>Tindakan ini tidak dapat dibatalkan.</strong>
                            </>
                        ) : (
                            <>
                                Berkas akan ditolak dan dikembalikan kepada pembuat.
                                {' '}
                                <strong>Pastikan Anda memberikan alasan penolakan yang jelas.</strong>
                            </>
                        )}
                    </Alert>

                    {/* Document Info */}
                    {documentNumber && (
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: 'background.neutral',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Nomor {documentType}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {documentNumber}
                            </Typography>
                        </Box>
                    )}

                    {/* Notes Field */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            {isApproval ? 'Catatan (Opsional)' : 'Alasan Penolakan *'}
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={
                                isApproval
                                    ? 'Tambahkan catatan jika diperlukan...'
                                    : 'Jelaskan alasan penolakan berkas ini...'
                            }
                            variant="outlined"
                            disabled={loading}
                            required={!isApproval}
                            helperText={
                                isApproval
                                    ? 'Catatan akan ditambahkan ke riwayat persetujuan'
                                    : 'Alasan wajib diisi untuk penolakan'
                            }
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 3, gap: 1.5 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    size="large"
                    sx={{ px: 3 }}
                >
                    Batal
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color={isApproval ? 'success' : 'error'}
                    disabled={loading || (!isApproval && !notes.trim())}
                    size="large"
                    startIcon={getButtonIcon(loading, isApproval)}
                    sx={{ px: 4 }}
                >
                    {getButtonText(loading, isApproval)}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApprovalDialog;
