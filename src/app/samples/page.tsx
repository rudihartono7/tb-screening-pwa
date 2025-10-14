'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Upload, Camera, Eye, Edit, Trash2, FileImage, Calendar, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Sidebar } from '@/components/ui/Sidebar';
import { SampleDto, PatientDto, CreateSampleRequest, UpdateSampleRequest } from '@/types/api';
import { syncManager } from '@/lib/sync';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { DataTable } from '@/components/ui/DataTable';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

interface SampleFormData {
  patientId: string;
  sampleCode: string;
  sampleType: string;
  collectionDate: string;
  notes: string;
}

export default function SamplesPage() {
  const [samples, setSamples] = useState<SampleDto[]>([]);
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<SampleDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<SampleDto | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleDto | null>(null);
  const [formData, setFormData] = useState<SampleFormData>({
    patientId: '',
    sampleCode: '',
    sampleType: '',
    collectionDate: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<SampleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const { isOnline, isSyncing, syncError } = useOfflineSync();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter samples based on search term
    const filtered = samples.filter(sample => {
      const searchLower = searchTerm.toLowerCase();
      return (
        sample.sampleType?.toLowerCase().includes(searchLower) ||
        sample.sampleCode?.toLowerCase().includes(searchLower) ||
        sample.status?.toLowerCase().includes(searchLower) ||
        getPatientName(sample.patientId).toLowerCase().includes(searchLower)
      );
    });
    console.log('Filtered samples:', filtered);
    console.log('Samples array length:', samples.length);
    console.log('Filtered samples length:', filtered.length);
    setFilteredSamples(filtered);
  }, [samples, searchTerm, patients]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [samplesData, patientsData] = await Promise.all([
        syncManager.getSamples(1, 50, searchTerm),
        syncManager.getPatients()
      ]);
      
      console.log('Samples data received:', samplesData); // Debug log
      console.log('Patients data received:', patientsData); // Debug log
      
      setSamples(samplesData.data || []);
      setPatients(patientsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      sampleCode: '',
      sampleType: '',
      collectionDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setFormErrors({});
    setEditingSample(null);
    setSelectedFiles([]);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (sample: SampleDto) => {
    setEditingSample(sample);
    setFormData({
      patientId: sample.patientId,
      sampleCode: sample.sampleCode,
      sampleType: sample.sampleType,
      collectionDate: sample.collectionDate.split('T')[0],
      notes: '',
    });
    setFormErrors({});
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const openImageModal = (sample: SampleDto) => {
    console.log('Opening image modal for sample:', sample);
    setSelectedSample(sample);
    setIsImageModalOpen(true);
    // Load image URLs when modal opens
    loadImageUrls(sample);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedSample(null);
  };

  const validateForm = (): boolean => {
    const errors: Partial<SampleFormData> = {};

    if (!formData.patientId) {
      errors.patientId = 'Please select a patient';
    }

    if (!formData.sampleType.trim()) {
      errors.sampleType = 'Sample type is required';
    }

    if (!formData.collectionDate) {
      errors.collectionDate = 'Collection date is required';
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
      const sampleData = {
        patientId: formData.patientId,
        sampleCode: formData.sampleCode.trim(),
        sampleType: formData.sampleType.trim(),
        collectionDate: new Date(formData.collectionDate).toISOString(),
      };

      if (editingSample) {
        // Update existing sample
        const updateData = {
          ...sampleData,
          status: editingSample.status, // Keep existing status
        };
        await syncManager.updateSample(editingSample.id, updateData as UpdateSampleRequest);
      } else {
        // Create new sample
        await syncManager.createSample(sampleData as CreateSampleRequest);
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving sample:', error);
      setFormErrors({ sampleType: 'Failed to save sample. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sample: SampleDto) => {
    if (!confirm(`Are you sure you want to delete this sample? This action cannot be undone.`)) {
      return;
    }

    try {
      await syncManager.deleteSample(sample.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting sample:', error);
      alert('Failed to delete sample. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof SampleFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleImageUpload = async (sampleId: string) => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      // TODO: Implement image upload to backend
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Images uploaded successfully! AI analysis will be processed shortly.');
      await loadData();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'collected':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  // Function to fetch image URL from API
  const fetchImageUrl = async (imageId: string) => {
    if (imageUrls[imageId] || loadingImages[imageId]) {
      return imageUrls[imageId];
    }

    console.log('Fetching image URL for:', imageId);
    setLoadingImages(prev => ({ ...prev, [imageId]: true }));
    
    try {
      const response = await apiService.get<{ url: string; expiresIn: number }>(`/images/url/${imageId}?expirationMinutes=60`);
      console.log('Image URL response:', response);
      const imageUrl = response.url;
      
      setImageUrls(prev => ({ ...prev, [imageId]: imageUrl }));
      setLoadingImages(prev => ({ ...prev, [imageId]: false }));
      
      return imageUrl;
    } catch (error) {
      console.error('Error fetching image URL:', error);
      setLoadingImages(prev => ({ ...prev, [imageId]: false }));
      return null;
    }
  };

  // Load image URLs when modal opens
  const loadImageUrls = async (sample: SampleDto) => {
    console.log('Loading image URLs for sample:', sample.id, 'Images:', sample.sampleImages);
    if (sample.sampleImages && sample.sampleImages.length > 0) {
      for (const image of sample.sampleImages) {
        console.log('Processing image:', image);
        await fetchImageUrl(image.id);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-0 sm:ml-64">
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Samples
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                  Manage sample collection and AI analysis
                </p>
              </div>
              <Button onClick={openCreateModal} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="sm:inline">Add Sample</span>
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
              <div className={cn(
                "flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm",
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
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <LoadingSpinner size="sm" />
                  Syncing...
                </div>
              )}
              
              {syncError && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Sync Error
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search samples..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Samples List */}
          <DataTable
            data={filteredSamples}
            loading={isLoading}
            emptyMessage={searchTerm ? 'No samples found' : 'No samples yet'}
            columns={[
              {
                key: 'sampleCode',
                header: 'Sample Code',
                sortable: true,
                render: (sample) => (
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {sample.sampleCode || 'N/A'}
                  </div>
                )
              },
              {
                key: 'sampleType',
                header: 'Type',
                sortable: true,
                render: (sample) => sample.sampleType || 'N/A'
              },
              {
                key: 'patientId',
                header: 'Patient',
                render: (sample) => getPatientName(sample.patientId)
              },
              {
                key: 'status',
                header: 'Status',
                sortable: true,
                render: (sample) => (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(sample.status)
                  )}>
                    {sample.status || 'Unknown'}
                  </span>
                )
              },
              {
                key: 'collectionDate',
                header: 'Collection Date',
                sortable: true,
                render: (sample) => sample.collectionDate ? new Date(sample.collectionDate).toLocaleDateString() : 'N/A'
              },
              {
                key: 'sampleImages',
                header: 'Images',
                render: (sample) => `${sample.sampleImages?.length || 0} image${(sample.sampleImages?.length || 0) !== 1 ? 's' : ''}`
              },
              {
                key: 'analysisResults',
                header: 'Results',
                render: (sample) => `${sample.analysisResults?.length || 0} result${(sample.analysisResults?.length || 0) !== 1 ? 's' : ''}`
              }
            ]}
            actions={(sample) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openImageModal(sample)}
                  title="View Images"
                  className="p-1"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(sample)}
                  title="Edit Sample"
                  className="p-1"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(sample)}
                  title="Delete Sample"
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            pageSize={10}
            className="mt-6"
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSample ? 'Edit Sample' : 'Add New Sample'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patient
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
                formErrors.patientId && 'border-red-300 focus:ring-red-500 focus:border-red-500'
              )}
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.familyName})
                </option>
              ))}
            </select>
            {formErrors.patientId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.patientId}</p>
            )}
          </div>

          <Input
            label="Sample Code"
            name="sampleCode"
            type="text"
            value={formData.sampleCode}
            onChange={handleInputChange}
            placeholder="Enter sample code"
            disabled={isSubmitting}
            error={formErrors.sampleCode}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sample Type
            </label>
            <select
              name="sampleType"
              value={formData.sampleType}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
                formErrors.sampleType && 'border-red-300 focus:ring-red-500 focus:border-red-500'
              )}
            >
              <option value="">Select sample type</option>
              <option value="Sputum">Sputum</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Blood">Blood</option>
              <option value="Urine">Urine</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.sampleType && (
              <p className="mt-1 text-sm text-red-600">{formErrors.sampleType}</p>
            )}
          </div>

          <Input
            label="Collection Date"
            name="collectionDate"
            type="date"
            value={formData.collectionDate}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            error={formErrors.collectionDate}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter any additional notes..."
              disabled={isSubmitting}
              rows={3}
              className={cn(
                'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-white'
              )}
            />
          </div>

          {!editingSample && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
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
              {editingSample ? 'Update Sample' : 'Create Sample'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        title={`Sample Images - ${selectedSample?.sampleType}`}
        size="lg"
      >
        {selectedSample && (
          <div className="space-y-4">
            {selectedSample.sampleImages.length === 0 ? (
              <div className="text-center py-8">
                <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No images uploaded for this sample
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {selectedSample.sampleImages.map((image: any) => (
                  <div key={image.id} className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden relative">
                      {loadingImages[image.id] ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2 text-sm text-gray-500">Loading image...</span>
                        </div>
                      ) : imageUrls[image.id] ? (
                        <img
                          src={imageUrls[image.id]}
                          alt={image.originalFilename}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('Image loaded successfully:', image.id)}
                          onError={(e) => {
                            console.error('Failed to load image:', image.id, 'URL:', imageUrls[image.id]);
                            // Show fallback icon on error
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="fallback-icon w-full h-full flex items-center justify-center absolute top-0 left-0"
                        style={{ display: imageUrls[image.id] ? 'none' : 'flex' }}
                      >
                        <div className="text-center">
                          <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">
                            {loadingImages[image.id] ? 'Loading...' : 'No preview'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{image.originalFilename}</p>
                    <p className="text-xs text-gray-500">
                      {(image.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
            )}

            {selectedSample.analysisResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Analysis Results</h4>
                <div className="space-y-3">
                  {selectedSample.analysisResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.analysisType}</span>
                        <span className="text-sm text-gray-500">
                          Confidence: {(result.confidenceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm">{result.result}</p>
                      {result.metadata && (
                        <p className="text-xs text-gray-600 mt-1">{result.metadata}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}