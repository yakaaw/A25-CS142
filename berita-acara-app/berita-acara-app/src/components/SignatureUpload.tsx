import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Close as CloseIcon,
    Image as ImageIcon,
} from '@mui/icons-material';

interface SignatureUploadProps {
    onUploadComplete: (base64: string) => void;
    currentSignature?: string;
    label?: string;
}

const SignatureUpload: React.FC<SignatureUploadProps> = ({
    onUploadComplete,
    currentSignature,
    label = 'Upload Signature'
}) => {
    const [preview, setPreview] = useState<string | null>(currentSignature || null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG)');
            return;
        }

        // Validate file size (max 500KB)
        if (file.size > 500 * 1024) {
            alert('File size must be less than 500KB');
            return;
        }

        setFileName(file.name);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);
                onUploadComplete(base64String);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
            setFileName(null);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFileName(null);
        onUploadComplete(''); // Clear signature
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
                        p: 4,
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Button variant="contained" component="label">
                            Upload Signature
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                                accept="image/png,image/jpeg"
                            />
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                            or drag and drop
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            PNG or JPG, max 500KB
                        </Typography>
                    </Box>
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
                                bgcolor: 'success.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'success.main',
                            }}
                        >
                            <ImageIcon />
                        </Box>
                        <Box>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 300 }}>
                                {fileName || 'Signature uploaded'}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                                Ready to save
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

export default SignatureUpload;
