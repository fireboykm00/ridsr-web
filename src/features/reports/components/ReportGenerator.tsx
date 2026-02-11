// src/features/reports/components/ReportGenerator.tsx
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import ReportFilterForm from '@/components/forms/ReportFilterForm';
import { Button } from '@/components/ui/Button';

interface ReportFilters {
  reportType: string;
  facilityId?: string;
  districtId?: string;
  startDate: string;
  endDate: string;
  diseaseCodes: string[];
  includeTrends: boolean;
  includeMaps: boolean;
  includeRecommendations: boolean;
}

interface ReportSummary {
  totalCases: number;
  newCases: number;
  pendingCases: number;
  validatedCases: number;
  rejectedCases: number;
}

interface DiseaseData {
  name: string;
  count: number;
  percentage: number;
}

interface ReportTrend {
  date: string;
  count: number;
}

interface ReportContent {
  summary: ReportSummary;
  trends: ReportTrend[];
  diseases: DiseaseData[];
  recommendations: string[];
}

interface GeneratedReport {
  id: string;
  title: string;
  description: string;
  type: string;
  dateGenerated: string;
  status: string;
  downloadUrl: string;
  content: ReportContent;
}

const ReportGenerator: React.FC = () => {
  const [step, setStep] = useState<'form' | 'generating' | 'result'>('form');
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [filters, setFilters] = useState<ReportFilters | null>(null);

  const handleFormSubmit = async (filters: ReportFilters) => {
    setFilters(filters);
    setStep('generating');

    // Simulate API call to generate report
    try {
      // In a real application, this would be an API call to generate the report
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // TODO: Fetch report data from API endpoint
      // Using mock data for now
      const mockReport = {
        id: `REPORT_${Date.now()}`,
        title: `Generated ${filters.reportType} Report`,
        description: `Report covering ${filters.startDate} to ${filters.endDate}`,
        type: filters.reportType,
        dateGenerated: new Date().toISOString(),
        status: 'completed',
        downloadUrl: '#',
        content: {
          summary: {
            totalCases: 124,
            newCases: 18,
            pendingCases: 5,
            validatedCases: 98,
            rejectedCases: 11,
          },
          trends: [
            { date: '2024-01-01', count: 5 },
            { date: '2024-01-02', count: 8 },
            { date: '2024-01-03', count: 12 },
            { date: '2024-01-04', count: 7 },
            { date: '2024-01-05', count: 15 },
            { date: '2024-01-06', count: 22 },
            { date: '2024-01-07', count: 18 },
          ],
          diseases: [
            { name: 'Malaria', count: 45, percentage: 36.3 },
            { name: 'Cholera', count: 30, percentage: 24.2 },
            { name: 'SARI', count: 18, percentage: 14.5 },
            { name: 'AFP', count: 12, percentage: 9.7 },
            { name: 'Other', count: 19, percentage: 15.3 },
          ],
          recommendations: [
            'Continue monitoring malaria cases closely, especially in high-risk areas',
            'Ensure adequate supplies for cholera treatment and prevention',
            'Review SARI prevention protocols with healthcare workers',
            'Investigate AFP cases for potential polio surveillance'
          ]
        }
      };
      
      setGeneratedReport(mockReport);
      setStep('result');
    } catch (error) {
      console.error('Error generating report:', error);
      setStep('form');
    }
  };

  const handleGenerateAnother = () => {
    setStep('form');
    setGeneratedReport(null);
    setFilters(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Report Generator</h2>
        <p className="text-gray-600">Create customized reports for surveillance and analysis</p>
      </div>

      {step === 'form' && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h3>
          <ReportFilterForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => {}} 
          />
        </Card>
      )}

      {step === 'generating' && (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Generating Report</h3>
          <p className="text-gray-600">Please wait while we compile your report...</p>
        </Card>
      )}

      {step === 'result' && generatedReport && (
        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{generatedReport.title}</h3>
              <p className="text-gray-600">{generatedReport.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Generated on {new Date(generatedReport.dateGenerated).toLocaleString()}
              </p>
            </div>
            <Button variant="primary" onClick={() => window.open(generatedReport.downloadUrl)}>
              Download Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cases:</span>
                  <span className="font-medium">{generatedReport.content.summary.totalCases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Cases:</span>
                  <span className="font-medium">{generatedReport.content.summary.newCases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Cases:</span>
                  <span className="font-medium">{generatedReport.content.summary.pendingCases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validated Cases:</span>
                  <span className="font-medium">{generatedReport.content.summary.validatedCases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected Cases:</span>
                  <span className="font-medium">{generatedReport.content.summary.rejectedCases}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Top Diseases</h4>
              <div className="space-y-3">
                {generatedReport.content.diseases.map((disease: DiseaseData, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">{disease.name}:</span>
                      <span className="font-medium">{disease.count} cases ({disease.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${disease.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h4>
            <ul className="list-disc pl-5 space-y-2">
              {generatedReport.content.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="secondary" onClick={handleGenerateAnother}>
              Generate Another Report
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportGenerator;