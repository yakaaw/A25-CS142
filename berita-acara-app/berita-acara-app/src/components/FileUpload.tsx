import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Paper,
    IconButton,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Close as CloseIcon,
    Description as FileIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import { uploadFile } from '../services/storageService';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    path: string;
    label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, path, label = 'Upload File' }) => {
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
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                {label}
            </Typography>

            {preview === null ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: dragOver ? 'primary.main' : 'grey.300',
                        bgcolor: dragOver ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                        },
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {uploading ? (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Uploading... {Math.round(progress)}%
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Button variant="contained" component="label">
                                Upload a file{' '}
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    accept="image/*,application/pdf"
                                />
                            </Button>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                or drag and drop
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                PNG, JPG, PDF up to 10MB
                            </Typography>
                        </>
                    )}
                </Paper>
            ) : (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'primary.main',
                            }}
                        >
                            {fileName?.toLowerCase().endsWith('.pdf') ? <FileIcon /> : <ImageIcon />}
                        </Box>
                        <Box>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 300 }}>
                                {fileName}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                                Upload complete
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleRemove} size="small" color="error">
                        <CloseIcon />
                    </IconButton>
                </Paper>
            )}
        </Box>
    );
};

export default FileUpload;
