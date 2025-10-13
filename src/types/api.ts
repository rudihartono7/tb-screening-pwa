// Base API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

// Family Types
export interface FamilyDto {
  id: string;
  familyIdentityNumber: string;
  familyName: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  patients: PatientDto[];
}

export interface CreateFamilyRequest {
  familyIdentityNumber: string;
  familyName: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateFamilyRequest {
  familyIdentityNumber: string;
  familyName: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

// Patient Types
export interface PatientDto {
  id: string;
  familyId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  nik?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  familyName: string;
  samples: SampleDto[];
}

export interface CreatePatientRequest {
  familyId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  nik?: string;
  phone?: string;
}

export interface UpdatePatientRequest {
  familyId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  nik?: string;
  phone?: string;
}

// Sample Types
export interface SampleDto {
  id: string;
  patientId: string;
  sampleCode: string;
  sampleType: string;
  collectionDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  patientName: string;
  sampleImages: SampleImageDto[];
  analysisResults: AnalysisResultDto[];
}

export interface SampleImageDto {
  id: string;
  sampleId: string;
  filePath: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  createdAt: string;
}

export interface AnalysisResultDto {
  id: string;
  sampleId?: string;
  imageId?: string;
  analysisType: string;
  result: string;
  confidenceScore: number;
  metadata?: string;
  analyzedAt: string;
  createdAt: string;
}

export interface CreateSampleRequest {
  patientId: string;
  sampleCode: string;
  sampleType: string;
  collectionDate: string;
}

export interface UpdateSampleRequest {
  sampleCode: string;
  sampleType: string;
  collectionDate: string;
  status: string;
}

// Dashboard Types
export interface DashboardStats {
  totalFamilies: number;
  totalPatients: number;
  totalSamples: number;
  pendingAnalysis: number;
  positiveResults: number;
  negativeResults: number;
}

export interface GeospatialData {
  familyId: string;
  familyName: string;
  latitude: number;
  longitude: number;
  patientCount: number;
  positiveCount: number;
  negativeCount: number;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  positive: number;
  negative: number;
  pending: number;
}