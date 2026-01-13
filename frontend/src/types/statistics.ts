import { Car } from './car';

export interface DashboardStats {
  totalCars: number;
  totalCarsChange?: number;
  availableCars: number;
  soldCars: number;
  soldCarsChange?: number;
  totalViews: number;
  totalViewsChange?: number;
  totalInquiries?: number;
  totalInquiriesChange?: number;
  mostViewedCars: Car[];
}

export interface ViewsChartData {
  date: string;
  views: number;
}

export interface RecentActivity {
  id: string;
  type: 'car_added' | 'car_sold' | 'inquiry' | 'view' | 'auction_bid' | 'banner_click';
  message: string;
  timestamp: string;
  carId?: number;
  carName?: string;
}
