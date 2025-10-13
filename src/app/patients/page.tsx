'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, User, Calendar, Phone, Users, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Sidebar } from '@/components/ui/Sidebar';
import { PatientDto, FamilyDto, CreatePatientRequest, UpdatePatientRequest } from '@/types/api';
import { syncManager } from '@/lib/sync';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

interface PatientFormData {
  familyId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  nik: string;
  phone: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [families, setFamilies] = useState<FamilyDto[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientDto | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    familyId: '',
    name: '',
    dateOfBirth: '',
    gender: '',
    nik: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<PatientFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOnline, isSyncing, syncError } = useOfflineSync();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.nik && patient.nik.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [patientsResponse, familiesResponse] = await Promise.all([
        syncManager.getPatients(1, 50, searchTerm),
        syncManager.getFamilies()
      ]);
      setPatients(patientsResponse.data || []);
      setFamilies(familiesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      familyId: '',
      name: '',
      dateOfBirth: '',
      gender: '',
      nik: '',
      phone: '',
    });
    setFormErrors({});
    setEditingPatient(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (patient: PatientDto) => {
    setEditingPatient(patient);
    setFormData({
      familyId: patient.familyId,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth.split('T')[0], // Convert to YYYY-MM-DD format
      gender: patient.gender,
      nik: patient.nik || '',
      phone: patient.phone || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: Partial<PatientFormData> = {};

    if (!formData.familyId) {
      errors.familyId = 'Please select a family';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const patientData = {
        familyId: formData.familyId,
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nik: formData.nik.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      };

      if (editingPatient) {
        // Update existing patient
        await syncManager.updatePatient(editingPatient.id, patientData as UpdatePatientRequest);
      } else {
        // Create new patient
        await syncManager.createPatient(patientData as CreatePatientRequest);
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving patient:', error);
      setFormErrors({ name: 'Failed to save patient. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (patient: PatientDto) => {
    if (!confirm(`Are you sure you want to delete patient "${patient.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await syncManager.deletePatient(patient.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof PatientFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const getAgeFromDateOfBirth = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="ml-16 lg:ml-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Patients
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                  Manage patient records and their information
                </p>
              </div>
              <Button onClick={openCreateModal} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Patient
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 ml-16 lg:ml-0">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm",
                isOnline 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isOnline ? "bg-green-500" : "bg-red-500"
                )} />
                {isOnline ? 'Online' : 'Offline'}
              </div>
              
              {isSyncing && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <LoadingSpinner size="sm" />
                  Syncing...
                </div>
              )}
              
              {syncError && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Sync Error
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Patients List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first patient'
                }
              </p>
              {!searchTerm && (
                <Button onClick={openCreateModal} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {patient.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {patient.familyName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(patient)}
                        className="p-1 sm:p-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-700 p-1 sm:p-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">
                        Age {getAgeFromDateOfBirth(patient.dateOfBirth)} • {patient.gender}
                      </span>
                    </div>
                    
                    {patient.nik && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="break-all">NIK: {patient.nik}</span>
                      </div>
                    )}
                    
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="break-all">{patient.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {patient.samples.length} sample{patient.samples.length !== 1 ? 's' : ''}
                      </span>
                      <span className="truncate ml-2">
                        Created: {new Date(patient.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Family
            </label>
            <select
              name="familyId"
              value={formData.familyId}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
                formErrors.familyId && 'border-red-300 focus:ring-red-500 focus:border-red-500'
              )}
            >
              <option value="">Select a family</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.familyName}
                </option>
              ))}
            </select>
            {formErrors.familyId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.familyId}</p>
            )}
          </div>

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter patient name"
            required
            disabled={isSubmitting}
            error={formErrors.name}
          />

          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            error={formErrors.dateOfBirth}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
                formErrors.gender && 'border-red-300 focus:ring-red-500 focus:border-red-500'
              )}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {formErrors.gender && (
              <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
            )}
          </div>

          <Input
            label="NIK (National ID)"
            name="nik"
            value={formData.nik}
            onChange={handleInputChange}
            placeholder="Enter NIK (optional)"
            disabled={isSubmitting}
            error={formErrors.nik}
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number (optional)"
            disabled={isSubmitting}
            error={formErrors.phone}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {editingPatient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}