import { DiseaseCode, Symptom } from '@/types';

export const DISEASE_CODES: { code: DiseaseCode; name: string; priority: 'high' | 'medium' | 'low' }[] = [
    { code: 'CHOLERA', name: 'Cholera', priority: 'high' },
    { code: 'MAL01', name: 'Malaria', priority: 'medium' },
    { code: 'SARI', name: 'Severe Acute Respiratory Illness', priority: 'high' },
    { code: 'AFP', name: 'Acute Flaccid Paralysis', priority: 'medium' },
    { code: 'YELLOW_FEVER', name: 'Yellow Fever', priority: 'high' },
    { code: 'RUBELLA', name: 'Rubella', priority: 'medium' },
    { code: 'MEASLES', name: 'Measles', priority: 'medium' },
    { code: 'PLAGUE', name: 'Plague', priority: 'high' },
    { code: 'RABIES', name: 'Rabies', priority: 'medium' },
    { code: 'EBOLA', name: 'Ebola Virus Disease', priority: 'high' },
    { code: 'MONKEYPOX', name: 'Monkeypox', priority: 'high' },
    { code: 'TYPHOID', name: 'Typhoid Fever', priority: 'medium' },
    { code: 'HEPATITIS_E', name: 'Hepatitis E', priority: 'medium' },
];

export const COMMON_SYMPTOMS: { id: Symptom; label: string }[] = [
    { id: 'fever', label: 'Fever' },
    { id: 'cough', label: 'Cough' },
    { id: 'difficulty_breathing', label: 'Difficulty Breathing' },
    { id: 'diarrhea', label: 'Diarrhea' },
    { id: 'vomiting', label: 'Vomiting' },
    { id: 'headache', label: 'Headache' },
    { id: 'muscle_pain', label: 'Muscle Pain' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'rash', label: 'Rash' },
    { id: 'jaundice', label: 'Jaundice' },
    { id: 'bleeding', label: 'Bleeding' },
    { id: 'convulsions', label: 'Convulsions' },
    { id: 'paralysis', label: 'Paralysis' },
    { id: 'sore_throat', label: 'Sore Throat' },
    { id: 'abdominal_pain', label: 'Abdominal Pain' },
    { id: 'joint_pain', label: 'Joint Pain' },
    { id: 'loss_of_appetite', label: 'Loss of Appetite' },
    { id: 'dehydration', label: 'Dehydration' },
    { id: 'confusion', label: 'Confusion' },
    { id: 'seizures', label: 'Seizures' },
];

export const HIGH_PRIORITY_DISEASES = DISEASE_CODES
    .filter(d => d.priority === 'high')
    .map(d => d.code);
