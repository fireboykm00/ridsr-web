// src/app/(main)/report-case/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Form from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormFieldset from '@/components/ui/FormFieldset';
import { useToastHelpers } from '@/components/ui/Toast';

// Define the schema for case reporting form
const caseReportSchema = z.object({
  patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
  nationalId: z.string().regex(/^\d{16}$/, 'National ID must be 16 digits'),
  age: z.number().min(0).max(150, 'Age must be between 0 and 150'),
  gender: z.enum(['male', 'female', 'other']),
  district: z.string().min(1, 'District is required'),
  sector: z.string().min(1, 'Sector is required'),
  cell: z.string().min(1, 'Cell is required'),
  symptoms: z.array(z.string()).nonempty('At least one symptom must be selected'),
  onsetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  diseaseCategory: z.string().min(1, 'Disease category is required'),
  diseaseName: z.string().min(1, 'Disease name is required'),
  pregnancyStatus: z.string().optional(),
  outcome: z.enum(['recovered', 'deceased', 'ongoing', 'transferred']),
  treatmentGiven: z.string().optional(),
});

type CaseReportFormData = z.infer<typeof caseReportSchema>;

export default function CaseReportForm() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToastHelpers();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You must be signed in to view this page
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors inline-block"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CaseReportFormData>({
    resolver: zodResolver(caseReportSchema),
  });

  const watchedGender = watch('gender');

  const onSubmit = async (data: CaseReportFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call to submit case report
      console.log('Submitting case report:', data);

      // In a real application, you would send the data to your API:
      // const response = await fetch('/api/case-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success toast
      success('Case report submitted successfully!');
      
      // Reset form after successful submission
      setTimeout(() => {
        window.location.reload(); // Or reset form fields
      }, 1000);
    } catch (err) {
      // Show error toast
      error('Failed to submit case report. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options for various fields
  const districts = [
    { value: 'kigali', label: 'Kigali City' },
    { value: 'north', label: 'Northern Province' },
    { value: 'south', label: 'Southern Province' },
    { value: 'east', label: 'Eastern Province' },
    { value: 'west', label: 'Western Province' },
  ];

  const sectors = [
    { value: 'nyarugenge', label: 'Nyarugenge' },
    { value: 'gasabo', label: 'Gasabo' },
    { value: 'kicukiro', label: 'Kicukiro' },
  ]; // Simplified - in reality, sectors would depend on selected district

  const cells = [
    { value: 'gisozi', label: 'Gisozi' },
    { value: 'kimironko', label: 'Kimironko' },
    { value: 'nyarutarama', label: 'Nyarutarama' },
  ]; // Simplified - in reality, cells would depend on selected sector

  const symptoms = [
    { value: 'fever', label: 'Fever' },
    { value: 'headache', label: 'Headache' },
    { value: 'nausea', label: 'Nausea' },
    { value: 'vomiting', label: 'Vomiting' },
    { value: 'diarrhea', label: 'Diarrhea' },
    { value: 'rash', label: 'Rash' },
    { value: 'jaundice', label: 'Jaundice' },
    { value: 'bleeding', label: 'Bleeding' },
  ];

  const diseaseCategories = [
    { value: 'epidemic-prone', label: 'Epidemic Prone Diseases' },
    { value: 'communicable', label: 'Communicable Diseases' },
    { value: 'non-communicable', label: 'Non-Communicable Diseases' },
  ];

  const diseases = [
    { value: 'cholera', label: 'Cholera' },
    { value: 'malaria', label: 'Malaria' },
    { value: 'typhoid', label: 'Typhoid' },
    { value: 'measles', label: 'Measles' },
    { value: 'plague', label: 'Plague' },
    { value: 'yellow-fever', label: 'Yellow Fever' },
    { value: 'hepatitis-e', label: 'Hepatitis E' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Reporting Form</h1>
          <p className="text-gray-600">
            Report suspected or confirmed cases of epidemic-prone diseases
          </p>
        </div>

        <Card className="p-6">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormFieldset legend="Patient Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Patient Full Name"
                  variant="outlined"
                  error={errors.patientName?.message}
                  {...register('patientName')}
                />

                <Input
                  label="National ID (16 digits)"
                  variant="outlined"
                  error={errors.nationalId?.message}
                  {...register('nationalId')}
                />

                <Input
                  label="Age"
                  type="number"
                  variant="outlined"
                  error={errors.age?.message}
                  {...register('age', { valueAsNumber: true })}
                />

                <Select
                  label="Gender"
                  error={errors.gender?.message}
                  options={[
                    { value: '', label: 'Select gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  {...register('gender')}
                />

                {watchedGender === 'female' && (
                  <Select
                    label="Pregnancy Status"
                    options={[
                      { value: '', label: 'Select status' },
                      { value: 'pregnant', label: 'Pregnant' },
                      { value: 'not_pregnant', label: 'Not Pregnant' },
                      { value: 'unknown', label: 'Unknown' },
                    ]}
                    {...register('pregnancyStatus')}
                  />
                )}
              </div>
            </FormFieldset>

            <FormFieldset legend="Location Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select
                  label="District"
                  error={errors.district?.message}
                  options={[{ value: '', label: 'Select district' }, ...districts]}
                  {...register('district')}
                />

                <Select
                  label="Sector"
                  error={errors.sector?.message}
                  options={[{ value: '', label: 'Select sector' }, ...sectors]}
                  {...register('sector')}
                />

                <Select
                  label="Cell"
                  error={errors.cell?.message}
                  options={[{ value: '', label: 'Select cell' }, ...cells]}
                  {...register('cell')}
                />
              </div>
            </FormFieldset>

            <FormFieldset legend="Clinical Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Disease Category"
                  error={errors.diseaseCategory?.message}
                  options={[{ value: '', label: 'Select category' }, ...diseaseCategories]}
                  {...register('diseaseCategory')}
                />

                <Select
                  label="Specific Disease"
                  error={errors.diseaseName?.message}
                  options={[{ value: '', label: 'Select disease' }, ...diseases]}
                  {...register('diseaseName')}
                />

                <Input
                  label="Symptom Onset Date"
                  type="date"
                  variant="outlined"
                  error={errors.onsetDate?.message}
                  {...register('onsetDate')}
                />

                <Select
                  label="Outcome"
                  error={errors.outcome?.message}
                  options={[
                    { value: '', label: 'Select outcome' },
                    { value: 'recovered', label: 'Recovered' },
                    { value: 'deceased', label: 'Deceased' },
                    { value: 'ongoing', label: 'Ongoing Treatment' },
                    { value: 'transferred', label: 'Transferred' },
                  ]}
                  {...register('outcome')}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {symptoms.map((symptom) => (
                    <div key={symptom.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`symptom-${symptom.value}`}
                        value={symptom.value}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        {...register('symptoms')}
                      />
                      <label htmlFor={`symptom-${symptom.value}`} className="ml-2 text-sm text-gray-700">
                        {symptom.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.symptoms && (
                  <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>
                )}
              </div>

              <div className="mt-4">
                <Input
                  label="Treatment Given"
                  variant="outlined"
                  placeholder="Describe treatment administered..."
                  {...register('treatmentGiven')}
                />
              </div>
            </FormFieldset>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Submit Case Report
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}