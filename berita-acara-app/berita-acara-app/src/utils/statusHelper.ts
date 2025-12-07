/**
 * Helper functions for generating human-readable status messages
 */

export type DocumentType = 'BAPB' | 'BAPP';

export type CurrentStage =
    | 'draft'
    | 'waiting_pic'
    | 'waiting_direksi'
    | 'approved'
    | 'rejected';

/**
 * Get human-readable pending status message based on current stage
 * @param currentStage - Current approval stage of the document
 * @param documentType - Type of document (BAPB or BAPP)
 * @returns Localized status message in Indonesian
 */
export const getPendingStatusMessage = (
    currentStage: string,
    documentType: DocumentType
): string => {
    switch (currentStage) {
        case 'draft':
            return 'Masih dalam tahap draft';

        case 'waiting_pic':
            if (documentType === 'BAPB') {
                return 'Belum disetujui oleh PIC Gudang';
            } else {
                return 'Belum disetujui oleh PIC Pemesan';
            }

        case 'waiting_direksi':
            return 'Belum disetujui oleh Direksi';

        case 'approved':
            return 'Sudah disetujui';

        case 'rejected':
            return 'Ditolak';

        default:
            return 'Status tidak diketahui';
    }
};

/**
 * Get status color based on current stage
 * @param currentStage - Current approval stage
 * @returns MUI color name
 */
export const getStatusColor = (currentStage: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    switch (currentStage) {
        case 'approved':
            return 'success';
        case 'rejected':
            return 'error';
        case 'waiting_pic':
        case 'waiting_direksi':
            return 'warning';
        case 'draft':
            return 'default';
        default:
            return 'default';
    }
};
