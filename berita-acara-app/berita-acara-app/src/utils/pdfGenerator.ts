import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BAPB } from '../services/bapbService';
import { BAPP } from '../services/bappService';

// Helper to check if string is base64 or URL
const isBase64 = (str: string): boolean => {
    return str.startsWith('data:image/');
};

// Helper to convert URL to base64 using server-side proxy
const urlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to convert URL to base64:', error);
        throw error;
    }
};

// Helper to add signature to PDF
const addSignatureToPDF = async (
    doc: jsPDF,
    signatureData: string | undefined,
    x: number,
    y: number,
    width: number,
    height: number
): Promise<boolean> => {
    if (!signatureData) return false;

    try {
        let imageData = signatureData;

        // If it's a URL, convert to base64
        if (!isBase64(signatureData)) {
            console.log('Converting URL to base64:', signatureData);
            imageData = await urlToBase64(signatureData);
        }

        // Add image to PDF
        doc.addImage(imageData, 'PNG', x, y, width, height);
        return true;
    } catch (error) {
        console.error('Failed to add signature:', error);
        return false;
    }
};

export const generateBAPBPDF = async (data: BAPB) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text('BERITA ACARA PENERIMAAN BARANG', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Nomor: ${data.id || '-'}`, 105, 30, { align: 'center' });

    // Info
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date(data.createdAt || '').toLocaleDateString('id-ID')}`, 14, 45);
    doc.text(`Vendor: ${data.vendorId || '-'}`, 14, 50);
    doc.text(`Status: ${data.status || 'Pending'}`, 14, 55);

    // Table
    const tableColumn = ["No", "Deskripsi Barang", "Jumlah", "Satuan", "Kondisi"];
    const tableRows: any[] = [];

    data.items?.forEach((item, index) => {
        const itemData = [
            index + 1,
            item.description,
            item.qty,
            item.unit,
            item.condition || 'Baik'
        ];
        tableRows.push(itemData);
    });

    autoTable(doc, {
        startY: 65,
        head: [tableColumn],
        body: tableRows,
    });

    // Get signatures from approval history
    const picApproval = data.approvalHistory?.find(h => h.stage === 'pic_review' && h.status === 'approved');
    const direksiApproval = data.approvalHistory?.find(h => h.stage === 'direksi_review' && h.status === 'approved');

    console.log('PIC Approval:', picApproval);
    console.log('Direksi Approval:', direksiApproval);

    // Signatures section
    const finalY = (doc as any).lastAutoTable.finalY + 20 || 120;

    // Vendor signature (left)
    doc.setFontSize(10);
    doc.text('Diserahkan Oleh,', 40, finalY, { align: 'center' });
    doc.text('( Vendor )', 40, finalY + 30, { align: 'center' });

    // PIC Gudang signature (right)
    doc.text('Diperiksa Oleh,', 170, finalY, { align: 'center' });

    // Add PIC signature
    const picSignatureAdded = await addSignatureToPDF(
        doc,
        picApproval?.signatureUrl,
        152,
        finalY + 5,
        35,
        18
    );

    if (picSignatureAdded) {
        console.log('✓ PIC signature added successfully');
    } else {
        console.log('✗ PIC signature not available');
    }

    // Display PIC name
    if (picApproval?.actorName) {
        doc.setFontSize(9);
        doc.text(picApproval.actorName, 170, finalY + 25, { align: 'center' });
    }
    doc.setFontSize(10);
    doc.text('( PIC Gudang )', 170, finalY + 30, { align: 'center' });

    // Direksi signature (center bottom)
    doc.text('Mengetahui,', 105, finalY + 45, { align: 'center' });

    // Add Direksi signature
    const direksiSignatureAdded = await addSignatureToPDF(
        doc,
        direksiApproval?.signatureUrl,
        87,
        finalY + 50,
        35,
        18
    );

    if (direksiSignatureAdded) {
        console.log('✓ Direksi signature added successfully');
    } else {
        console.log('✗ Direksi signature not available');
    }

    // Display Direksi name
    if (direksiApproval?.actorName) {
        doc.setFontSize(9);
        doc.text(direksiApproval.actorName, 105, finalY + 70, { align: 'center' });
    }
    doc.setFontSize(10);
    doc.text('( Direksi )', 105, finalY + 75, { align: 'center' });

    // Save
    doc.save(`BAPB_${data.id}.pdf`);
};

export const generateBAPPPDF = async (data: BAPP) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text('BERITA ACARA PENYELESAIAN PEKERJAAN', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Nomor: ${data.id || '-'}`, 105, 30, { align: 'center' });

    // Info
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date(data.createdAt || '').toLocaleDateString('id-ID')}`, 14, 45);
    doc.text(`Vendor: ${data.vendorId || '-'}`, 14, 50);
    doc.text(`Status: ${data.status || 'Pending'}`, 14, 55);

    // Table
    const tableColumn = ["No", "Deskripsi Pekerjaan", "Catatan"];
    const tableRows: any[] = [];

    data.workDetails?.forEach((item, index) => {
        const itemData = [
            index + 1,
            item.description,
            item.notes || '-'
        ];
        tableRows.push(itemData);
    });

    autoTable(doc, {
        startY: 65,
        head: [tableColumn],
        body: tableRows,
    });

    // Get signatures from approval history
    const picApproval = data.approvalHistory?.find(h => h.stage === 'pic_review' && h.status === 'approved');
    const direksiApproval = data.approvalHistory?.find(h => h.stage === 'direksi_review' && h.status === 'approved');

    console.log('PIC Approval:', picApproval);
    console.log('Direksi Approval:', direksiApproval);

    // Signatures section
    const finalY = (doc as any).lastAutoTable.finalY + 20 || 120;

    // Vendor signature (left)
    doc.setFontSize(10);
    doc.text('Diserahkan Oleh,', 40, finalY, { align: 'center' });
    doc.text('( Vendor )', 40, finalY + 30, { align: 'center' });

    // PIC Pemesan signature (right)
    doc.text('Diperiksa Oleh,', 170, finalY, { align: 'center' });

    // Add PIC signature
    const picSignatureAdded = await addSignatureToPDF(
        doc,
        picApproval?.signatureUrl,
        152,
        finalY + 5,
        35,
        18
    );

    if (picSignatureAdded) {
        console.log('✓ PIC signature added successfully');
    } else {
        console.log('✗ PIC signature not available');
    }

    // Display PIC name
    if (picApproval?.actorName) {
        doc.setFontSize(9);
        doc.text(picApproval.actorName, 170, finalY + 25, { align: 'center' });
    }
    doc.setFontSize(10);
    doc.text('( PIC Gudang )', 170, finalY + 30, { align: 'center' });

    // Direksi signature (center bottom)
    doc.text('Mengetahui,', 105, finalY + 45, { align: 'center' });

    // Add Direksi signature
    const direksiSignatureAdded = await addSignatureToPDF(
        doc,
        direksiApproval?.signatureUrl,
        87,
        finalY + 50,
        35,
        18
    );

    if (direksiSignatureAdded) {
        console.log('✓ Direksi signature added successfully');
    } else {
        console.log('✗ Direksi signature not available');
    }

    // Display Direksi name
    if (direksiApproval?.actorName) {
        doc.setFontSize(9);
        doc.text(direksiApproval.actorName, 105, finalY + 70, { align: 'center' });
    }
    doc.setFontSize(10);
    doc.text('( Direksi )', 105, finalY + 75, { align: 'center' });

    // Save
    doc.save(`BAPP_${data.id}.pdf`);
};
