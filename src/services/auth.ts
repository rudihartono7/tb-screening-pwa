import { apiService } from './api';
import { LoginRequest, LoginResponse, UserDto } from '@/types/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    if (response.token) {
      apiService.setAuthToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    
    return response;
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    // Clear the API service token as well
    const { apiService } = await import('./api');
    apiService.setAuthToken('');
  }

  async getCurrentUser(): Promise<UserDto | null> {
    try {
      const response = await apiService.get<UserDto>('/api/auth/me');
      return response;
    } catch (error) {
      return null;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await apiService.post<{ valid: boolean }>('/api/auth/validate');
      return response.valid;
    } catch (error) {
      return false;
    }
  }

  getStoredUser(): UserDto | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();
export default authService;