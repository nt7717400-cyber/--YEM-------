export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}
