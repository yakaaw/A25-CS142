// Example: How to use ApprovalDialog in ApprovalTimeline or BAPBDetail

import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import ApprovalDialog from './ApprovalDialog';

interface ExampleApprovalButtonsProps {
    documentId: string;
    documentNumber: string;
    documentType: 'BAPB' | 'BAPP';
    onApprovalComplete: () => void;
}

const ExampleApprovalButtons: React.FC<ExampleApprovalButtonsProps> = ({
    documentId,
    documentNumber,
    documentType,
    onApprovalComplete,
}) => {
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        type: 'approve' | 'reject';
    }>({ open: false, type: 'approve' });

    // Handler untuk approval
    const handleApprove = async (notes: string) => {
        try {
            // REPLACE WITH YOUR APPROVAL SERVICE
            // await approvalService.approve(documentId, notes);

            console.log('Approving:', {
                documentId,
                documentNumber,
                type: documentType,
                notes,
                timestamp: new Date(),
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            alert(`${documentType} berhasil disetujui!`);

            // Callback to refresh data
            onApprovalComplete();
        } catch (error) {
            console.error('Approval failed:', error);
            alert('Gagal menyetujui berkas');
            throw error; // Re-throw to keep dialog open
        }
    };

    // Handler untuk rejection
    const handleReject = async (notes: string) => {
        try {
            // REPLACE WITH YOUR REJECTION SERVICE
            // await approvalService.reject(documentId, notes);

            console.log('Rejecting:', {
                documentId,
                documentNumber,
                type: documentType,
                reason: notes,
                timestamp: new Date(),
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            alert(`${documentType} berhasil ditolak!`);

            // Callback to refresh data
            onApprovalComplete();
        } catch (error) {
            console.error('Rejection failed:', error);
            alert('Gagal menolak berkas');
            throw error; // Re-throw to keep dialog open
        }
    };

    return (
        <>
            {/* Approval Buttons */}
            <Stack direction="row" spacing={2}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setDialogState({ open: true, type: 'approve' })}
                    size="large"
                >
                    Setujui
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setDialogState({ open: true, type: 'reject' })}
                    size="large"
                >
                    Tolak
                </Button>
            </Stack>

            {/* Approval Dialog */}
            <ApprovalDialog
                open={dialogState.open}
                onClose={() => setDialogState({ ...dialogState, open: false })}
                onConfirm={dialogState.type === 'approve' ? handleApprove : handleReject}
                type={dialogState.type}
                documentType={documentType}
                documentNumber={documentNumber}
            />
        </>
    );
};

export default ExampleApprovalButtons;
