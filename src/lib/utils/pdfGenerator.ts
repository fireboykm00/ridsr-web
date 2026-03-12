import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CaseReportData {
  id: string;
  reportDate: string;
  diseaseCode: string;
  diseaseName: string;
  status: string;
  validationStatus: string;
  symptoms: string[];
  onsetDate: string;
  outcome?: string;
  facilityName: string;
  patientInfo: string;
}

export interface ReportOptions {
  title: string;
  subtitle?: string;
  dateRange: { from: string; to: string };
  generatedAt: string;
  generatedBy: string;
  cases: CaseReportData[];
  filters?: {
    district?: string;
    diseaseCode?: string;
    status?: string;
    validationStatus?: string;
  };
}

const diseaseNames: Record<string, string> = {
  CHOLERA: 'Cholera',
  MAL01: 'Malaria',
  SARI: 'Severe Acute Respiratory Illness',
  AFP: 'Acute Flaccid Paralysis',
  YELLOW_FEVER: 'Yellow Fever',
  RUBELLA: 'Rubella',
  MEASLES: 'Measles',
  PLAGUE: 'Plague',
  RABIES: 'Rabies',
  EBOLA: 'Ebola Virus Disease',
  MONKEYPOX: 'Monkeypox',
  TYPHOID: 'Typhoid Fever',
  HEPATITIS_E: 'Hepatitis E',
};

const getDiseaseName = (code: string): string => {
  return diseaseNames[code] || code;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    suspected: '#F59E0B',
    confirmed: '#EF4444',
    resolved: '#10B981',
    invalidated: '#6B7280',
    pending: '#F59E0B',
    validated: '#10B981',
    rejected: '#EF4444',
  };
  return colors[status.toLowerCase()] || '#6B7280';
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function calculateSummary(cases: CaseReportData[]) {
  const summary = {
    total: cases.length,
    byStatus: {} as Record<string, number>,
    byValidation: {} as Record<string, number>,
  };

  cases.forEach(c => {
    summary.byStatus[c.status] = (summary.byStatus[c.status] || 0) + 1;
    summary.byValidation[c.validationStatus] = (summary.byValidation[c.validationStatus] || 0) + 1;
  });

  return { summary };
}

function drawHeader(doc: jsPDF): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RIDSR', 14, 22);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Rwanda National Integrated Disease Surveillance and Response', 14, 29);
  
  doc.setDrawColor(255, 255, 255);
  doc.line(14, 32, pageWidth - 14, 32);
  
  doc.setFontSize(7);
  doc.text('Republic of Rwanda | Ministry of Health', 14, 37);
  
  return 45;
}

