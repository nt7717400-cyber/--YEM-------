'use client';

/**
 * SVGInspectionViewer Component
 * Interactive SVG viewer for vehicle inspection
 * Requirements: 2.1, 2.2, 2.4
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SVGInspectionViewerProps, PartKey } from '@/types/vds';
import { getSVGPath, getConditionColor, getPartLabel, PART_LABELS } from '@/constants/vds';

/**
 * SVGInspectionViewer - Interactive SVG viewer for car inspection
 * Loads SVG templates and applies colors based on part status
 */
export function SVGInspectionViewer({
  templateType,
  viewAngle,
  partsStatus,
  onPartClick,
  onPartHover,
  readOnly = false,
  language = 'ar',
  className,
}: SVGInspectionViewerProps) {
  const [svgContent, setSvgContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = React.useState<PartKey | null>(null);

  // Load SVG content when template or angle changes
  React.useEffect(() => {
    const loadSVG = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const svgPath = getSVGPath(templateType, viewAngle);
        const response = await fetch(svgPath);
        
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.status}`);
        }
        
        const text = await response.text();
        setSvgContent(text);
      } catch (err) {
        console.error('Error loading SVG:', err);
        setError(language === 'ar' ? 'فشل تحميل الرسم' : 'Failed to load diagram');
      } finally {
        setLoading(false);
      }
    };

    loadSVG();
  }, [templateType, viewAngle, language]);

  // Process SVG and add colors
  const processedSvg = React.useMemo(() => {
    if (!svgContent) return null;
    
    let processed = svgContent;
    
    // Update fill colors for each part based on status
    Object.keys(PART_LABELS).forEach((partKey) => {
      const partData = partsStatus[partKey as PartKey];
      const condition = partData?.condition || 'not_inspected';
      // Pass partKey to get wheel-specific colors
      const color = getConditionColor(condition, partKey);
      
      // Replace fill color for this part ID
      const idRegex = new RegExp(`(id="${partKey}"[^>]*fill=")([^"]*)(")`, 'g');
      processed = processed.replace(idRegex, `$1${color}$3`);
    });
    
    return processed;
  }, [svgContent, partsStatus]);

  // Handle click on SVG container (works for both mouse and touch)
  const handleSvgClick = React.useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    // Get the target element
    let clientX: number, clientY: number;
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const target = e.target as Element;
    let element: Element | null = target;
    const container = e.currentTarget;
    
    // Walk up the DOM to find a body-part element
    while (element && element !== container) {
      if (element.classList?.contains('body-part')) {
        const partId = element.getAttribute('id') as PartKey;
        if (partId && PART_LABELS[partId]) {
          console.log('[SVGViewer] Clicked part:', partId);
          e.preventDefault();
          e.stopPropagation();
          if (onPartClick) {
            onPartClick(partId);
          }
          return;
        }
      }
      element = element.parentElement;
    }
  }, [readOnly, onPartClick]);

  // Handle mouse move for hover detection
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    let element: Element | null = target;
    const container = e.currentTarget;
    
    // Walk up the DOM to find a body-part element
    while (element && element !== container) {
      if (element.classList?.contains('body-part')) {
        const partId = element.getAttribute('id') as PartKey;
        if (partId && PART_LABELS[partId]) {
          if (hoveredPart !== partId) {
            setHoveredPart(partId);
            if (onPartHover) {
              onPartHover(partId);
            }
          }
          return;
        }
      }
      element = element.parentElement;
    }
    
    // No part found under cursor
    if (hoveredPart) {
      setHoveredPart(null);
      if (onPartHover) {
        onPartHover(null);
      }
    }
  }, [hoveredPart, onPartHover]);

  // Handle mouse leave
  const handleMouseLeave = React.useCallback(() => {
    if (hoveredPart) {
      setHoveredPart(null);
      if (onPartHover) {
        onPartHover(null);
      }
    }
  }, [hoveredPart, onPartHover]);

  // Render loading state
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg', className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-full min-h-[300px] bg-red-50 rounded-lg', className)}>
        <div className="flex flex-col items-center gap-2 text-red-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* SVG Container with event delegation - touch optimized */}
      <div
        className="w-full h-full svg-inspection-viewer touch-manipulation"
        onClick={handleSvgClick}
        onTouchEnd={handleSvgClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
        dangerouslySetInnerHTML={{ __html: processedSvg || '' }}
      />

      {/* Tooltip for hovered part - hidden on touch devices */}
      {hoveredPart && (
        <div className="absolute top-2 left-2 bg-black/80 text-white px-3 py-1.5 rounded-md text-sm pointer-events-none z-10 hidden sm:block">
          {getPartLabel(hoveredPart, language)}
        </div>
      )}

      {/* Styles for SVG interaction */}
      <style jsx global>{`
        .svg-inspection-viewer svg {
          width: 100%;
          height: 100%;
          max-height: 100%;
        }
        .svg-inspection-viewer .body-part {
          transition: all 0.2s ease;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .svg-inspection-viewer .body-part:hover {
          stroke: #1f2937;
          stroke-width: 2.5;
          filter: brightness(1.1);
        }
        @media (hover: none) {
          .svg-inspection-viewer .body-part:active {
            stroke: #1f2937;
            stroke-width: 3;
            filter: brightness(1.15);
          }
        }
      `}</style>
    </div>
  );
}

export default SVGInspectionViewer;
