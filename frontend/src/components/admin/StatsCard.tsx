'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface StatsCardProps {
  /** Title of the statistic */
  title: string;
  /** Current value to display */
  value: number | string;
  /** Change value (positive = increase, negative = decrease, 0 = no change) */
  change?: number;
  /** Change period description (e.g., "من الشهر الماضي") */
  changePeriod?: string;
  /** Icon to display */
  icon?: LucideIcon;
  /** Color variant for the value */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Whether the card is in loading state */
  isLoading?: boolean;
  /** Format the value (e.g., for currency or large numbers) */
  formatValue?: (value: number | string) => string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================
// Helper Functions (exported for testing)
// ============================================

/**
 * Determines the trend direction based on change value
 */
export function getTrendDirection(change: number): 'up' | 'down' | 'neutral' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

/**
 * Gets the appropriate icon for the trend direction
 */
export function getTrendIcon(direction: 'up' | 'down' | 'neutral'): LucideIcon {
  switch (direction) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return Minus;
  }
}

/**
 * Gets the CSS classes for the trend indicator based on direction
 */
export function getTrendColorClass(direction: 'up' | 'down' | 'neutral'): string {
  switch (direction) {
    case 'up':
      return 'text-green-600 bg-green-50';
    case 'down':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Formats the change value for display
 */
export function formatChangeValue(change: number): string {
  const absChange = Math.abs(change);
  const sign = change > 0 ? '+' : change < 0 ? '-' : '';
  return `${sign}${absChange}%`;
}

/**
 * Gets the CSS classes for the value based on variant
 */
export function getValueColorClass(variant: StatsCardProps['variant']): string {
  switch (variant) {
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'danger':
      return 'text-red-600';
    case 'info':
      return 'text-blue-600';
    default:
      return 'text-foreground';
  }
}

// ============================================
// Trend Indicator Component
// ============================================

interface TrendIndicatorProps {
  change: number;
  period?: string;
}

function TrendIndicator({ change, period }: TrendIndicatorProps) {
  const direction = getTrendDirection(change);
  const TrendIconComponent = getTrendIcon(direction);
  const colorClass = getTrendColorClass(direction);
  const formattedChange = formatChangeValue(change);

  return (
    <div className="flex items-center gap-2 mt-2">
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          colorClass
        )}
        data-testid="trend-indicator"
        data-trend={direction}
      >
        <TrendIconComponent className="h-3 w-3" aria-hidden="true" />
        <span>{formattedChange}</span>
      </span>
      {period && (
        <span className="text-xs text-muted-foreground">{period}</span>
      )}
    </div>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function StatsCard({
  title,
  value,
  change,
  changePeriod,
  icon: Icon,
  variant = 'default',
  isLoading = false,
  formatValue,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  const displayValue = formatValue ? formatValue(value) : value;
  const valueColorClass = getValueColorClass(variant);

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <div className="p-2 bg-muted rounded-full">
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold', valueColorClass)}>
          {displayValue}
        </div>
        {change !== undefined && (
          <TrendIndicator change={change} period={changePeriod} />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Export
// ============================================

export default StatsCard;
