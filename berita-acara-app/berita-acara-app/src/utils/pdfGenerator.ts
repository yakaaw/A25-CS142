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

// Helper for "Kop Surat" Header
const addHeader = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.width;

    // Company Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("PT. REPORTIFY INDONESIA SEJAHTERA", pageWidth / 2, 20, { align: "center" });

    // Company Address
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Jl. Sudirman No. 123, Jakarta Selatan, Indonesia", pageWidth / 2, 26, { align: "center" });
    doc.text("Telp: (021) 555-0123 | Email: admin@reportify.id", pageWidth / 2, 31, { align: "center" });

    // Line Separator
    doc.setLineWidth(0.5);
    doc.line(20, 36, pageWidth - 20, 36);
    doc.setLineWidth(1.5); // Thick line
    doc.line(20, 37, pageWidth - 20, 37);
};

export const generateBAPBPDF = async (data: BAPB) => {
    const doc = new jsPDF();

    // 1. Add Professional Header
    addHeader(doc);

    // 2. Document Title
    const pageWidth = doc.internal.pageSize.width;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('BERITA ACARA PENERIMAAN BARANG', pageWidth / 2, 55, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nomor Dokumen: ${data.id?.substring(0, 8).toUpperCase() || '-'}`, pageWidth / 2, 62, { align: 'center' });

    // 3. Document Details (Formatted)
    const startY = 80;
    doc.setFontSize(10);

    // Left Column
    doc.text('Tanggal', 20, startY);
    doc.text(':', 50, startY);
    doc.text(new Date(data.createdAt || '').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 55, startY);

    doc.text('Vendor', 20, startY + 7);
    doc.text(':', 50, startY + 7);
    doc.text(data.vendorId || '-', 55, startY + 7);

    // Right Column (aligned from right)
    const rightColX = 140;
    doc.text('Status', rightColX, startY);
    doc.text(':', rightColX + 20, startY);
    doc.text((data.status || 'Pending').toUpperCase(), rightColX + 25, startY);

    // 4. Products Table
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
        startY: startY + 20,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 }, // No
            2: { halign: 'center', cellWidth: 20 }, // Qty
            3: { halign: 'center', cellWidth: 25 }, // Unit
        },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    // 5. Signatures Section
    const picApproval = data.approvalHistory?.find(h => h.stage === 'pic_review' && h.status === 'approved');
    const direksiApproval = data.approvalHistory?.find(h => h.stage === 'direksi_review' && h.status === 'approved');

    // Tighter spacing: 10 units after table instead of 30
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Check if enough space for signatures (need approx 70 units), else add page
    if (finalY + 70 > 280) {
        doc.addPage();
        // reset Y for new page
        // If new page, start near top
    }

    // Signature Title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Layout: Left (Vendor), Right (PIC), Center Bottom (Direksi)
    const leftX = 40;     // Indented slightly
    const rightX = 160;   // Moved left slightly to ensure fit
    const centerX = pageWidth / 2;

    // Row 1: Vendor & PIC
    const row1Y = finalY;

    // Vendor (Left)
    doc.text('Diserahkan Oleh,', leftX, row1Y, { align: 'center' });
    doc.text('Vendor / Supplier', leftX, row1Y + 5, { align: 'center' });

    // PIC (Right)
    doc.text('Diterima & Diperiksa Oleh,', rightX, row1Y, { align: 'center' });
    doc.text('PIC Gudang', rightX, row1Y + 5, { align: 'center' });

    // Placeholders / Signatures (Row 1)
    const sigImageY = row1Y + 10;

    // Vendor Sig Placeholder line
    doc.text('( ........................... )', leftX, sigImageY + 25, { align: 'center' });

    // PIC Sig
    const picSigAdded = await addSignatureToPDF(doc, picApproval?.signatureUrl, rightX - 15, sigImageY, 30, 20); // 30x20 image

    // PIC Name
    if (picApproval?.actorName) {
        doc.text(`( ${picApproval.actorName} )`, rightX, sigImageY + 25, { align: 'center' });
    } else {
        doc.text('( ........................... )', rightX, sigImageY + 25, { align: 'center' });
    }

    // Row 2: Direksi (Center)
    // Reduce gap: Start 40 units below Row 1 (was 55+)
    const row2Y = row1Y + 45;

    doc.text('Menyetujui,', centerX, row2Y, { align: 'center' });
    doc.text('Direksi', centerX, row2Y + 5, { align: 'center' });

    // Direksi Sig
    const direksiSigAdded = await addSignatureToPDF(doc, direksiApproval?.signatureUrl, centerX - 15, row2Y + 10, 30, 20);

    // Direksi Name
    if (direksiApproval?.actorName) {
        doc.text(`( ${direksiApproval.actorName} )`, centerX, row2Y + 35, { align: 'center' });
    } else {
        doc.text('( ........................... )', centerX, row2Y + 35, { align: 'center' });
    }

    // Save
    doc.save(`BAPB_${data.id}.pdf`);
};

export const generateBAPPPDF = async (data: BAPP) => {
    const doc = new jsPDF();

    // 1. Header
    addHeader(doc);

    // 2. Title
    const pageWidth = doc.internal.pageSize.width;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('BERITA ACARA PENYELESAIAN PEKERJAAN', pageWidth / 2, 55, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nomor Dokumen: ${data.id?.substring(0, 8).toUpperCase() || '-'}`, pageWidth / 2, 62, { align: 'center' });

    // 3. Info
    const startY = 80;
    doc.setFontSize(10);

    doc.text('Tanggal', 20, startY);
    doc.text(':', 50, startY);
    doc.text(new Date(data.createdAt || '').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 55, startY);

    doc.text('Vendor', 20, startY + 7);
    doc.text(':', 50, startY + 7);
    doc.text(data.vendorId || '-', 55, startY + 7);

    // Right Column
    const rightColX = 140;
    doc.text('Status', rightColX, startY);
    doc.text(':', rightColX + 20, startY);
    doc.text((data.status || 'Pending').toUpperCase(), rightColX + 25, startY);

    // 4. Table
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
        startY: startY + 20,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113], textColor: 255, halign: 'center' }, // Green for BAPP
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
        },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    // 5. Signatures
    const picApproval = data.approvalHistory?.find(h => h.stage === 'pic_review' && h.status === 'approved');
    const direksiApproval = data.approvalHistory?.find(h => h.stage === 'direksi_review' && h.status === 'approved');

    // Tighter spacing
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Check page break
    if (finalY + 70 > 280) {
        doc.addPage();
    }

    // Titles
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const leftX = 40;
    const rightX = 160;
    const centerX = pageWidth / 2;

    // Row 1
    const row1Y = finalY;

    // Vendor
    doc.text('Diserahkan Oleh,', leftX, row1Y, { align: 'center' });
    doc.text('Vendor / Kontraktor', leftX, row1Y + 5, { align: 'center' });

    // PIC
    doc.text('Diterima & Diperiksa Oleh,', rightX, row1Y, { align: 'center' });
    doc.text('PIC Pemesan', rightX, row1Y + 5, { align: 'center' });

    // Signatures Row 1
    const sigImageY = row1Y + 10;

    // Vendor Placeholders
    doc.text('( ........................... )', leftX, sigImageY + 25, { align: 'center' });

    // PIC Signature
    await addSignatureToPDF(doc, picApproval?.signatureUrl, rightX - 15, sigImageY, 30, 20);

    if (picApproval?.actorName) {
        doc.text(`( ${picApproval.actorName} )`, rightX, sigImageY + 25, { align: 'center' });
    } else {
        doc.text('( ........................... )', rightX, sigImageY + 25, { align: 'center' });
    }

    // Row 2: Direksi
    const row2Y = row1Y + 45;

    doc.text('Menyetujui,', centerX, row2Y, { align: 'center' });
    doc.text('Direksi', centerX, row2Y + 5, { align: 'center' });

    await addSignatureToPDF(doc, direksiApproval?.signatureUrl, centerX - 15, row2Y + 10, 30, 20);

    if (direksiApproval?.actorName) {
        doc.text(`( ${direksiApproval.actorName} )`, centerX, row2Y + 35, { align: 'center' });
    } else {
        doc.text('( ........................... )', centerX, row2Y + 35, { align: 'center' });
    }

    // Save
    doc.save(`BAPP_${data.id}.pdf`);
};
