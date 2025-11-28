import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BAPB } from '../services/bapbService';
import { BAPP } from '../services/bappService';

// Extend jsPDF type to include autoTable
interface JsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

export const generateBAPBPDF = (data: BAPB) => {
    const doc = new jsPDF() as JsPDFWithAutoTable;

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

    doc.autoTable({
        startY: 65,
        head: [tableColumn],
        body: tableRows,
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 30;

    doc.text('Diserahkan Oleh,', 40, finalY, { align: 'center' });
    doc.text('Diterima Oleh,', 170, finalY, { align: 'center' });

    doc.text('( Vendor )', 40, finalY + 25, { align: 'center' });
    doc.text('( PIC Gudang )', 170, finalY + 25, { align: 'center' });

    doc.text('Mengetahui,', 105, finalY + 40, { align: 'center' });
    doc.text('( Direksi )', 105, finalY + 65, { align: 'center' });

    // Save
    doc.save(`BAPB_${data.id}.pdf`);
};

export const generateBAPPPDF = (data: BAPP) => {
    const doc = new jsPDF() as JsPDFWithAutoTable;

    // Header
    doc.setFontSize(16);
    doc.text('BERITA ACARA PEMERIKSAAN PEKERJAAN', 105, 20, { align: 'center' });

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

    doc.autoTable({
        startY: 65,
        head: [tableColumn],
        body: tableRows,
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 30;

    doc.text('Diserahkan Oleh,', 40, finalY, { align: 'center' });
    doc.text('Diperiksa Oleh,', 170, finalY, { align: 'center' });

    doc.text('( Vendor )', 40, finalY + 25, { align: 'center' });
    doc.text('( PIC Gudang )', 170, finalY + 25, { align: 'center' });

    doc.text('Mengetahui,', 105, finalY + 40, { align: 'center' });
    doc.text('( Direksi )', 105, finalY + 65, { align: 'center' });

    // Save
    doc.save(`BAPP_${data.id}.pdf`);
};
