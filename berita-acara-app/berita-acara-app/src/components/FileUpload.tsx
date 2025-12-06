import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Paper,
    IconButton,
    Stack,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Close as CloseIcon,
    Description as FileIcon,
    Image as ImageIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { uploadFile } from '../services/storageService';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    path: string;
    label?: string;
    acceptedFormats?: string;
    maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onUploadComplete,
    path,
    label = 'Upload File',
    acceptedFormats = 'image/*,application/pdf',
    maxSize = 10
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        // Validate file size
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            alert(`File size must be less than ${maxSize}MB`);
            return;
        }

        setUploading(true);
        setProgress(0);
        setFileName(file.name);

        try {
            const url = await uploadFile(file, path, (p) => setProgress(p));
            setPreview(url);
            onUploadComplete(url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
            setFileName(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFileName(null);
        setProgress(0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {label && (
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                    {label}
                </Typography>
            )}

            {preview === null ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        borderColor: dragOver ? 'primary.main' : 'divider',
                        bgcolor: dragOver ? 'action.hover' : 'background.default',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                        },
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {uploading ? (
                        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                            <Stack spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.light',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 1,
                                    }}
                                >
                                    <UploadIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            mb: 1,
                                            bgcolor: 'action.hover',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                            }
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Uploading... {Math.round(progress)}%
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    ) : (
                        <Stack spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <UploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                            </Box>

                            <Box>
                                <Button
                                    variant="contained"
                                    component="label"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Pilih File
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleFileChange}
                                        accept={acceptedFormats}
                                    />
                                </Button>
                            </Box>

                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                atau drag & drop file di sini
                            </Typography>

                            <Box
                                sx={{
                                    px: 3,
                                    py: 1,
                                    bgcolor: 'action.hover',
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Format: PNG, JPG, PDF • Max {maxSize}MB
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </Paper>
            ) : (
                <Paper
                    elevation={1}
                    sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'success.light',
                        bgcolor: 'success.lighter',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0,
                            }}
                        >
                            {fileName?.toLowerCase().endsWith('.pdf') ? (
                                <FileIcon sx={{ fontSize: 24 }} />
                            ) : (
                                <ImageIcon sx={{ fontSize: 24 }} />
                            )}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {fileName}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption" color="success.main" fontWeight={600}>
                                    Upload Berhasil
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <IconButton
                        onClick={handleRemove}
                        size="small"
                        sx={{
                            ml: 2,
                            color: 'error.main',
                            '&:hover': {
                                bgcolor: 'error.lighter',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Paper>
            )}
        </Box>
    );
};

export default FileUpload;
