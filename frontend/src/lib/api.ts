import {
  Car,
  CarImage,
  CarVideo,
  CarFilters,
  CreateCarInput,
  UpdateCarInput,
  ShowroomSettings,
  UpdateSettingsInput,
  DashboardStats,
  LoginCredentials,
  AuthResponse,
  ApiResponse,
  Banner,
  BannerFilters,
  BannerPosition,
  Auction,
  AuctionFilters,
  AuctionStatus,
  Bid,
  PlaceBidInput,
  UpdateAuctionInput,
} from '@/types';
import type { SaveInspectionRequest, CarInspection } from '@/types/inspection';
import type { CreateBannerInput, UpdateBannerInput } from '@/types/banner';
import type {
  VDSTemplate,
  VDSTemplateDetail,
  CreateTemplateInput,
  UpdateTemplateInput,
  VDSPartKey,
  CreatePartKeyInput,
  UpdatePartKeyInput,
  VDSColorMapping,
  UpdateColorMappingInput,
} from '@/types/vds';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function to get full image URL
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-car.svg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) {
    // Remove /api suffix from API_BASE_URL for uploads
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${path}`;
  }
  return path;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'حدث خطأ في الاتصال بالخادم',
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }


  // ==================== Authentication ====================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' }, true);
    } finally {
      this.setToken(null);
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.request<ApiResponse<{ valid: boolean }>>(
        '/auth/verify',
        { method: 'GET' },
        true
      );
      return response.data?.valid ?? false;
    } catch {
      return false;
    }
  }

  // ==================== Cars ====================

  async getAllCars(filters?: CarFilters): Promise<Car[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    // Fetch more cars per page to ensure all cars are loaded
    if (!params.has('perPage')) {
      params.append('perPage', '100');
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request<ApiResponse<Car[]>>(`/cars${query}`);
    return response.data ?? [];
  }

  async getCarById(id: number): Promise<Car | null> {
    try {
      const response = await this.request<ApiResponse<Car>>(`/cars/${id}`);
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async getFeaturedCars(): Promise<Car[]> {
    return this.getAllCars({ featured: true, status: 'AVAILABLE' });
  }

  async createCar(data: CreateCarInput): Promise<Car> {
    const response = await this.request<ApiResponse<Car>>(
      '/cars',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  async updateCar(id: number, data: UpdateCarInput): Promise<Car> {
    const response = await this.request<ApiResponse<Car>>(
      `/cars/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  async deleteCar(id: number): Promise<void> {
    await this.request(`/cars/${id}`, { method: 'DELETE' }, true);
  }

  async archiveCar(id: number): Promise<Car> {
    const response = await this.request<ApiResponse<Car>>(
      `/cars/${id}/archive`,
      { method: 'PUT' },
      true
    );
    return response.data!;
  }

  async restoreCar(id: number): Promise<Car> {
    const response = await this.request<ApiResponse<Car>>(
      `/cars/${id}/restore`,
      { method: 'PUT' },
      true
    );
    return response.data!;
  }

  async duplicateCar(id: number): Promise<Car> {
    const response = await this.request<ApiResponse<Car>>(
      `/cars/${id}/duplicate`,
      { method: 'POST' },
      true
    );
    return response.data!;
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.request(`/cars/${id}/view`, { method: 'PUT' });
  }

  async toggleFeatured(id: number): Promise<Car> {
    const response = await this.request<ApiResponse<Car>>(
      `/cars/${id}/featured`,
      { method: 'PUT' },
      true
    );
    return response.data!;
  }

  async getArchivedCars(): Promise<Car[]> {
    return this.getAllCars({ status: 'SOLD' });
  }

  async getBrands(): Promise<string[]> {
    const response = await this.request<ApiResponse<string[]>>('/brands');
    return response.data ?? [];
  }


  // ==================== Images ====================

  async uploadImages(carId: number, files: File[]): Promise<CarImage[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images[]', file);
    });

    const url = `${API_BASE_URL}/cars/${carId}/images`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'فشل رفع الصور',
      }));
      throw new Error(error.message);
    }

    const result: ApiResponse<CarImage[]> = await response.json();
    return result.data ?? [];
  }

  async deleteImage(carId: number, imageId: number): Promise<void> {
    await this.request(`/cars/${carId}/images/${imageId}`, { method: 'DELETE' }, true);
  }

  async reorderImages(carId: number, imageIds: number[]): Promise<void> {
    await this.request(
      `/cars/${carId}/images/reorder`,
      {
        method: 'PUT',
        body: JSON.stringify({ imageIds }),
      },
      true
    );
  }

  // ==================== Videos ====================

  async addYoutubeVideo(carId: number, url: string): Promise<CarVideo> {
    const response = await this.request<ApiResponse<CarVideo>>(
      `/cars/${carId}/video`,
      {
        method: 'POST',
        body: JSON.stringify({ type: 'YOUTUBE', url }),
      },
      true
    );
    return response.data!;
  }

  async uploadVideo(carId: number, file: File): Promise<CarVideo> {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('type', 'UPLOAD');

    const url = `${API_BASE_URL}/cars/${carId}/video`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'فشل رفع الفيديو',
      }));
      throw new Error(error.message);
    }

    const result: ApiResponse<CarVideo> = await response.json();
    return result.data!;
  }

  async deleteVideo(videoId: number): Promise<void> {
    await this.request(`/videos/${videoId}`, { method: 'DELETE' }, true);
  }

  // ==================== Settings ====================

  async getSettings(): Promise<ShowroomSettings> {
    const response = await this.request<ApiResponse<ShowroomSettings>>('/settings');
    return response.data!;
  }

  async updateSettings(data: UpdateSettingsInput): Promise<ShowroomSettings> {
    const response = await this.request<ApiResponse<ShowroomSettings>>(
      '/settings',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  // ==================== Statistics ====================

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.request<ApiResponse<DashboardStats>>(
      '/stats',
      { method: 'GET' },
      true
    );
    return response.data!;
  }

  // ==================== Inspection ====================

  async getInspection(carId: number): Promise<CarInspection | null> {
    try {
      const response = await this.request<ApiResponse<CarInspection>>(
        `/cars/${carId}/inspection`,
        { method: 'GET' },
        true
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async saveInspection(carId: number, data: SaveInspectionRequest): Promise<CarInspection> {
    // Convert bodyParts array to object format expected by backend
    const bodyPartsObject: Record<string, string> = {};
    if (data.bodyParts && Array.isArray(data.bodyParts)) {
      data.bodyParts.forEach((part) => {
        bodyPartsObject[part.partId] = part.status;
      });
    }

    // Format data for backend API
    // Note: damageDetails is sent as object, not JSON string - the backend handles JSON encoding
    const formattedData = {
      bodyType: data.bodyType,
      bodyParts: bodyPartsObject,
      mechanical: {
        engine: data.engine,
        transmission: data.transmission,
        chassis: data.chassis,
        tires: data.tires || null,
        technicalNotes: data.technicalNotes || '',
      },
      damageDetails: data.damageDetails || null,
    };

    console.log('[API] Saving inspection with damageDetails:', data.damageDetails);
    console.log('[API] Saving inspection with tires:', data.tires);

    const response = await this.request<ApiResponse<CarInspection>>(
      `/cars/${carId}/inspection`,
      {
        method: 'POST',
        body: JSON.stringify(formattedData),
      },
      true
    );
    return response.data!;
  }

  async updateInspection(carId: number, data: SaveInspectionRequest): Promise<CarInspection> {
    // Convert bodyParts array to object format expected by backend
    const bodyPartsObject: Record<string, string> = {};
    if (data.bodyParts && Array.isArray(data.bodyParts)) {
      data.bodyParts.forEach((part) => {
        bodyPartsObject[part.partId] = part.status;
      });
    }

    // Format data for backend API
    const formattedData = {
      bodyType: data.bodyType,
      bodyParts: bodyPartsObject,
      mechanical: {
        engine: data.engine,
        transmission: data.transmission,
        chassis: data.chassis,
        technicalNotes: data.technicalNotes || '',
      },
    };

    const response = await this.request<ApiResponse<CarInspection>>(
      `/cars/${carId}/inspection`,
      {
        method: 'PUT',
        body: JSON.stringify(formattedData),
      },
      true
    );
    return response.data!;
  }

  // ==================== Banners ====================

  async getAllBanners(filters?: BannerFilters): Promise<Banner[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.position) {
        params.append('position', filters.position);
      }
      if (filters.isActive !== undefined) {
        params.append('is_active', filters.isActive ? '1' : '0');
      }
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request<ApiResponse<Banner[]>>(`/banners${query}`, {}, true);
    return response.data ?? [];
  }

  async getBannersByPosition(position: BannerPosition): Promise<Banner[]> {
    const response = await this.request<ApiResponse<Banner[]>>(`/banners/position/${position}`);
    return response.data ?? [];
  }

  async getBannerById(id: number): Promise<Banner | null> {
    try {
      const response = await this.request<ApiResponse<Banner>>(`/banners/${id}`);
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async createBanner(data: CreateBannerInput): Promise<Banner> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('image', data.image);
    formData.append('position', data.position);

    if (data.imageMobile) {
      formData.append('image_mobile', data.imageMobile);
    }
    if (data.linkUrl) {
      formData.append('link_url', data.linkUrl);
    }
    if (data.linkTarget) {
      formData.append('link_target', data.linkTarget);
    }
    if (data.displayOrder !== undefined) {
      formData.append('display_order', String(data.displayOrder));
    }
    if (data.isActive !== undefined) {
      formData.append('is_active', data.isActive ? '1' : '0');
    }
    if (data.startDate) {
      formData.append('start_date', data.startDate);
    }
    if (data.endDate) {
      formData.append('end_date', data.endDate);
    }

    const url = `${API_BASE_URL}/banners`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'فشل إنشاء البانر',
      }));
      throw new Error(error.message || error.error?.message);
    }

    const result: ApiResponse<Banner> = await response.json();
    return result.data!;
  }

  async updateBanner(id: number, data: UpdateBannerInput): Promise<Banner> {
    const formData = new FormData();

    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.imageMobile) {
      formData.append('image_mobile', data.imageMobile);
    }
    if (data.linkUrl !== undefined) {
      formData.append('link_url', data.linkUrl);
    }
    if (data.linkTarget) {
      formData.append('link_target', data.linkTarget);
    }
    if (data.position) {
      formData.append('position', data.position);
    }
    if (data.displayOrder !== undefined) {
      formData.append('display_order', String(data.displayOrder));
    }
    if (data.isActive !== undefined) {
      formData.append('is_active', data.isActive ? '1' : '0');
    }
    if (data.startDate !== undefined) {
      formData.append('start_date', data.startDate || '');
    }
    if (data.endDate !== undefined) {
      formData.append('end_date', data.endDate || '');
    }

    const url = `${API_BASE_URL}/banners/${id}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'فشل تحديث البانر',
      }));
      throw new Error(error.message || error.error?.message);
    }

    const result: ApiResponse<Banner> = await response.json();
    return result.data!;
  }

  async deleteBanner(id: number): Promise<void> {
    await this.request(`/banners/${id}`, { method: 'DELETE' }, true);
  }

  async toggleBannerActive(id: number): Promise<Banner> {
    const response = await this.request<ApiResponse<Banner>>(
      `/banners/${id}/toggle`,
      { method: 'PUT' },
      true
    );
    return response.data!;
  }

  async trackBannerClick(id: number): Promise<void> {
    await this.request(`/banners/${id}/click`, { method: 'POST' });
  }

  async trackBannerView(id: number): Promise<void> {
    await this.request(`/banners/${id}/view`, { method: 'POST' });
  }

  // ==================== Auctions ====================

  async getAllAuctions(filters?: AuctionFilters): Promise<Auction[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.carId !== undefined) {
        params.append('car_id', String(filters.carId));
      }
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request<ApiResponse<Auction[]>>(`/auctions${query}`);
    return response.data ?? [];
  }

  async getAuctionById(id: number): Promise<Auction | null> {
    try {
      // Include auth token to get full phone numbers for admin
      const response = await this.request<ApiResponse<Auction>>(`/auctions/${id}`, {}, true);
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async getAuctionBids(auctionId: number): Promise<Bid[]> {
    try {
      const response = await this.request<ApiResponse<Bid[]>>(`/auctions/${auctionId}/bids`);
      return response.data ?? [];
    } catch {
      return [];
    }
  }

  async deleteBid(auctionId: number, bidId: number): Promise<void> {
    await this.request(`/auctions/${auctionId}/bids/${bidId}`, { method: 'DELETE' }, true);
  }

  async placeBid(auctionId: number, data: PlaceBidInput): Promise<Bid> {
    const response = await this.request<ApiResponse<Bid>>(
      `/auctions/${auctionId}/bids`,
      {
        method: 'POST',
        body: JSON.stringify({
          bidderName: data.bidderName,
          phoneNumber: data.phoneNumber,
          amount: data.amount,
        }),
      }
    );
    return response.data!;
  }

  async updateAuction(id: number, data: UpdateAuctionInput): Promise<Auction> {
    const payload: Record<string, unknown> = {};
    if (data.endTime !== undefined) {
      payload.end_time = data.endTime;
    }
    if (data.status !== undefined) {
      payload.status = data.status;
    }
    if (data.minIncrement !== undefined) {
      payload.min_increment = data.minIncrement;
    }

    const response = await this.request<ApiResponse<Auction>>(
      `/auctions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true
    );
    return response.data!;
  }

  async cancelAuction(id: number): Promise<void> {
    await this.request(`/auctions/${id}`, { method: 'DELETE' }, true);
  }

  async endAuctionEarly(id: number): Promise<Auction> {
    const response = await this.request<ApiResponse<Auction>>(
      `/auctions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status: 'ENDED' as AuctionStatus }),
      },
      true
    );
    return response.data!;
  }

  async extendAuctionTime(id: number, newEndTime: string): Promise<Auction> {
    const response = await this.request<ApiResponse<Auction>>(
      `/auctions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ end_time: newEndTime }),
      },
      true
    );
    return response.data!;
  }

  // ==================== VDS Templates ====================

  async getAllTemplates(filters?: { active?: boolean; type?: string }): Promise<VDSTemplate[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.active !== undefined) {
        params.append('active', filters.active ? '1' : '0');
      }
      if (filters.type) {
        params.append('type', filters.type);
      }
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request<ApiResponse<VDSTemplate[]>>(`/templates${query}`, {}, true);
    return response.data ?? [];
  }

  async getTemplateById(id: number): Promise<VDSTemplateDetail | null> {
    try {
      const response = await this.request<ApiResponse<VDSTemplateDetail>>(`/templates/${id}`, {}, true);
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async createTemplate(data: CreateTemplateInput): Promise<VDSTemplateDetail> {
    const response = await this.request<ApiResponse<VDSTemplateDetail>>(
      '/templates',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  async updateTemplate(id: number, data: UpdateTemplateInput): Promise<VDSTemplateDetail> {
    const response = await this.request<ApiResponse<VDSTemplateDetail>>(
      `/templates/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  async deleteTemplate(id: number): Promise<void> {
    await this.request(`/templates/${id}`, { method: 'DELETE' }, true);
  }

  // ==================== VDS Part Keys ====================

  async getAllPartKeys(filters?: { active?: boolean; category?: string; grouped?: boolean }): Promise<VDSPartKey[] | Record<string, VDSPartKey[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.active !== undefined) {
        params.append('active', filters.active ? '1' : '0');
      }
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.grouped) {
        params.append('grouped', '1');
      }
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request<ApiResponse<VDSPartKey[] | Record<string, VDSPartKey[]>>>(`/part-keys${query}`, {}, true);
    return response.data ?? [];
  }

  async getPartKeyByKey(key: string): Promise<VDSPartKey | null> {
    try {
      const response = await this.request<ApiResponse<VDSPartKey>>(`/part-keys/${key}`, {}, true);
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async createPartKey(data: CreatePartKeyInput): Promise<VDSPartKey> {
    const response = await this.request<ApiResponse<VDSPartKey>>(
      '/part-keys',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  async updatePartKey(key: string, data: UpdatePartKeyInput): Promise<VDSPartKey> {
    const response = await this.request<ApiResponse<VDSPartKey>>(
      `/part-keys/${key}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  async deletePartKey(key: string): Promise<void> {
    await this.request(`/part-keys/${key}`, { method: 'DELETE' }, true);
  }

  // ==================== VDS Color Mappings ====================

  async getAllColorMappings(): Promise<VDSColorMapping[]> {
    const response = await this.request<ApiResponse<VDSColorMapping[]>>('/color-mappings', {}, true);
    return response.data ?? [];
  }

  async updateColorMappings(data: UpdateColorMappingInput[]): Promise<VDSColorMapping[]> {
    const response = await this.request<ApiResponse<VDSColorMapping[]>>(
      '/color-mappings',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data ?? [];
  }

  async updateSingleColorMapping(condition: string, data: Partial<UpdateColorMappingInput>): Promise<VDSColorMapping> {
    const response = await this.request<ApiResponse<VDSColorMapping>>(
      `/color-mappings/${condition}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
    return response.data!;
  }

  async resetColorMappings(): Promise<VDSColorMapping[]> {
    const response = await this.request<ApiResponse<VDSColorMapping[]>>(
      '/color-mappings/reset',
      { method: 'POST' },
      true
    );
    return response.data ?? [];
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
