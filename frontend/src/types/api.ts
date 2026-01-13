export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ErrorCodes = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  SESSION_EXPIRED: 'AUTH_002',
  UNAUTHORIZED: 'AUTH_003',
  
  // Car operations
  CAR_NOT_FOUND: 'CAR_001',
  INVALID_CAR_DATA: 'CAR_002',
  
  // Image operations
  IMAGE_UPLOAD_FAILED: 'IMG_001',
  IMAGE_TOO_LARGE: 'IMG_002',
  INVALID_IMAGE_FORMAT: 'IMG_003',
  
  // Video operations
  VIDEO_UPLOAD_FAILED: 'VID_001',
  INVALID_YOUTUBE_URL: 'VID_002',
  
  // General
  VALIDATION_ERROR: 'VAL_001',
  SERVER_ERROR: 'SRV_001',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
