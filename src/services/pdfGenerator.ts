import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
import { Invoice, CompanySettings } from '../types/invoice';
import { numberToWordsIndian } from '../utils/numberToWords';

export async function generateInvoicePDF(
  invoice: Invoice,
  companySettings: CompanySettings,
  stampSignatureDataUrl?: string,
  companyLogoDataUrl?: string
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  // const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  let currentY = 8; // Start closer to top

  // Create letterhead
  if (companyLogoDataUrl) {
    try {
      // Add company logo - better aspect ratio for 832x1162 pixels
      doc.addImage(companyLogoDataUrl, 'PNG', margin, currentY, 40, 35); // Increased height from 25 to 35
    } catch (error) {
      console.error('Error adding company logo:', error);
    }
  }

  // Company name with special styling - matching original letterhead
  doc.setFont('times', 'bold'); // Use Times font to match original
  doc.setTextColor(41, 98, 184); // Blue color for APEX SOLAR
  
  // Draw "A" in APEX - larger size
  doc.setFontSize(36); // Larger for the "A"
  doc.text('A', 55, currentY + 12);
  
  // Draw "PEX" - normal size, closer to A
  doc.setFontSize(30);
  doc.text('PEX', 64, currentY + 12); // Brought closer to A
  
  // Add minimal space and draw "S" in SOLAR - larger size, with proper spacing
  doc.setFontSize(36); // Larger for the "S"
  doc.text('S', 92, currentY + 12); // Slightly more space from APEX
  
  // Draw "OLAR" - normal size, closer to S
  doc.setFontSize(30);
  doc.text('OLAR', 99, currentY + 12); // Brought even closer to S
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(0, 128, 0); // Green color for "for green energy"
  doc.text('for green energy', 55, currentY + 21); // Adjusted for taller logo

  // Service description on right - enhanced styling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(51, 51, 51); // Dark gray for better contrast
  doc.text('Solar Power Plant Installation', pageWidth - 75, currentY + 10, { align: 'left' }); // Back to original position
  doc.text('and Commissioning', pageWidth - 75, currentY + 18, { align: 'left' }); // Back to original position

  // Address and contact info - enhanced styling
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9); // Slightly larger for better readability
  doc.setTextColor(51, 51, 51); // Dark gray
  doc.text('Ramkrishna Nagar, Paschimpara, P.O.- Panchpota, P.S.- Narendrapur, Kolkata - 700 152', margin, currentY + 40); // Changed P.S. to Narendrapur
  
  // Contact info with enhanced formatting
  doc.setFont('helvetica', 'bold'); // Make Ph: bold and black
  doc.setTextColor(0, 0, 0); // Black color for labels
  doc.text('Ph : ', margin, currentY + 44);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text('+91-97327 33031', margin + 12, currentY + 44);
  
  doc.setFont('helvetica', 'bold'); // Make E-mail: bold and black
  doc.setTextColor(0, 0, 0); // Black color for email label
  doc.text('E-mail : ', margin + 50, currentY + 44);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text('partha.apexsolar@gmail.com', margin + 66, currentY + 44);

  // Enhanced brown/red line separator with gradient effect
  doc.setDrawColor(139, 69, 19); // Brown color
  doc.setLineWidth(2); // Thicker line
  doc.line(margin, currentY + 49, pageWidth - margin, currentY + 49); // Moved down
  
  // Add a subtle second line for depth
  doc.setDrawColor(41, 98, 184); // Blue accent line
  doc.setLineWidth(0.5);
  doc.line(margin, currentY + 50.5, pageWidth - margin, currentY + 50.5);

  currentY += 58; // Adjusted for enhanced letterhead

  // Tax Invoice header - enhanced styling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22); // Larger and more prominent
  doc.setTextColor(0, 0, 0); // Black color instead of blue
  doc.text('Tax Invoice', pageWidth / 2, currentY, { align: 'center' });
  
  // Add underline for Tax Invoice
  doc.setDrawColor(0, 0, 0); // Black underline
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 25, currentY + 2, pageWidth / 2 + 25, currentY + 2);

  currentY += 10; // Increased spacing for prominence

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Reset to black

  const leftColumnX = margin;
  const rightColumnX = pageWidth - margin - 70;

  // Customer company name - enhanced
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11); // Slightly larger
  doc.setTextColor(51, 51, 51); // Dark gray
  doc.text(invoice.customer.companyName.toUpperCase(), leftColumnX, currentY);
  
  // Position date aligned with customer name
  const customerNameY = currentY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0); // Black for labels
  doc.text('Date:- ', rightColumnX, customerNameY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51); // Dark gray for values
  const invoiceDateFormatted = new Date(invoice.invoiceDate).toLocaleDateString('en-GB').replace(/\//g, '.');
  doc.text(invoiceDateFormatted, rightColumnX + 12, customerNameY);

  // Position Tax Invoice Ref. No. below the date
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black for labels
  doc.text('Tax Invoice Ref. No: - ', rightColumnX, customerNameY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51); // Dark gray for values
  const formattedInvoiceNumber = `AS/${invoice.financialYear}/${invoice.invoiceNumber}`;
  doc.text(formattedInvoiceNumber, rightColumnX + 35, customerNameY + 5);

  currentY += 6; // Increased spacing

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 51, 51); // Dark gray for address
  const addressLines = [
    invoice.customer.addressLine1,
    invoice.customer.addressLine2,
    invoice.customer.addressLine3,
    `${invoice.customer.city || ''} ${invoice.customer.state || ''} ${invoice.customer.pincode || ''}`.trim(),
  ].filter(line => line && line.trim() !== '');

  addressLines.forEach(line => {
    if (line) {
      const splitLines = doc.splitTextToSize(line, 100);
      splitLines.forEach((splitLine: string) => {
        doc.text(splitLine, leftColumnX, currentY);
        currentY += 4;
      });
    }
  });

  if (invoice.customer.gstNumber) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0); // Black for labels
    doc.text('G.S.T. No: ', leftColumnX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51); // Dark gray for values
    doc.text(invoice.customer.gstNumber, leftColumnX + 18, currentY);
    currentY += 5;
  }

  if (invoice.customer.panNumber) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0); // Black for labels
    doc.text('PAN NO: ', leftColumnX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51); // Dark gray for values
    doc.text(invoice.customer.panNumber, leftColumnX + 18, currentY);
  }

  currentY = Math.max(currentY, customerNameY + 10) + 10; // Increased spacing for more gap

  // Work Order section - centered
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black for labels
  const workOrderLabel = 'Ref. Work Order No: - ';
  const workOrderValue = invoice.workOrderDate
    ? `${invoice.workOrderReference} Dated- ${new Date(invoice.workOrderDate).toLocaleDateString('en-GB').replace(/\//g, '.')}`
    : invoice.workOrderReference;
  
  // Combine label and value for centering
  const fullWorkOrderText = `${workOrderLabel}${workOrderValue}`;
  doc.text(fullWorkOrderText, pageWidth / 2, currentY, { align: 'center' });

  currentY += 10; // Increased spacing before table

  const tableData = invoice.lineItems.map(item => [
    item.serialNumber.toString(),
    item.description,
    item.hsnSacCode,
    `${item.rate.toFixed(2)}`,
    `${item.quantity.toFixed(2)}\n(${item.unit})`,
    `${item.amount.toFixed(2)}`, // Amount is already calculated with 1000x in the form
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['SL.\nNO', 'DESCRIPTION', 'HSN/SAC', 'Rate\n(In Rs.)', 'Qty.\n(in Kwp)', 'Amount\n(In Rs.)']],
    body: tableData,
    theme: 'grid',
    margin: (pageWidth - 183) / 2, // Center the table (total width 183mm)
    styles: {
      fontSize: 8.5, // Slightly smaller font
      cellPadding: 2, // Reduced padding
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      textColor: [0, 0, 0], // Make text black for better printing
    },
    headStyles: {
      fillColor: [255, 255, 255], // Back to white background
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' }, // Reduced width
      1: { cellWidth: 80, halign: 'left' }, // Reduced width
      2: { cellWidth: 18, halign: 'center' }, // Reduced width
      3: { cellWidth: 23, halign: 'center' }, // Changed to center alignment
      4: { cellWidth: 23, halign: 'center' }, // Reduced width
      5: { cellWidth: 23, halign: 'center' }, // Changed to center alignment
    },
    didParseCell: (data) => {
      data.cell.styles.lineColor = [0, 0, 0];
      data.cell.styles.lineWidth = 0.5;
    },
  });

  currentY = (doc as any).lastAutoTable.finalY;

  const summaryData = [
    ['', '', '', '', 'Total Basic', invoice.totalBasicAmount.toFixed(2)],
    ['', '', '', '', `C.G.S.T. (${invoice.cgstPercentage}%)`, invoice.cgstAmount.toFixed(2)],
    ['', '', '', '', `S.G.S.T. (${invoice.sgstPercentage}%)`, invoice.sgstAmount.toFixed(2)],
    ['', '', '', '', 'Grand Total', invoice.grandTotal.toFixed(2)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: summaryData,
    theme: 'grid',
    margin: (pageWidth - 183) / 2, // Center the table (total width 183mm)
    styles: {
      fontSize: 8.5, // Slightly smaller font
      cellPadding: 2, // Reduced padding
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      textColor: [0, 0, 0], // Make text black for better printing
    },
    columnStyles: {
      0: { cellWidth: 16 },
      1: { cellWidth: 80 },
      2: { cellWidth: 18 },
      3: { cellWidth: 23 },
      4: { cellWidth: 23, fontStyle: 'bold', halign: 'center' }, // Changed to center
      5: { cellWidth: 23, halign: 'center', fontStyle: 'bold' }, // Changed to center
    },
    didParseCell: (data) => {
      data.cell.styles.lineColor = [0, 0, 0];
      data.cell.styles.lineWidth = 0.5;
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 3; // Reduced spacing

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51); // Dark gray
  doc.text(`In words:- ${invoice.amountInWords}`, leftColumnX, currentY);

  currentY += 7; // Reduced spacing

  const taxTableData = [
    [`C.G.S.T. (${invoice.cgstPercentage}%)`, `S.G.S.T. (${invoice.sgstPercentage}%)`, 'Total'],
    [invoice.cgstAmount.toFixed(2), invoice.sgstAmount.toFixed(2), (invoice.cgstAmount + invoice.sgstAmount).toFixed(2)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [taxTableData[0]],
    body: [taxTableData[1]],
    theme: 'grid',
    margin: (pageWidth - 183) / 2, // Center the table (total width 183mm)
    styles: {
      fontSize: 8.5, // Slightly smaller font
      cellPadding: 2, // Reduced padding
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      halign: 'center',
      textColor: [0, 0, 0], // Make text black for better printing
    },
    headStyles: {
      fillColor: [255, 255, 255], // Back to white background
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 61 },
      1: { cellWidth: 61 },
      2: { cellWidth: 61 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 3; // Reduced spacing

  const totalTaxAmount = invoice.cgstAmount + invoice.sgstAmount;
  const totalTaxInWords = numberToWordsIndian(totalTaxAmount);
  doc.setFont('helvetica', 'bold'); // Make it bold
  doc.setFontSize(9);
  doc.setTextColor(51, 51, 51); // Dark gray
  doc.text(`Total Tax amount in words: - ${totalTaxInWords}`, leftColumnX, currentY);

  currentY += 8; // Reduced spacing

  // Account Details in table format
  const accountDetailsData = [
    [`Name- ${companySettings.accountName}`],
    [`Bank Name- ${companySettings.bankName}`],
    [`IFS CODE- ${companySettings.ifscCode}`],
    [`A/C NO.- ${companySettings.accountNumber}`],
  ];

  const accountTableY = currentY;
  
  autoTable(doc, {
    startY: accountTableY,
    head: [['Account Details']],
    body: accountDetailsData,
    theme: 'grid',
    styles: {
      fontSize: 8.5, // Slightly smaller font
      cellPadding: 2, // Reduced padding
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      textColor: [0, 0, 0], // Make text black for better printing
    },
    headStyles: {
      fillColor: [255, 255, 255], // Back to white background
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 90, halign: 'left' }, // Reduced width
    },
  });

  // Align signature section with account details table
  const signatureY = accountTableY;
  // const signatureX = rightColumnX + 10;
  const signatureCenterX = rightColumnX + 22.5; // Center point for text elements (keep original)
  
  // PROPRIETOR - center aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PROPRIETOR', signatureCenterX, signatureY, { align: 'center' });
  
  // (PARTHA TRIPATHI) - center aligned below PROPRIETOR
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('(PARTHA TRIPATHI)', signatureCenterX, signatureY + 4, { align: 'center' });
  
  doc.setFontSize(8.5);

  if (stampSignatureDataUrl) {
    try {
      // Move only the image right and make it wider, text stays centered on original position
      doc.addImage(stampSignatureDataUrl, 'PNG', rightColumnX + 2, signatureY + 6, 55, 22); // Even wider signature
      // APEX SOLAR - center aligned below stamp/signature, stays with original text alignment
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('APEX SOLAR', signatureCenterX, signatureY + 32, { align: 'center' });
      doc.setFontSize(8.5);
    } catch (error) {
      console.error('Error adding stamp/signature image:', error);
    }
  }

  currentY = Math.max((doc as any).lastAutoTable.finalY, signatureY + 35) + 5; // Added more space

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black color for GST number
  doc.text(`GST No: ${companySettings.gstNumber}`, pageWidth / 2, currentY + 3, { align: 'center' }); // Moved closer to content

  // Convert PDF to Blob and save using Tauri's dialog
  const pdfBlob = doc.output('arraybuffer');
  const fileName = `Invoice_AS_${invoice.financialYear}_${invoice.invoiceNumber}.pdf`;

  try {
    // First, save to generated folder in app data
    const generatedPath = `generated/${fileName}`;
    await writeBinaryFile(generatedPath, new Uint8Array(pdfBlob), { 
      dir: BaseDirectory.AppData 
    });

    // Then, ask user where they want to save a copy
    const savePath = await save({
      defaultPath: fileName,
      filters: [{
        name: 'PDF',
        extensions: ['pdf']
      }]
    });

    if (savePath) {
      await writeBinaryFile(savePath, new Uint8Array(pdfBlob));
    }
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
}
