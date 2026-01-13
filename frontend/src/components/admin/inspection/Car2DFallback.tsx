'use client';

/**
 * Car2DFallback - قوالب سيارات 2D جاهزة لجميع الأنواع
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { BodyType, BodyPartId, PartStatus } from '@/types/inspection';
import { BODY_PART_LABELS, PART_STATUS_CONFIG } from '@/constants/inspection';

export interface Car2DFallbackProps {
  partsStatus: Record<BodyPartId, PartStatus>;
  onPartClick: (partId: BodyPartId) => void;
  readOnly?: boolean;
  showLabels?: boolean;
  bodyType?: BodyType;
}

// ============ قوالب السيارات حسب النوع ============

type CarTemplate = {
  viewBox: string;
  parts: Record<BodyPartId, string>;
  wheels: { cx: number; cy: number; rx: number; ry: number }[];
  windows: { d: string; opacity: number }[];
  headlights: { cx: number; cy: number; rx: number; ry: number }[];
  taillights: { cx: number; cy: number; rx: number; ry: number }[];
  mirrors: { cx: number; cy: number; rx: number; ry: number }[];
  grille: { x: number; y: number; w: number; h: number };
};

// سيدان
const SEDAN_TEMPLATE: CarTemplate = {
  viewBox: '0 0 300 500',
  parts: {
    front_bumper: 'M 55,25 Q 70,12 150,12 Q 230,12 245,25 L 250,50 Q 230,58 150,58 Q 70,58 50,50 Z',
    hood: 'M 52,62 L 248,62 Q 244,100 240,135 L 236,165 Q 190,172 150,172 Q 110,172 64,165 L 60,135 Q 56,100 52,62 Z',
    front_left_fender: 'M 25,62 L 48,62 L 58,165 L 32,165 Q 22,120 22,90 Q 22,72 25,62 Z',
    front_right_fender: 'M 252,62 L 275,62 Q 278,72 278,90 Q 278,120 268,165 L 242,165 L 252,62 Z',
    front_left_door: 'M 28,170 L 62,170 L 66,265 L 32,265 Q 28,220 28,170 Z',
    front_right_door: 'M 238,170 L 272,170 Q 272,220 268,265 L 234,265 L 238,170 Z',
    roof: 'M 70,175 L 230,175 Q 235,235 235,290 Q 235,340 230,360 L 70,360 Q 65,340 65,290 Q 65,235 70,175 Z',
    rear_left_door: 'M 32,270 L 66,270 L 70,365 L 35,365 Q 32,320 32,270 Z',
    rear_right_door: 'M 234,270 L 268,270 Q 268,320 265,365 L 230,365 L 234,270 Z',
    rear_left_quarter: 'M 35,370 L 70,370 L 74,455 L 42,455 Q 32,420 32,395 Q 32,380 35,370 Z',
    rear_right_quarter: 'M 230,370 L 265,370 Q 268,380 268,395 Q 268,420 258,455 L 226,455 L 230,370 Z',
    trunk: 'M 78,365 L 222,365 Q 228,410 228,445 L 222,460 Q 185,468 150,468 Q 115,468 78,460 L 72,445 Q 72,410 78,365 Z',
    rear_bumper: 'M 48,465 Q 70,458 150,458 Q 230,458 252,465 L 248,492 Q 225,502 150,502 Q 75,502 52,492 Z',
  },
  wheels: [
    { cx: 42, cy: 120, rx: 20, ry: 42 },
    { cx: 258, cy: 120, rx: 20, ry: 42 },
    { cx: 42, cy: 410, rx: 20, ry: 42 },
    { cx: 258, cy: 410, rx: 20, ry: 42 },
  ],
  windows: [
    { d: 'M 88,178 L 212,178 L 198,205 L 102,205 Z', opacity: 0.6 },
    { d: 'M 98,358 L 202,358 L 212,385 L 88,385 Z', opacity: 0.6 },
    { d: 'M 68,210 L 64,350 L 72,350 L 76,210 Z', opacity: 0.5 },
    { d: 'M 232,210 L 224,210 L 228,350 L 236,350 Z', opacity: 0.5 },
  ],
  headlights: [
    { cx: 85, cy: 38, rx: 18, ry: 10 },
    { cx: 215, cy: 38, rx: 18, ry: 10 },
  ],
  taillights: [
    { cx: 88, cy: 482, rx: 15, ry: 8 },
    { cx: 212, cy: 482, rx: 15, ry: 8 },
  ],
  mirrors: [
    { cx: 18, cy: 195, rx: 10, ry: 18 },
    { cx: 282, cy: 195, rx: 10, ry: 18 },
  ],
  grille: { x: 115, y: 42, w: 70, h: 14 },
};

// هاتشباك
const HATCHBACK_TEMPLATE: CarTemplate = {
  viewBox: '0 0 300 440',
  parts: {
    front_bumper: 'M 55,25 Q 70,12 150,12 Q 230,12 245,25 L 250,48 Q 230,56 150,56 Q 70,56 50,48 Z',
    hood: 'M 52,60 L 248,60 Q 244,95 240,125 L 236,150 Q 190,156 150,156 Q 110,156 64,150 L 60,125 Q 56,95 52,60 Z',
    front_left_fender: 'M 25,60 L 48,60 L 58,150 L 32,150 Q 22,110 22,85 Q 22,70 25,60 Z',
    front_right_fender: 'M 252,60 L 275,60 Q 278,70 278,85 Q 278,110 268,150 L 242,150 L 252,60 Z',
    front_left_door: 'M 28,155 L 62,155 L 66,245 L 32,245 Q 28,205 28,155 Z',
    front_right_door: 'M 238,155 L 272,155 Q 272,205 268,245 L 234,245 L 238,155 Z',
    roof: 'M 70,160 L 230,160 Q 235,210 235,260 Q 235,295 230,310 L 70,310 Q 65,295 65,260 Q 65,210 70,160 Z',
    rear_left_door: 'M 32,250 L 66,250 L 70,320 L 35,320 Q 32,290 32,250 Z',
    rear_right_door: 'M 234,250 L 268,250 Q 268,290 265,320 L 230,320 L 234,250 Z',
    rear_left_quarter: 'M 35,325 L 70,325 L 74,385 L 42,385 Q 32,360 32,345 Q 32,335 35,325 Z',
    rear_right_quarter: 'M 230,325 L 265,325 Q 268,335 268,345 Q 268,360 258,385 L 226,385 L 230,325 Z',
    trunk: 'M 78,315 L 222,315 Q 228,350 228,380 L 222,395 Q 185,402 150,402 Q 115,402 78,395 L 72,380 Q 72,350 78,315 Z',
    rear_bumper: 'M 48,400 Q 70,392 150,392 Q 230,392 252,400 L 248,425 Q 225,435 150,435 Q 75,435 52,425 Z',
  },
  wheels: [
    { cx: 42, cy: 108, rx: 20, ry: 40 },
    { cx: 258, cy: 108, rx: 20, ry: 40 },
    { cx: 42, cy: 355, rx: 20, ry: 40 },
    { cx: 258, cy: 355, rx: 20, ry: 40 },
  ],
  windows: [
    { d: 'M 88,163 L 212,163 L 198,188 L 102,188 Z', opacity: 0.6 },
    { d: 'M 98,308 L 202,308 L 212,330 L 88,330 Z', opacity: 0.6 },
    { d: 'M 68,192 L 64,302 L 72,302 L 76,192 Z', opacity: 0.5 },
    { d: 'M 232,192 L 224,192 L 228,302 L 236,302 Z', opacity: 0.5 },
  ],
  headlights: [
    { cx: 85, cy: 36, rx: 18, ry: 10 },
    { cx: 215, cy: 36, rx: 18, ry: 10 },
  ],
  taillights: [
    { cx: 88, cy: 415, rx: 15, ry: 8 },
    { cx: 212, cy: 415, rx: 15, ry: 8 },
  ],
  mirrors: [
    { cx: 18, cy: 180, rx: 10, ry: 16 },
    { cx: 282, cy: 180, rx: 10, ry: 16 },
  ],
  grille: { x: 115, y: 40, w: 70, h: 12 },
};

// SUV
const SUV_TEMPLATE: CarTemplate = {
  viewBox: '0 0 320 540',
  parts: {
    front_bumper: 'M 50,28 Q 68,12 160,12 Q 252,12 270,28 L 278,58 Q 255,68 160,68 Q 65,68 42,58 Z',
    hood: 'M 45,72 L 275,72 Q 270,115 265,155 L 260,190 Q 210,198 160,198 Q 110,198 60,190 L 55,155 Q 50,115 45,72 Z',
    front_left_fender: 'M 18,72 L 42,72 L 54,190 L 25,190 Q 14,140 14,105 Q 14,85 18,72 Z',
    front_right_fender: 'M 278,72 L 302,72 Q 306,85 306,105 Q 306,140 295,190 L 266,190 L 278,72 Z',
    front_left_door: 'M 22,195 L 58,195 L 64,305 L 28,305 Q 22,255 22,195 Z',
    front_right_door: 'M 262,195 L 298,195 Q 298,255 292,305 L 256,305 L 262,195 Z',
    roof: 'M 65,200 L 255,200 Q 262,270 262,335 Q 262,390 255,415 L 65,415 Q 58,390 58,335 Q 58,270 65,200 Z',
    rear_left_door: 'M 28,310 L 64,310 L 70,420 L 32,420 Q 28,370 28,310 Z',
    rear_right_door: 'M 256,310 L 292,310 Q 292,370 288,420 L 250,420 L 256,310 Z',
    rear_left_quarter: 'M 32,425 L 70,425 L 76,505 L 42,505 Q 28,470 28,445 Q 28,435 32,425 Z',
    rear_right_quarter: 'M 250,425 L 288,425 Q 292,435 292,445 Q 292,470 278,505 L 244,505 L 250,425 Z',
    trunk: 'M 80,420 L 240,420 Q 248,465 248,500 L 240,518 Q 200,528 160,528 Q 120,528 80,518 L 72,500 Q 72,465 80,420 Z',
    rear_bumper: 'M 40,522 Q 65,512 160,512 Q 255,512 280,522 L 275,555 Q 248,568 160,568 Q 72,568 45,555 Z',
  },
  wheels: [
    { cx: 38, cy: 138, rx: 24, ry: 50 },
    { cx: 282, cy: 138, rx: 24, ry: 50 },
    { cx: 38, cy: 465, rx: 24, ry: 50 },
    { cx: 282, cy: 465, rx: 24, ry: 50 },
  ],
  windows: [
    { d: 'M 85,205 L 235,205 L 218,238 L 102,238 Z', opacity: 0.6 },
    { d: 'M 100,412 L 220,412 L 232,442 L 88,442 Z', opacity: 0.6 },
    { d: 'M 62,242 L 58,405 L 68,405 L 72,242 Z', opacity: 0.5 },
    { d: 'M 258,242 L 248,242 L 252,405 L 262,405 Z', opacity: 0.5 },
  ],
  headlights: [
    { cx: 90, cy: 45, rx: 22, ry: 12 },
    { cx: 230, cy: 45, rx: 22, ry: 12 },
  ],
  taillights: [
    { cx: 92, cy: 542, rx: 18, ry: 10 },
    { cx: 228, cy: 542, rx: 18, ry: 10 },
  ],
  mirrors: [
    { cx: 10, cy: 225, rx: 12, ry: 22 },
    { cx: 310, cy: 225, rx: 12, ry: 22 },
  ],
  grille: { x: 120, y: 48, w: 80, h: 18 },
};

// كوبيه (بابين)
const COUPE_TEMPLATE: CarTemplate = {
  viewBox: '0 0 300 480',
  parts: {
    front_bumper: 'M 52,22 Q 68,10 150,10 Q 232,10 248,22 L 255,52 Q 232,62 150,62 Q 68,62 45,52 Z',
    hood: 'M 48,66 L 252,66 Q 248,108 244,148 L 238,185 Q 195,194 150,194 Q 105,194 62,185 L 56,148 Q 52,108 48,66 Z',
    front_left_fender: 'M 22,66 L 45,66 L 56,185 L 28,185 Q 18,132 18,98 Q 18,78 22,66 Z',
    front_right_fender: 'M 255,66 L 278,66 Q 282,78 282,98 Q 282,132 272,185 L 244,185 L 255,66 Z',
    front_left_door: 'M 25,190 L 60,190 L 68,340 L 32,340 Q 25,275 25,190 Z',
    front_right_door: 'M 240,190 L 275,190 Q 275,275 268,340 L 232,340 L 240,190 Z',
    roof: 'M 72,195 L 228,195 Q 235,260 235,320 Q 235,365 228,385 L 72,385 Q 65,365 65,320 Q 65,260 72,195 Z',
    rear_left_door: 'M 32,345 L 68,345 L 72,390 L 38,390 Q 32,370 32,345 Z',
    rear_right_door: 'M 232,345 L 268,345 Q 268,370 262,390 L 228,390 L 232,345 Z',
    rear_left_quarter: 'M 38,395 L 72,395 L 78,455 L 48,455 Q 35,430 35,412 Q 35,402 38,395 Z',
    rear_right_quarter: 'M 228,395 L 262,395 Q 265,402 265,412 Q 265,430 252,455 L 222,455 L 228,395 Z',
    trunk: 'M 82,390 L 218,390 Q 226,428 226,455 L 218,472 Q 182,482 150,482 Q 118,482 82,472 L 74,455 Q 74,428 82,390 Z',
    rear_bumper: 'M 45,478 Q 68,468 150,468 Q 232,468 255,478 L 250,508 Q 225,520 150,520 Q 75,520 50,508 Z',
  },
  wheels: [
    { cx: 40, cy: 130, rx: 22, ry: 48 },
    { cx: 260, cy: 130, rx: 22, ry: 48 },
    { cx: 40, cy: 420, rx: 22, ry: 48 },
    { cx: 260, cy: 420, rx: 22, ry: 48 },
  ],
  windows: [
    { d: 'M 90,200 L 210,200 L 195,232 L 105,232 Z', opacity: 0.6 },
    { d: 'M 100,382 L 200,382 L 212,408 L 88,408 Z', opacity: 0.6 },
    { d: 'M 68,236 L 64,375 L 74,375 L 78,236 Z', opacity: 0.5 },
    { d: 'M 232,236 L 222,236 L 226,375 L 236,375 Z', opacity: 0.5 },
  ],
  headlights: [
    { cx: 82, cy: 38, rx: 20, ry: 12 },
    { cx: 218, cy: 38, rx: 20, ry: 12 },
  ],
  taillights: [
    { cx: 88, cy: 495, rx: 16, ry: 9 },
    { cx: 212, cy: 495, rx: 16, ry: 9 },
  ],
  mirrors: [
    { cx: 15, cy: 218, rx: 10, ry: 20 },
    { cx: 285, cy: 218, rx: 10, ry: 20 },
  ],
  grille: { x: 112, y: 45, w: 76, h: 15 },
};

// بيك أب
const PICKUP_TEMPLATE: CarTemplate = {
  viewBox: '0 0 320 620',
  parts: {
    front_bumper: 'M 48,28 Q 68,12 160,12 Q 252,12 272,28 L 280,62 Q 255,72 160,72 Q 65,72 40,62 Z',
    hood: 'M 42,76 L 278,76 Q 272,125 266,170 L 260,210 Q 210,220 160,220 Q 110,220 60,210 L 54,170 Q 48,125 42,76 Z',
    front_left_fender: 'M 15,76 L 40,76 L 54,210 L 22,210 Q 10,150 10,112 Q 10,90 15,76 Z',
    front_right_fender: 'M 280,76 L 305,76 Q 310,90 310,112 Q 310,150 298,210 L 266,210 L 280,76 Z',
    front_left_door: 'M 18,215 L 58,215 L 65,340 L 25,340 Q 18,285 18,215 Z',
    front_right_door: 'M 262,215 L 302,215 Q 302,285 295,340 L 255,340 L 262,215 Z',
    roof: 'M 68,220 L 252,220 Q 260,280 260,335 Q 260,375 252,395 L 68,395 Q 60,375 60,335 Q 60,280 68,220 Z',
    rear_left_door: 'M 25,345 L 65,345 L 68,400 L 30,400 Q 25,375 25,345 Z',
    rear_right_door: 'M 255,345 L 295,345 Q 295,375 290,400 L 252,400 L 255,345 Z',
    rear_left_quarter: 'M 30,405 L 68,405 L 72,560 L 38,560 Q 25,500 25,455 Q 25,425 30,405 Z',
    rear_right_quarter: 'M 252,405 L 290,405 Q 295,425 295,455 Q 295,500 282,560 L 248,560 L 252,405 Z',
    trunk: 'M 76,400 L 244,400 L 244,555 Q 200,562 160,562 Q 120,562 76,555 Z',
    rear_bumper: 'M 35,565 Q 60,555 160,555 Q 260,555 285,565 L 280,598 Q 252,612 160,612 Q 68,612 40,598 Z',
  },
  wheels: [
    { cx: 35, cy: 148, rx: 25, ry: 52 },
    { cx: 285, cy: 148, rx: 25, ry: 52 },
    { cx: 35, cy: 515, rx: 25, ry: 52 },
    { cx: 285, cy: 515, rx: 25, ry: 52 },
  ],
  windows: [
    { d: 'M 88,225 L 232,225 L 215,260 L 105,260 Z', opacity: 0.6 },
    { d: 'M 65,265 L 60,388 L 72,388 L 77,265 Z', opacity: 0.5 },
    { d: 'M 255,265 L 243,265 L 248,388 L 260,388 Z', opacity: 0.5 },
  ],
  headlights: [
    { cx: 88, cy: 48, rx: 22, ry: 14 },
    { cx: 232, cy: 48, rx: 22, ry: 14 },
  ],
  taillights: [
    { cx: 85, cy: 585, rx: 18, ry: 10 },
    { cx: 235, cy: 585, rx: 18, ry: 10 },
  ],
  mirrors: [
    { cx: 8, cy: 245, rx: 12, ry: 22 },
    { cx: 312, cy: 245, rx: 12, ry: 22 },
  ],
  grille: { x: 118, y: 52, w: 84, h: 18 },
};

// خريطة القوالب
const TEMPLATES: Record<BodyType, CarTemplate> = {
  sedan: SEDAN_TEMPLATE,
  hatchback: HATCHBACK_TEMPLATE,
  coupe: COUPE_TEMPLATE,
  suv: SUV_TEMPLATE,
  crossover: SUV_TEMPLATE,
  pickup: PICKUP_TEMPLATE,
  van: SUV_TEMPLATE,
  minivan: SUV_TEMPLATE,
  truck: PICKUP_TEMPLATE,
};

const ALL_PARTS: BodyPartId[] = [
  'roof', 'trunk', 'hood', 'front_bumper', 'rear_bumper',
  'front_left_fender', 'front_right_fender',
  'front_left_door', 'front_right_door',
  'rear_left_door', 'rear_right_door',
  'rear_left_quarter', 'rear_right_quarter',
];


// ============ دوال مساعدة ============

function adjustColor(baseColor: string, amount: number): string {
  const hex = baseColor.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getStatusColor(status: PartStatus): string {
  const colors: Record<PartStatus, string> = {
    original: '#22c55e',
    painted: '#eab308',
    bodywork: '#f97316',
    accident: '#ef4444',
    replaced: '#3b82f6',
    needs_check: '#6b7280',
  };
  return colors[status] || '#94a3b8';
}

// ============ المكون الرئيسي ============

export default function Car2DFallback({
  partsStatus,
  onPartClick,
  readOnly = false,
  showLabels = true,
  bodyType = 'sedan',
}: Car2DFallbackProps) {
  const [hoveredPart, setHoveredPart] = useState<BodyPartId | null>(null);
  
  const template = useMemo(() => TEMPLATES[bodyType] || TEMPLATES.sedan, [bodyType]);

  const handlePartClick = useCallback((partId: BodyPartId) => {
    if (!readOnly) {
      onPartClick(partId);
    }
  }, [readOnly, onPartClick]);

  const renderPart = useCallback((partId: BodyPartId) => {
    const path = template.parts[partId];
    if (!path) return null;

    const status = partsStatus[partId] || 'needs_check';
    const baseColor = getStatusColor(status);
    const isHovered = hoveredPart === partId;
    const fillColor = isHovered ? adjustColor(baseColor, 30) : baseColor;

    return (
      <path
        key={partId}
        d={path}
        fill={fillColor}
        stroke={isHovered ? '#1e293b' : '#475569'}
        strokeWidth={isHovered ? 2.5 : 1.5}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          filter: isHovered ? 'brightness(1.1)' : 'none',
        }}
        onMouseEnter={() => setHoveredPart(partId)}
        onMouseLeave={() => setHoveredPart(null)}
        onClick={() => handlePartClick(partId)}
      />
    );
  }, [template, partsStatus, hoveredPart, readOnly, handlePartClick]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* عنوان نوع السيارة */}
      <div className="absolute top-2 left-2 bg-slate-800/80 text-white text-xs px-2 py-1 rounded">
        {bodyType.toUpperCase()}
      </div>

      {/* SVG الرئيسي */}
      <svg
        viewBox={template.viewBox}
        className="w-full h-full max-w-[280px] max-h-[500px]"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
      >
        <defs>
          {/* تدرج للزجاج */}
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.9" />
          </linearGradient>
          
          {/* تدرج للمصابيح الأمامية */}
          <radialGradient id="headlightGradient">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="70%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
          
          {/* تدرج للمصابيح الخلفية */}
          <radialGradient id="taillightGradient">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="70%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>

          {/* تدرج للعجلات */}
          <radialGradient id="wheelGradient">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="60%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#111827" />
          </radialGradient>

          {/* تدرج للمرايا */}
          <linearGradient id="mirrorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="50%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>

        {/* العجلات (خلف الجسم) */}
        {template.wheels.map((wheel, i) => (
          <g key={`wheel-${i}`}>
            <ellipse
              cx={wheel.cx}
              cy={wheel.cy}
              rx={wheel.rx}
              ry={wheel.ry}
              fill="url(#wheelGradient)"
              stroke="#111827"
              strokeWidth="2"
            />
            {/* إطار العجلة */}
            <ellipse
              cx={wheel.cx}
              cy={wheel.cy}
              rx={wheel.rx * 0.7}
              ry={wheel.ry * 0.7}
              fill="none"
              stroke="#374151"
              strokeWidth="1"
            />
            {/* مركز العجلة */}
            <ellipse
              cx={wheel.cx}
              cy={wheel.cy}
              rx={wheel.rx * 0.25}
              ry={wheel.ry * 0.25}
              fill="#6b7280"
            />
          </g>
        ))}

        {/* أجزاء الجسم */}
        {ALL_PARTS.map(renderPart)}

        {/* الشبك الأمامي */}
        <rect
          x={template.grille.x}
          y={template.grille.y}
          width={template.grille.w}
          height={template.grille.h}
          rx="3"
          fill="#1f2937"
          stroke="#374151"
          strokeWidth="1"
        />
        {/* خطوط الشبك */}
        {[...Array(5)].map((_, i) => (
          <line
            key={`grille-line-${i}`}
            x1={template.grille.x + (template.grille.w / 6) * (i + 1)}
            y1={template.grille.y + 2}
            x2={template.grille.x + (template.grille.w / 6) * (i + 1)}
            y2={template.grille.y + template.grille.h - 2}
            stroke="#4b5563"
            strokeWidth="1"
          />
        ))}

        {/* النوافذ */}
        {template.windows.map((win, i) => (
          <path
            key={`window-${i}`}
            d={win.d}
            fill="url(#glassGradient)"
            opacity={win.opacity}
            stroke="#1e3a5f"
            strokeWidth="1"
          />
        ))}

        {/* المصابيح الأمامية */}
        {template.headlights.map((light, i) => (
          <ellipse
            key={`headlight-${i}`}
            cx={light.cx}
            cy={light.cy}
            rx={light.rx}
            ry={light.ry}
            fill="url(#headlightGradient)"
            stroke="#ca8a04"
            strokeWidth="1"
          />
        ))}

        {/* المصابيح الخلفية */}
        {template.taillights.map((light, i) => (
          <ellipse
            key={`taillight-${i}`}
            cx={light.cx}
            cy={light.cy}
            rx={light.rx}
            ry={light.ry}
            fill="url(#taillightGradient)"
            stroke="#991b1b"
            strokeWidth="1"
          />
        ))}

        {/* المرايا الجانبية */}
        {template.mirrors.map((mirror, i) => (
          <ellipse
            key={`mirror-${i}`}
            cx={mirror.cx}
            cy={mirror.cy}
            rx={mirror.rx}
            ry={mirror.ry}
            fill="url(#mirrorGradient)"
            stroke="#374151"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* اسم الجزء المحدد */}
      {hoveredPart && showLabels && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
          <span className="font-medium">{BODY_PART_LABELS[hoveredPart]}</span>
          <span className="mx-2">•</span>
          <span 
            className="font-bold"
            style={{ color: getStatusColor(partsStatus[hoveredPart] || 'needs_check') }}
          >
            {PART_STATUS_CONFIG[partsStatus[hoveredPart] || 'needs_check']?.label || 'يحتاج فحص'}
          </span>
        </div>
      )}

      {/* دليل الألوان */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-slate-800/80 p-2 rounded text-xs">
        {Object.entries(PART_STATUS_CONFIG).map(([status, config]) => (
          <div key={status} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getStatusColor(status as PartStatus) }}
            />
            <span className="text-white">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
