'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout, StatsCard } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { DashboardStats, ViewsChartData, RecentActivity } from '@/types';
import Link from 'next/link';
import {
  Car,
  Eye,
  ShoppingCart,
  TrendingUp,
  Plus,
  Settings,
  Image,
  Gavel,
  Clock,
  Activity,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

// ============================================
// Chart Component (Simple SVG-based)
// ============================================

interface ViewsChartProps {
  data: ViewsChartData[];
  isLoading?: boolean;
}

function ViewsChart({ data, isLoading }: ViewsChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Skeleton variant="rectangular" className="w-full h-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد بيانات للعرض</p>
        </div>
      </div>
    );
  }

  const maxViews = Math.max(...data.map(d => d.views), 1);
  const chartHeight = 200;

  return (
    <div className="h-64 p-4" data-testid="views-chart">
      <div className="relative h-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxViews.toLocaleString('ar-EG')}</span>
          <span>{Math.round(maxViews / 2).toLocaleString('ar-EG')}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="mr-14 h-full pb-8">
          <svg
            viewBox={`0 0 ${data.length * 40} ${chartHeight}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line x1="0" y1="0" x2={data.length * 40} y2="0" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1={chartHeight / 2} x2={data.length * 40} y2={chartHeight / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1={chartHeight} x2={data.length * 40} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Bars */}
            {data.map((item, index) => {
              const barHeight = (item.views / maxViews) * chartHeight;
              const x = index * 40 + 2;
              const y = chartHeight - barHeight;
              
              return (
                <rect
                  key={item.date}
                  x={x}
                  y={y}
                  width={36}
                  height={barHeight}
                  fill="hsl(var(--primary))"
                  rx="4"
                  className="transition-all duration-300 hover:opacity-80"
                >
                  <title>{`${item.date}: ${item.views.toLocaleString('ar-EG')} مشاهدة`}</title>
                </rect>
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {data.slice(0, 7).map((item) => (
              <span key={item.date} className="text-center">
                {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Activity Feed Component
// ============================================

interface ActivityFeedProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'car_added':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'car_sold':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'inquiry':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circular" className="h-8 w-8" />
            <div className="flex-1">
              <Skeleton variant="text" className="h-4 w-3/4 mb-1" />
              <Skeleton variant="text" className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>لا توجد أنشطة حديثة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="activity-feed">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="p-2 rounded-full bg-muted">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{activity.message}</p>
            <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


// ============================================
// Quick Actions Component
// ============================================

function QuickActions() {
  const actions = [
    { label: 'إضافة سيارة', href: '/admin/cars/new', icon: Plus, color: 'bg-green-500' },
    { label: 'إدارة السيارات', href: '/admin/cars', icon: Car, color: 'bg-blue-500' },
    { label: 'إدارة البانرات', href: '/admin/banners', icon: Image, color: 'bg-purple-500' },
    { label: 'المزادات', href: '/admin/auctions', icon: Gavel, color: 'bg-orange-500' },
    { label: 'الإعدادات', href: '/admin/settings', icon: Settings, color: 'bg-gray-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" data-testid="quick-actions">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className={`p-3 rounded-full ${action.color} text-white`}>
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-center">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}

// ============================================
// Stats Skeleton Component
// ============================================

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-20" />
                <Skeleton variant="text" className="h-8 w-16" />
                <Skeleton variant="text" className="h-3 w-24" />
              </div>
              <Skeleton variant="circular" className="h-12 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Main Dashboard Page
// ============================================

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ViewsChartData[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await api.getDashboardStats();
      setStats(data);

      // Generate mock chart data (last 7 days)
      const mockChartData: ViewsChartData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockChartData.push({
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 100) + 20,
        });
      }
      setChartData(mockChartData);

      // Generate mock activities
      const mockActivities: RecentActivity[] = [
        { id: '1', type: 'car_added', message: 'تمت إضافة سيارة جديدة: تويوتا كامري 2024', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
        { id: '2', type: 'car_sold', message: 'تم بيع: هوندا أكورد 2023', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
        { id: '3', type: 'inquiry', message: 'استفسار جديد عن: نيسان التيما 2024', timestamp: new Date(Date.now() - 5 * 3600000).toISOString() },
        { id: '4', type: 'view', message: '50 مشاهدة جديدة اليوم', timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
        { id: '5', type: 'car_added', message: 'تمت إضافة سيارة جديدة: مرسيدس E-Class 2024', timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
      ];
      setActivities(mockActivities);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك في لوحة تحكم معرض SHAS Motors</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchDashboardData()}>
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {isLoading ? (
          <StatsSkeleton />
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
            <StatsCard
              title="إجمالي السيارات"
              value={stats.totalCars}
              change={stats.totalCarsChange}
              icon={Car}
            />
            <StatsCard
              title="السيارات المباعة"
              value={stats.soldCars}
              change={stats.soldCarsChange}
              icon={ShoppingCart}
              variant="success"
            />
            <StatsCard
              title="إجمالي المشاهدات"
              value={stats.totalViews}
              change={stats.totalViewsChange}
              icon={Eye}
              variant="info"
            />
            <StatsCard
              title="الاستفسارات"
              value={stats.totalInquiries || 0}
              change={stats.totalInquiriesChange}
              icon={TrendingUp}
              variant="warning"
            />
          </div>
        ) : null}


        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Views Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                المشاهدات خلال الأسبوع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ViewsChart data={chartData} isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Most Viewed Cars Table */}
        {stats && stats.mostViewedCars && stats.mostViewedCars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                السيارات الأكثر مشاهدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 font-medium">#</th>
                      <th className="text-right py-3 px-4 font-medium">السيارة</th>
                      <th className="text-right py-3 px-4 font-medium">الماركة</th>
                      <th className="text-right py-3 px-4 font-medium">السعر</th>
                      <th className="text-right py-3 px-4 font-medium">المشاهدات</th>
                      <th className="text-right py-3 px-4 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostViewedCars.map((car, index) => (
                      <tr key={car.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/cars/${car.id}/edit`}
                            className="text-primary hover:underline font-medium"
                          >
                            {car.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4">{car.brand}</td>
                        <td className="py-3 px-4 font-medium">
                          {car.price.toLocaleString('ar-EG')} ر.ي
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {(car.viewCount || 0).toLocaleString('ar-EG')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              car.status === 'AVAILABLE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {car.status === 'AVAILABLE' ? 'متوفرة' : 'مباعة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
