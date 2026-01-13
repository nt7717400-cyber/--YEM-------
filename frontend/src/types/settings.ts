export interface ShowroomSettings {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  workingHours: string;
  mapLatitude?: number;
  mapLongitude?: number;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  workingHours?: string;
  mapLatitude?: number;
  mapLongitude?: number;
}
