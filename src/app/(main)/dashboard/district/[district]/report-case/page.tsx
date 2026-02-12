'use client';

import { Checkbox } from "@/components/ui/Checkbox";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormFieldset } from '@/components/ui/FormFieldset';
import { useToastHelpers } from '@/components/ui/Toast';
import { USER_ROLES, RwandaDistrictType } from '@/types';
import { facilityService } from '@/lib/services/facilityService';

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
  reporterFacility: z.string().min(1, 'Reporting facility is required'),
  reporterRole: z.string().min(1, 'Reporter role is required'),
  reporterName: z.string().min(1, 'Reporter name is required'),
  reporterEmail: z.string().email('Invalid email format'),
});

type CaseReportFormData = z.infer<typeof caseReportSchema>;

export default function DistrictCaseReportForm() {
  const { data: session, status } = useSession();
  const params = useParams();
  const district = params.district as RwandaDistrictType;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facilities, setFacilities] = useState<{ id: string, name: string }[]>([]);
  const { success, error } = useToastHelpers();

  // Load facilities in the district
  useEffect(() => {
    const loadFacilities = async () => {
      if (status === 'authenticated' && session && district) {
        try {
          if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district === district) {
            const districtFacilities = await facilityService.getFacilitiesByDistrict(district);
            setFacilities(districtFacilities.map(f => ({ id: f.id, name: f.name })));
          }
        } catch (err) {
          console.error('Error loading facilities:', err);
        }
      }
    };

    loadFacilities();
  }, [status, session, district]);

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

  // Initialize form with default values, will be updated when session loads
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset
  } = useForm<CaseReportFormData>({
    resolver: zodResolver(caseReportSchema),
    defaultValues: {
      patientName: '',
      nationalId: '',
      age: 0,
      gender: 'male',
      district: district || '', // Pre-fill with the district from the URL
      sector: '',
      cell: '',
      symptoms: [],
      onsetDate: new Date().toISOString().split('T')[0],
      diseaseCategory: '',
      diseaseName: '',
      pregnancyStatus: '',
      outcome: 'ongoing',
      treatmentGiven: '',
      reporterFacility: '',
      reporterRole: '',
      reporterName: '',
      reporterEmail: ''
    }
  });

  // Update form values when session loads
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      reset({
        reporterFacility: session.user?.facilityId || '',
        reporterRole: session.user?.role || '',
        district: district, // Pre-fill with the district from the URL
        reporterName: session.user?.name || '',
        reporterEmail: session.user?.email || ''
      });
    }
  }, [status, session, district, reset]);

  const watchedGender = watch('gender');
  const watchedDistrict = watch('district');

  const onSubmit = async (data: CaseReportFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare the submission data
      const submissionData = {
        ...data,
        reporterId: session.user?.id,
        reporterName: session.user?.name,
        reporterEmail: session.user?.email,
        reporterFacility: facilities.find(f => f.id === data.reporterFacility)?.name || data.reporterFacility,
      };

      console.log('Submitting case report:', submissionData);

      // In a real application, you would send the data to your API:
      // const response = await fetch('/api/case-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submissionData),
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

  // Facility options based on loaded facilities
  const facilityOptions = [
    { value: '', label: 'Select reporting facility' },
    ...facilities.map(facility => ({
      value: facility.id,
      label: facility.name
    }))
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Reporting Form</h1>
          <p className="text-gray-600">
            Report suspected or confirmed cases of epidemic-prone diseases in {district}
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

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Gender"
                      error={errors.gender?.message}
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: '', label: 'Select gender' },
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />
                  )}
                />

                {watchedGender === 'female' && (
                  <Controller
                    name="pregnancyStatus"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Pregnancy Status"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: '', label: 'Select status' },
                          { value: 'pregnant', label: 'Pregnant' },
                          { value: 'not_pregnant', label: 'Not Pregnant' },
                          { value: 'unknown', label: 'Unknown' },
                        ]}
                      />
                    )}
                  />
                )}
              </div>
            </FormFieldset>

            <FormFieldset legend="Location Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Controller
                  name="district"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="District"
                      error={errors.district?.message}
                      value={district}
                      onChange={field.onChange}
                      options={[{ value: '', label: 'Select district' }, ...districts]}
                      disabled
                    />
                  )}
                />

                <Controller
                  name="sector"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Sector"
                      error={errors.sector?.message}
                      value={field.value}
                      onChange={field.onChange}
                      options={[{ value: '', label: 'Select sector' }, ...sectors]}
                    />
                  )}
                />

                <Controller
                  name="cell"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Cell"
                      error={errors.cell?.message}
                      value={field.value}
                      onChange={field.onChange}
                      options={[{ value: '', label: 'Select cell' }, ...cells]}
                    />
                  )}
                />
              </div>
            </FormFieldset>

            <FormFieldset legend="Clinical Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="diseaseCategory"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Disease Category"
                      error={errors.diseaseCategory?.message}
                      value={field.value}
                      onChange={field.onChange}
                      options={[{ value: '', label: 'Select category' }, ...diseaseCategories]}
                    />
                  )}
                />

                <Controller
                  name="diseaseName"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Specific Disease"
                      error={errors.diseaseName?.message}
                      value={field.value}
                      onChange={field.onChange}
                      options={[{ value: '', label: 'Select disease' }, ...diseases]}
                    />
                  )}
                />

                <Input
                  label="Symptom Onset Date"
                  type="date"
                  variant="outlined"
                  error={errors.onsetDate?.message}
                  {...register('onsetDate')}
                />

                <Controller
                  name="outcome"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Outcome"
                      error={errors.outcome?.message}
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: '', label: 'Select outcome' },
                        { value: 'recovered', label: 'Recovered' },
                        { value: 'deceased', label: 'Deceased' },
                        { value: 'ongoing', label: 'Ongoing Treatment' },
                        { value: 'transferred', label: 'Transferred' },
                      ]}
                    />
                  )}
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