function drawTitleSection(doc: jsPDF, options: ReportOptions, yPos: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  
  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(options.subtitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
  }
  
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Period: ${options.dateRange.from} to ${options.dateRange.to}`, 14, yPos);
  doc.text(`Generated: ${options.generatedAt}`, pageWidth - 14, yPos, { align: 'right' });
  
  return yPos + 10;
}

function drawSummarySection(doc: jsPDF, options: ReportOptions, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { summary } = calculateSummary(options.cases);
  
  let yPos = startY;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('SUMMARY STATISTICS', 14, yPos);
  
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  
  const total = summary.total;
  const suspected = summary.byStatus.suspected || 0;
  const confirmed = summary.byStatus.confirmed || 0;
  const resolved = summary.byStatus.resolved || 0;
  const invalidated = summary.byStatus.invalidated || 0;
  
  const parts: string[] = [`Total: ${total}`];
  if (suspected > 0) parts.push(`Suspected: ${suspected} (${total > 0 ? ((suspected / total) * 100).toFixed(1) : 0}%)`);
  if (confirmed > 0) parts.push(`Confirmed: ${confirmed} (${total > 0 ? ((confirmed / total) * 100).toFixed(1) : 0}%)`);
  if (resolved > 0) parts.push(`Resolved: ${resolved}`);
  if (invalidated > 0) parts.push(`Invalidated: ${invalidated}`);
  
  doc.text(parts.join(' | '), 14, yPos);
  
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('VALIDATION STATUS', 14, yPos);
  
  yPos += 8;
  
  const validated = summary.byValidation.validated || 0;
  const pending = summary.byValidation.pending || 0;
  const rejected = summary.byValidation.rejected || 0;
  const valTotal = validated + pending + rejected;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  
  const valParts: string[] = [];
  if (validated > 0) valParts.push(`Validated: ${validated} (${valTotal > 0 ? ((validated / valTotal) * 100).toFixed(1) : 0}%)`);
  if (pending > 0) valParts.push(`Pending: ${pending}`);
  if (rejected > 0) valParts.push(`Rejected: ${rejected}`);
  
  if (valParts.length > 0) {
    doc.text(valParts.join(' | '), 14, yPos);
  } else {
    doc.text('No validation data', 14, yPos);
  }
  
  return yPos + 15;
}

function drawTableSection(doc: jsPDF, options: ReportOptions, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const tableData = options.cases.map(c => {
    const details: string[] = [];
    if (c.symptoms && c.symptoms.length > 0) {
      details.push(`Symptoms: ${c.symptoms.slice(0, 3).join(', ')}${c.symptoms.length > 3 ? '...' : ''}`);
    }
    if (c.outcome) {
      details.push(`Outcome: ${c.outcome}`);
    }
    
    return [
      c.patientInfo,
      getDiseaseName(c.diseaseCode),
      c.facilityName,
      c.status.charAt(0).toUpperCase() + c.status.slice(1),
      c.validationStatus.charAt(0).toUpperCase() + c.validationStatus.slice(1),
      c.reportDate,
      details.join('\n'),
    ];
  });

  autoTable(doc, {
    startY: startY,
    head: [[
      'Patient Details',
      'Disease',
      'Facility',
      'Status',
      'Validation',
      'Date',
      'Details',
    ]],
    body: tableData,
    styles: {
      fontSize: 6,
      cellPadding: 2,
      overflow: 'linebreak',
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 32, minCellHeight: 12 },
      1: { cellWidth: 22, minCellHeight: 12 },
      2: { cellWidth: 28, minCellHeight: 12 },
      3: { cellWidth: 18, minCellHeight: 12, halign: 'center' },
      4: { cellWidth: 20, minCellHeight: 12, halign: 'center' },
      5: { cellWidth: 18, minCellHeight: 12, halign: 'center' },
      6: { cellWidth: 'auto', minCellHeight: 12 },
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 3) {
        const status = data.cell.raw as string;
        const color = getStatusColor(status);
        const rgb = hexToRgb(color);
        if (rgb) {
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      if (data.section === 'body' && data.column.index === 4) {
        const status = data.cell.raw as string;
        const color = getStatusColor(status);
        const rgb = hexToRgb(color);
        if (rgb) {
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fillColor = [rgb.r, rgb.g, rgb.b];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: function(data) {
      const currentPage = data.pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Generated by: ${options.generatedBy}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Page ${currentPage} of ${doc.getNumberOfPages()}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  return finalY;
}

function drawFiltersSection(doc: jsPDF, options: ReportOptions, startY: number): number {
  if (!options.filters) return startY;

  const filterParts = [
    options.filters.district && `District: ${options.filters.district}`,
    options.filters.diseaseCode && `Disease: ${getDiseaseName(options.filters.diseaseCode)}`,
    options.filters.status && `Status: ${options.filters.status}`,
    options.filters.validationStatus && `Validation: ${options.filters.validationStatus}`,
  ].filter(Boolean);

  if (filterParts.length === 0) return startY;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Applied Filters: ${filterParts.join(' | ')}`, 14, startY);

  return startY + 8;
}

export function generateCaseReportPDF(options: ReportOptions): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let yPos = drawHeader(doc);
  yPos = drawTitleSection(doc, options, yPos);
  yPos = drawSummarySection(doc, options, yPos);
  yPos += 10;
  yPos = drawTableSection(doc, options, yPos);
  yPos = drawFiltersSection(doc, options, yPos + 10);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
  }

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
