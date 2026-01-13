'use client';

import { useMemo } from 'react';
import { Car } from '@/types';

/**
 * CarSpecs Component - Requirements: 3.4
 * 
 * Features:
 * - Displays car specifications in organized sections with icons
 * - Parses specifications text and displays them in a structured way
 * - Supports RTL layout for Arabic content
 */

// Specification item interface
export interface SpecificationItem {
  key: string;
  label: string;
  value: string;
  icon?: string;
  category?: string;
}

// Specification section interface
export interface SpecificationSection {
  title: string;
  icon: React.ReactNode;
  items: SpecificationItem[];
}

interface CarSpecsProps {
  car: Car;
  className?: string;
}

// Icon components for different specification categories
function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}

function GaugeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpeedometerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

/**
 * Parse specifications text into structured items
 * Supports multiple formats:
 * - "key: value" format
 * - "key - value" format
 * - Plain text lines
 */
export function parseSpecifications(specsText: string): SpecificationItem[] {
  if (!specsText || specsText.trim() === '') {
    return [];
  }

  const lines = specsText.split('\n').filter(line => line.trim() !== '');
  const items: SpecificationItem[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Try to parse "key: value" format
    const colonMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/);
    if (colonMatch) {
      items.push({
        key: `spec-${index}`,
        label: colonMatch[1].trim(),
        value: colonMatch[2].trim(),
      });
      return;
    }

    // Try to parse "key - value" format
    const dashMatch = trimmedLine.match(/^([^-]+)\s*-\s*(.+)$/);
    if (dashMatch) {
      items.push({
        key: `spec-${index}`,
        label: dashMatch[1].trim(),
        value: dashMatch[2].trim(),
      });
      return;
    }

    // Plain text line - use as both label and value
    if (trimmedLine.length > 0) {
      items.push({
        key: `spec-${index}`,
        label: trimmedLine,
        value: '',
      });
    }
  });

  return items;
}

/**
 * Get icon for a specification based on its label
 */
export function getSpecIcon(label: string): React.ReactNode {
  const lowerLabel = label.toLowerCase();
  const iconClass = "w-5 h-5 text-primary";

  // Brand/Model related
  if (lowerLabel.includes('ماركة') || lowerLabel.includes('brand') || lowerLabel.includes('الماركة')) {
    return <TagIcon className={iconClass} />;
  }
  
  // Model related
  if (lowerLabel.includes('موديل') || lowerLabel.includes('model') || lowerLabel.includes('الموديل')) {
    return <CarIcon className={iconClass} />;
  }
  
  // Year related
  if (lowerLabel.includes('سنة') || lowerLabel.includes('year') || lowerLabel.includes('الصنع')) {
    return <CalendarIcon className={iconClass} />;
  }
  
  // Kilometers/Mileage related
  if (lowerLabel.includes('كيلو') || lowerLabel.includes('km') || lowerLabel.includes('mileage') || lowerLabel.includes('المسافة')) {
    return <GaugeIcon className={iconClass} />;
  }
  
  // Origin related
  if (lowerLabel.includes('وارد') || lowerLabel.includes('origin') || lowerLabel.includes('المنشأ')) {
    return <GlobeIcon className={iconClass} />;
  }
  
  // Condition related
  if (lowerLabel.includes('حالة') || lowerLabel.includes('condition') || lowerLabel.includes('الحالة')) {
    return <CheckCircleIcon className={iconClass} />;
  }
  
  // Engine/Power related
  if (lowerLabel.includes('محرك') || lowerLabel.includes('engine') || lowerLabel.includes('قوة') || lowerLabel.includes('power')) {
    return <SpeedometerIcon className={iconClass} />;
  }

  // Default icon
  return <ListIcon className={iconClass} />;
}

/**
 * Build basic specifications from car data
 */
export function buildBasicSpecs(car: Car): SpecificationItem[] {
  const specs: SpecificationItem[] = [];

  // Brand
  if (car.brand) {
    specs.push({
      key: 'brand',
      label: 'الماركة',
      value: car.brand,
      icon: 'tag',
    });
  }

  // Model
  if (car.model) {
    specs.push({
      key: 'model',
      label: 'الموديل',
      value: car.model,
      icon: 'car',
    });
  }

  // Year
  if (car.year) {
    specs.push({
      key: 'year',
      label: 'سنة الصنع',
      value: car.year.toString(),
      icon: 'calendar',
    });
  }

  // Condition
  specs.push({
    key: 'condition',
    label: 'الحالة',
    value: car.condition === 'NEW' ? 'جديدة' : 'مستعملة',
    icon: 'check',
  });

  // Origin
  if (car.origin) {
    specs.push({
      key: 'origin',
      label: 'الوارد',
      value: `وارد ${car.origin}`,
      icon: 'globe',
    });
  }

  // Kilometers (for used cars)
  if (car.condition === 'USED' && car.kilometers !== undefined) {
    specs.push({
      key: 'kilometers',
      label: 'الكيلومترات',
      value: `${new Intl.NumberFormat('ar-YE').format(car.kilometers)} كم`,
      icon: 'gauge',
    });
  }

  return specs;
}

/**
 * CarSpecs Component
 * Displays car specifications in organized sections with icons
 */
export function CarSpecs({ car, className = '' }: CarSpecsProps) {
  // Build basic specs from car data
  const basicSpecs = useMemo(() => buildBasicSpecs(car), [car]);
  
  // Parse additional specifications from text
  const additionalSpecs = useMemo(() => {
    return parseSpecifications(car.specifications || '');
  }, [car.specifications]);

  // Check if we have any specifications to display
  const hasSpecs = basicSpecs.length > 0 || additionalSpecs.length > 0;

  if (!hasSpecs) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="car-specs">
      {/* Basic Specifications Section */}
      {basicSpecs.length > 0 && (
        <div data-testid="basic-specs-section">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-primary" />
            المواصفات الأساسية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {basicSpecs.map((spec) => (
              <SpecItem key={spec.key} spec={spec} />
            ))}
          </div>
        </div>
      )}

      {/* Additional Specifications Section */}
      {additionalSpecs.length > 0 && (
        <div data-testid="additional-specs-section">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ListIcon className="w-5 h-5 text-primary" />
            مواصفات إضافية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {additionalSpecs.map((spec) => (
              <SpecItem key={spec.key} spec={spec} showValue={spec.value !== ''} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual specification item component
 */
interface SpecItemProps {
  spec: SpecificationItem;
  showValue?: boolean;
}

function SpecItem({ spec, showValue = true }: SpecItemProps) {
  const icon = getSpecIcon(spec.label);

  return (
    <div 
      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      data-testid="spec-item"
      data-spec-key={spec.key}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p 
          className="text-sm text-muted-foreground"
          data-testid="spec-label"
        >
          {spec.label}
        </p>
        {showValue && spec.value && (
          <p 
            className="font-medium text-foreground"
            data-testid="spec-value"
          >
            {spec.value}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * CarSpecsSkeleton - Loading placeholder for CarSpecs
 */
export function CarSpecsSkeleton() {
  return (
    <div className="space-y-6" data-testid="car-specs-skeleton">
      <div>
        <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CarSpecs;
