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
    facility?: string;
    district?: string;
    diseaseCode?: string;
    status?: string;
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

export function generateCaseReportPDF(options: ReportOptions): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  let yPos = 20;

  // Header with Logo
  doc.setFillColor(30, 64, 175); // #1E40AF
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo placeholder (simple text)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RIDSR', 14, 22);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Rwanda National Integrated Disease Surveillance and Response', 14, 29);
  
  // Ministry line
  doc.setDrawColor(255, 255, 255);
  doc.line(14, 32, pageWidth - 14, 32);
  
  doc.setFontSize(7);
  doc.text('Republic of Rwanda | Ministry of Health', 14, 37);
  
  yPos = 45;

  // Report Title
  doc.setTextColor(17, 24, 39); // #111827
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  
  // Subtitle
  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // #6B7280
    doc.text(options.subtitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
  }
  
  // Date Range
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Period: ${options.dateRange.from} to ${options.dateRange.to}`, 14, yPos);
  doc.text(`Generated: ${options.generatedAt}`, pageWidth - 14, yPos, { align: 'right' });
  
  yPos += 10;

  // Summary Statistics
  const { cases, summary } = calculateSummary(options.cases);
  
  doc.setFillColor(243, 244, 246); // #F3F4F6
  doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'F');
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81); // #374151
  doc.text('SUMMARY STATISTICS', 18, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    { label: 'Total Cases', value: summary.total, color: [30, 64, 175] },
    { label: 'Suspected', value: summary.byStatus.suspected || 0, color: [245, 158, 11] },
    { label: 'Confirmed', value: summary.byStatus.confirmed || 0, color: [239, 68, 68] },
    { label: 'Resolved', value: summary.byStatus.resolved || 0, color: [16, 185, 129] },
    { label: 'Pending', value: summary.byValidation.pending || 0, color: [139, 92, 246] },
    { label: 'Validated', value: summary.byValidation.validated || 0, color: [5, 150, 105] },
  ];
  
  const colWidth = (pageWidth - 36) / 6;
  summaryData.forEach((stat, idx) => {
    const xPos = 18 + idx * colWidth;
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.setFontSize(8);
    doc.text(stat.label.toUpperCase(), xPos, yPos);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(stat.value), xPos, yPos + 8);
    doc.setFont('helvetica', 'normal');
  });
  
  yPos += 40;

  // Case Details Table
  const tableData = options.cases.map(c => [
    c.reportDate,
    c.patientInfo,
    getDiseaseName(c.diseaseCode),
    c.status.charAt(0).toUpperCase() + c.status.slice(1),
    c.validationStatus.charAt(0).toUpperCase() + c.validationStatus.slice(1),
    c.onsetDate,
    c.symptoms.slice(0, 3).join(', ') + (c.symptoms.length > 3 ? '...' : ''),
    c.facilityName,
    c.outcome || '-',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [[
      'Report Date',
      'Patient',
      'Disease',
      'Status',
      'Validation',
      'Onset Date',
      'Symptoms',
      'Facility',
      'Outcome',
    ]],
    body: tableData,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 35 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20 },
      5: { cellWidth: 22 },
      6: { cellWidth: 35 },
      7: { cellWidth: 30 },
      8: { cellWidth: 18 },
    },
    didParseCell: function(data) {
      if (data.section === 'body' && (data.column.index === 3 || data.column.index === 4)) {
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
  });

  // Filters Applied
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  
  if (options.filters) {
    const filterParts = [
      options.filters.facility && `Facility: ${options.filters.facility}`,
      options.filters.district && `District: ${options.filters.district}`,
      options.filters.diseaseCode && `Disease: ${getDiseaseName(options.filters.diseaseCode)}`,
      options.filters.status && `Status: ${options.filters.status}`,
    ].filter(Boolean);
    
    if (filterParts.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Applied Filters: ${filterParts.join(' | ')}`, 14, finalY);
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated by: ${options.generatedBy}`, 14, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }

  return doc;
}

function calculateSummary(cases: CaseReportData[]) {
  const summary = {
    total: cases.length,
    byStatus: {} as Record<string, number>,
    byValidation: {} as Record<string, number>,
    byDisease: {} as Record<string, number>,
  };

  cases.forEach(c => {
    summary.byStatus[c.status] = (summary.byStatus[c.status] || 0) + 1;
    summary.byValidation[c.validationStatus] = (summary.byValidation[c.validationStatus] || 0) + 1;
    summary.byDisease[c.diseaseCode] = (summary.byDisease[c.diseaseCode] || 0) + 1;
  });

  return { cases, summary };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
