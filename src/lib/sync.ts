import { dbManager } from './db';
import { apiService } from '@/services/api';

export class SyncManager {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.setupOnlineListener();
  }

  private setupOnlineListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingChanges();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const syncQueue = await dbManager.getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          await this.processSyncItem(item);
          await dbManager.removeSyncItem(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          // Keep item in queue for retry
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async processSyncItem(item: any): Promise<void> {
    const { action, table, data } = item;

    switch (table) {
      case 'families':
        await this.syncFamily(action, data);
        break;
      case 'patients':
        await this.syncPatient(action, data);
        break;
      case 'samples':
        await this.syncSample(action, data);
        break;
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  private async syncFamily(action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
        await apiService.post('/families', data);
        break;
      case 'update':
        await apiService.put(`/families/${data.id}`, data);
        break;
      case 'delete':
        await apiService.delete(`/families/${data.id}`);
        break;
    }
  }

  private async syncPatient(action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
        await apiService.post('/patients', data);
        break;
      case 'update':
        await apiService.put(`/patients/${data.id}`, data);
        break;
      case 'delete':
        await apiService.delete(`/patients/${data.id}`);
        break;
    }
  }

  private async syncSample(action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
        await apiService.post('/samples', data);
        break;
      case 'update':
        await apiService.put(`/samples/${data.id}`, data);
        break;
      case 'delete':
        await apiService.delete(`/samples/${data.id}`);
        break;
    }
  }

  // Families API
  async getFamilies(page: number = 1, pageSize: number = 10, search?: string): Promise<any> {
    if (this.isOnline) {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        
        if (search) {
          params.append('search', search);
        }
        
        const response: any = await apiService.get(`/families?${params}`);
        
        // The backend returns families directly as an array, not wrapped in a data property
        const families = Array.isArray(response) ? response : [];
        
        // Update local storage with fresh data
        for (const family of families) {
          await dbManager.put('families', family);
        }
        
        // Return in the expected format
        return {
          data: families,
          totalCount: parseInt(response.headers?.['x-total-count'] || '0'),
          page,
          pageSize
        };
      } catch (error) {
        console.error('Error fetching families:', error);
        // Fallback to local data
        const localFamilies = await dbManager.getAll('families');
        return {
          data: localFamilies.slice((page - 1) * pageSize, page * pageSize),
          totalCount: localFamilies.length,
          page,
          pageSize
        };
      }
    } else {
      const localFamilies = await dbManager.getAll('families');
      return {
        data: localFamilies.slice((page - 1) * pageSize, page * pageSize),
        totalCount: localFamilies.length,
        page,
        pageSize
      };
    }
  }

  async getPatients(page: number = 1, pageSize: number = 10, search?: string, familyId?: string): Promise<any> {
    if (this.isOnline) {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        
        if (search) {
          params.append('search', search);
        }
        
        if (familyId) {
          params.append('familyId', familyId);
        }
        
        const response: any = await apiService.get(`/patients?${params}`);
        
        // Backend returns array directly, not wrapped in data property
        const patients = Array.isArray(response) ? response : [];
        const totalCount = response.headers?.['x-total-count'] ? parseInt(response.headers['x-total-count']) : patients.length;
        
        // Update local storage with fresh data
        for (const patient of patients) {
          await dbManager.put('patients', patient);
        }
        
        return {
          data: patients,
          totalCount,
          page,
          pageSize
        };
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Fallback to local data
        const localPatients = await dbManager.getAll('patients');
        let filteredPatients = localPatients;
        
        if (familyId) {
          filteredPatients = localPatients.filter((p: any) => p.familyId === familyId);
        }
        
        if (search) {
          filteredPatients = filteredPatients.filter((p: any) => 
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.nik?.toLowerCase().includes(search.toLowerCase()) ||
            p.phone?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        return {
          data: filteredPatients.slice((page - 1) * pageSize, page * pageSize),
          totalCount: filteredPatients.length,
          page,
          pageSize
        };
      }
    } else {
      const localPatients = await dbManager.getAll('patients');
      let filteredPatients = localPatients;
      
      if (familyId) {
        filteredPatients = localPatients.filter((p: any) => p.familyId === familyId);
      }
      
      if (search) {
        filteredPatients = filteredPatients.filter((p: any) => 
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.nik?.toLowerCase().includes(search.toLowerCase()) ||
          p.phone?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return {
        data: filteredPatients.slice((page - 1) * pageSize, page * pageSize),
        totalCount: filteredPatients.length,
        page,
        pageSize
      };
    }
  }

  async getSamples(page: number = 1, pageSize: number = 10, search?: string, patientId?: string, status?: string, sampleType?: string): Promise<any> {
    if (this.isOnline) {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        
        if (search) {
          params.append('search', search);
        }
        
        if (patientId) {
          params.append('patientId', patientId);
        }
        
        if (status) {
          params.append('status', status);
        }
        
        if (sampleType) {
          params.append('sampleType', sampleType);
        }
        
        const response: any = await apiService.get(`/samples?${params}`);
        
        // Backend might return samples directly as an array or wrapped in a data property
        const samples = Array.isArray(response) ? response : (response.data || []);
        const totalCount = response.totalCount || response.headers?.['x-total-count'] ? parseInt(response.headers['x-total-count']) : samples.length;
        
        // Update local storage with fresh data
        for (const sample of samples) {
          await dbManager.put('samples', sample);
        }
        
        // Return in consistent format
        return {
          data: samples,
          totalCount,
          page,
          pageSize
        };
      } catch (error) {
        console.error('Error fetching samples:', error);
        // Fallback to local data
        const localSamples = await dbManager.getAll('samples');
        let filteredSamples = localSamples;
        
        if (patientId) {
          filteredSamples = localSamples.filter((s: any) => s.patientId === patientId);
        }
        
        if (status) {
          filteredSamples = filteredSamples.filter((s: any) => s.status === status);
        }
        
        if (sampleType) {
          filteredSamples = filteredSamples.filter((s: any) => s.sampleType === sampleType);
        }
        
        if (search) {
          filteredSamples = filteredSamples.filter((s: any) => 
            s.patientName?.toLowerCase().includes(search.toLowerCase()) ||
            s.sampleType?.toLowerCase().includes(search.toLowerCase()) ||
            s.status?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        return {
          data: filteredSamples.slice((page - 1) * pageSize, page * pageSize),
          totalCount: filteredSamples.length,
          page,
          pageSize
        };
      }
    } else {
      const localSamples = await dbManager.getAll('samples');
      let filteredSamples = localSamples;
      
      if (patientId) {
        filteredSamples = localSamples.filter((s: any) => s.patientId === patientId);
      }
      
      if (status) {
        filteredSamples = filteredSamples.filter((s: any) => s.status === status);
      }
      
      if (sampleType) {
        filteredSamples = filteredSamples.filter((s: any) => s.sampleType === sampleType);
      }
      
      if (search) {
        filteredSamples = filteredSamples.filter((s: any) => 
          s.patientName?.toLowerCase().includes(search.toLowerCase()) ||
          s.sampleType?.toLowerCase().includes(search.toLowerCase()) ||
          s.status?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return {
        data: filteredSamples.slice((page - 1) * pageSize, page * pageSize),
        totalCount: filteredSamples.length,
        page,
        pageSize
      };
    }
  }

  // Offline-first CRUD operations
  async createFamily(data: any): Promise<void> {
    if (this.isOnline) {
      try {
        const response: any = await apiService.post('/families', data);
        // Save to local storage
        if (response) {
          await dbManager.put('families', response);
        }
      } catch (error) {
        console.error('Error creating family:', error);
        // Add to sync queue for later
        await dbManager.addToSyncQueue('create', 'families', data);
        // Save locally with temporary ID
        const tempId = `temp_${Date.now()}`;
        await dbManager.put('families', { ...data, id: tempId });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('create', 'families', data);
      // Save locally with temporary ID
      const tempId = `temp_${Date.now()}`;
      await dbManager.put('families', { ...data, id: tempId });
    }
  }

  async updateFamily(id: string, data: any): Promise<void> {
    // Update locally immediately
    await dbManager.put('families', { ...data, id });

    if (this.isOnline) {
      try {
        await apiService.put(`/families/${id}`, data);
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('update', 'families', { ...data, id });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('update', 'families', { ...data, id });
    }
  }

  async deleteFamily(id: string): Promise<void> {
    // Delete locally immediately
    await dbManager.delete('families', id);

    if (this.isOnline) {
      try {
        await apiService.delete(`/families/${id}`);
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('delete', 'families', { id });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('delete', 'families', { id });
    }
  }

  // Patient CRUD operations
  async createPatient(data: any): Promise<void> {
    // Store locally immediately
    const localId = `temp-${Date.now()}`;
    const patientData = { ...data, id: localId, _isLocal: true };
    await dbManager.put('patients', patientData);

    if (this.isOnline) {
      try {
        const response: any = await apiService.post('/patients', data);
        // Update with server ID
        await dbManager.put('patients', { ...response, _isLocal: false });
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('create', 'patients', data);
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('create', 'patients', data);
    }
  }

  async updatePatient(id: string, data: any): Promise<void> {
    // Update locally immediately
    await dbManager.put('patients', { ...data, id });

    if (this.isOnline) {
      try {
        await apiService.put(`/patients/${id}`, data);
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('update', 'patients', { ...data, id });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('update', 'patients', { ...data, id });
    }
  }

  async deletePatient(id: string): Promise<void> {
    // Delete locally immediately
    await dbManager.delete('patients', id);

    if (this.isOnline) {
      try {
        await apiService.delete(`/patients/${id}`);
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('delete', 'patients', { id });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('delete', 'patients', { id });
    }
  }

  // Sample CRUD operations
  async createSample(data: any): Promise<void> {
    // Store locally immediately
    const localId = `temp-${Date.now()}`;
    const sampleData = { ...data, id: localId, _isLocal: true };
    await dbManager.put('samples', sampleData);

    if (this.isOnline) {
      try {
        const response: any = await apiService.post('/samples', data);
        // Update with server ID
        await dbManager.put('samples', { ...response, _isLocal: false });
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('create', 'samples', data);
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('create', 'samples', data);
    }
  }

  async updateSample(id: string, data: any): Promise<void> {
    // Update locally immediately
    await dbManager.put('samples', { ...data, id });

    if (this.isOnline) {
      try {
        await apiService.put(`/samples/${id}`, data);
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('update', 'samples', { ...data, id });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('update', 'samples', { ...data, id });
    }
  }

  async deleteSample(id: string): Promise<void> {
    // Delete locally immediately
    await dbManager.delete('samples', id);

    if (this.isOnline) {
      try {
        await apiService.delete(`/samples/${id}`);
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('delete', 'samples', { id });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('delete', 'samples', { id });
    }
  }

  // Similar methods for patients and samples...
  // (Implementation would follow the same pattern)
}

export const syncManager = new SyncManager();