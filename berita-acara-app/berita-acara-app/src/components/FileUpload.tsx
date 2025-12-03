import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
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
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
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

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
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
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            {preview === null ? (
                <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors relative ${
                        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="space-y-1 text-center">
                        {uploading ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-sm text-gray-500">Uploading... {Math.round(progress)}%</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Upload a file</span>
                                            <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*,application/pdf" />
                                        </label>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-4">
                                        or drag and drop
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">PNG, JPG, PDF up to 10MB</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {fileName?.toLowerCase().endsWith('.pdf') ? <FileText size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{fileName}</p>
                            <p className="text-xs text-green-600">Upload complete</p>
                        </div>
                    </div>
                    <button onClick={handleRemove} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
