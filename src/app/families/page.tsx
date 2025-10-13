'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MapPin, Phone, Users, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Sidebar } from '@/components/ui/Sidebar';
import { FamilyDto, CreateFamilyRequest, UpdateFamilyRequest } from '@/types/api';
import { syncManager } from '@/lib/sync';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

interface FamilyFormData {
  familyName: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<FamilyDto[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<FamilyDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyDto | null>(null);
  const [formData, setFormData] = useState({
    familyIdentityNumber: '',
    familyName: '',
    address: '',
    phone: '',
    latitude: 0,
    longitude: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const { isOnline, isSyncing, syncError } = useOfflineSync();

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    // Filter families based on search term
    const filtered = families.filter(family =>
      family.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFamilies(filtered);
  }, [families, searchTerm]);

  const loadFamilies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await syncManager.getFamilies(currentPage, pageSize, searchTerm);
      setFamilies(response.data || []);
      setFilteredFamilies(response.data || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  const resetForm = () => {
    setFormData({
      familyIdentityNumber: '',
      familyName: '',
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
    });
    setErrors({});
    setEditingFamily(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (family: FamilyDto) => {
    setEditingFamily(family);
    setFormData({
      familyIdentityNumber: family.familyIdentityNumber,
      familyName: family.familyName,
      address: family.address,
      phone: family.phone || '',
      latitude: family.latitude || 0,
      longitude: family.longitude || 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.familyIdentityNumber.trim()) {
      newErrors.familyIdentityNumber = 'Family Identity Number is required';
    }

    if (!formData.familyName.trim()) {
      newErrors.familyName = 'Family name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.latitude && isNaN(Number(formData.latitude))) {
      newErrors.latitude = 'Latitude must be a valid number';
    }

    if (formData.longitude && isNaN(Number(formData.longitude))) {
      newErrors.longitude = 'Longitude must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const familyData = {
        familyIdentityNumber: formData.familyIdentityNumber,
        familyName: formData.familyName,
        address: formData.address,
        phone: formData.phone || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
      };

      if (editingFamily) {
        await syncManager.updateFamily(editingFamily.id, familyData);
      } else {
        await syncManager.createFamily(familyData);
      }

      setShowModal(false);
      resetForm();
      loadFamilies();
    } catch (error) {
      console.error('Error saving family:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this family?')) return;

    try {
      await syncManager.deleteFamily(id);
      loadFamilies();
    } catch (error) {
      console.error('Error deleting family:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to delete family' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
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
                  Families
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                  Manage family records and their information
                </p>
              </div>
              <Button onClick={openCreateModal} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Family
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
                placeholder="Search families..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Families List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredFamilies.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No families found' : 'No families yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first family'
                }
              </p>
              {!searchTerm && (
                <Button onClick={openCreateModal} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Family
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFamilies.map((family) => (
                <div
                  key={family.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {family.familyName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {family.patients.length} member{family.patients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(family)}
                        className="text-blue-600 hover:text-blue-800 p-1 sm:p-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(family.id)}
                        className="text-red-600 hover:text-red-700 p-1 sm:p-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{family.address}</span>
                    </div>
                    
                    {family.phone && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="break-all">{family.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(family.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingFamily ? 'Edit Family' : 'Add New Family'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Family Identity Number"
            name="familyIdentityNumber"
            value={formData.familyIdentityNumber}
            onChange={handleInputChange}
            placeholder="Enter family identity number"
            required
            disabled={isSubmitting}
            error={errors.familyIdentityNumber}
          />

          <Input
            label="Family Name"
            name="familyName"
            value={formData.familyName}
            onChange={handleInputChange}
            placeholder="Enter family name"
            required
            disabled={isSubmitting}
            error={errors.familyName}
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
            required
            disabled={isSubmitting}
            error={errors.address}
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number (optional)"
            disabled={isSubmitting}
            error={errors.phone}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              name="latitude"
              value={formData.latitude.toString()}
              onChange={handleInputChange}
              placeholder="e.g., -6.2088"
              disabled={isSubmitting}
              error={errors.latitude}
            />

            <Input
              label="Longitude"
              name="longitude"
              value={formData.longitude.toString()}
              onChange={handleInputChange}
              placeholder="e.g., 106.8456"
              disabled={isSubmitting}
              error={errors.longitude}
            />
          </div>

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
              {editingFamily ? 'Update Family' : 'Create Family'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}