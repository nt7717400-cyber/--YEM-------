/**
 * PDF Generator for Vehicle Inspection Reports
 * Design matching Flutter app - Continuous layout without page breaks
 */

import type { Car } from '@/types/car';
import type { BodyType, BodyPartId, PartStatus, MechanicalStatus } from '@/types/inspection';
import { BODY_PART_LABELS, BODY_TYPE_LABELS } from '@/constants/inspection';
import { getImageUrl } from '@/lib/api';

export interface PDFReportOptions {
  language: 'ar' | 'en';
  companyName?: string;
  paperSize?: 'A4' | 'Letter';
  includeSections: {
    vehicleInfo: boolean;
    customerInfo: boolean;
    inspectorInfo: boolean;
    damageTable: boolean;
  };
}

export interface InspectionPDFData {
  car?: Car;
  bodyType: BodyType;
  partsStatus: Record<BodyPartId, PartStatus>;
  mechanical?: MechanicalStatus;
  inspectionDate?: string;
  damageDetails?: Record<string, { partKey: string; condition: string; severity?: string; notes?: string; photos?: string[]; updatedAt?: string }>;
  technicalNotes?: string;
}

export const DEFAULT_PDF_OPTIONS: PDFReportOptions = {
  language: 'ar',
  companyName: 'SHAS Motors',
  paperSize: 'A4',
  includeSections: {
    vehicleInfo: true,
    customerInfo: true,
    inspectorInfo: true,
    damageTable: true,
  },
};

const PART_NAMES: Record<string, string> = {
  'front_bumper': 'الصدام الأمامي', 'rear_bumper': 'الصدام الخلفي',
  'hood': 'الكبوت', 'roof': 'السقف', 'trunk': 'الشنطة',
  'left_front_door': 'الباب الأمامي الأيسر', 'right_front_door': 'الباب الأمامي الأيمن',
  'left_rear_door': 'الباب الخلفي الأيسر', 'right_rear_door': 'الباب الخلفي الأيمن',
  'left_front_fender': 'الرفرف الأمامي الأيسر', 'right_front_fender': 'الرفرف الأمامي الأيمن',
  'left_rear_quarter': 'الربع الخلفي الأيسر', 'right_rear_quarter': 'الربع الخلفي الأيمن',
  'wheel_front_left': 'العجلة الأمامية اليسرى', 'wheel_front_right': 'العجلة الأمامية اليمنى',
  'wheel_rear_left': 'العجلة الخلفية اليسرى', 'wheel_rear_right': 'العجلة الخلفية اليمنى',
  'headlight_left': 'المصباح الأمامي الأيسر', 'headlight_right': 'المصباح الأمامي الأيمن',
  'taillight_left': 'المصباح الخلفي الأيسر', 'taillight_right': 'المصباح الخلفي الأيمن',
  'front_windshield': 'الزجاج الأمامي', 'rear_windshield': 'الزجاج الخلفي',
  'left_mirror': 'المرآة اليسرى', 'right_mirror': 'المرآة اليمنى',
  'left_front_window': 'زجاج الباب الأمامي الأيسر', 'right_front_window': 'زجاج الباب الأمامي الأيمن',
  'left_rear_window': 'زجاج الباب الخلفي الأيسر', 'right_rear_window': 'زجاج الباب الخلفي الأيمن',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  original: { label: 'سليم', color: '#22c55e', bgColor: '#dcfce7' },
  good: { label: 'سليم', color: '#22c55e', bgColor: '#dcfce7' },
  painted: { label: 'رش', color: '#3b82f6', bgColor: '#dbeafe' },
  bodywork: { label: 'سمكرة', color: '#f97316', bgColor: '#ffedd5' },
  accident: { label: 'حادث', color: '#ef4444', bgColor: '#fee2e2' },
  broken: { label: 'كسر', color: '#ef4444', bgColor: '#fee2e2' },
  replaced: { label: 'تغيير', color: '#8b5cf6', bgColor: '#ede9fe' },
  scratch: { label: 'خدش', color: '#eab308', bgColor: '#fef9c3' },
  needs_check: { label: 'غير محدد', color: '#6b7280', bgColor: '#f3f4f6' },
  not_inspected: { label: 'غير محدد', color: '#6b7280', bgColor: '#f3f4f6' },
};

// Tire-specific status labels (mapped from condition)
const TIRE_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  good: { label: 'جديد', color: '#22c55e', bgColor: '#dcfce7' },
  scratch: { label: 'مستخدم 50%', color: '#f59e0b', bgColor: '#fef3c7' },
  broken: { label: 'تالف', color: '#ef4444', bgColor: '#fee2e2' },
  not_inspected: { label: 'غير محدد', color: '#6b7280', bgColor: '#f3f4f6' },
};

// Check if part is a wheel/tire
function isWheelPart(partKey: string): boolean {
  return partKey.includes('wheel') || partKey.includes('tire');
}

function getStatusConfig(status: string, partKey?: string): { label: string; color: string; bgColor: string } {
  // Use tire-specific labels for wheel parts
  if (partKey && isWheelPart(partKey)) {
    return TIRE_STATUS_CONFIG[status] || TIRE_STATUS_CONFIG.not_inspected;
  }
  return STATUS_CONFIG[status] || STATUS_CONFIG.original;
}

function generateReportHTML(data: InspectionPDFData, options: PDFReportOptions): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  
  let carThumbnail = '';
  if (data.car?.thumbnail) {
    carThumbnail = data.car.thumbnail.startsWith('data:') ? data.car.thumbnail : getImageUrl(data.car.thumbnail);
  } else if (data.car?.images?.[0]?.url) {
    const imgUrl = data.car.images[0].url;
    carThumbnail = imgUrl.startsWith('data:') ? imgUrl : getImageUrl(imgUrl);
  }

  // Map VDS part keys to body part IDs
  const partKeyToBodyPartId: Record<string, string> = {
    'front_bumper': 'front_bumper',
    'rear_bumper': 'rear_bumper',
    'hood': 'hood',
    'roof': 'roof',
    'trunk': 'trunk',
    'left_front_door': 'front_left_door',
    'right_front_door': 'front_right_door',
    'left_rear_door': 'rear_left_door',
    'right_rear_door': 'rear_right_door',
    'left_front_fender': 'front_left_fender',
    'right_front_fender': 'front_right_fender',
    'left_rear_quarter': 'rear_left_quarter',
    'right_rear_quarter': 'rear_right_quarter',
  };

  // Get the actual condition for a part (from damageDetails first, then bodyParts)
  const getPartCondition = (partKey: string): string => {
    // First check damageDetails
    if (data.damageDetails?.[partKey]?.condition) {
      return data.damageDetails[partKey].condition;
    }
    // Then check bodyParts using the mapping
    const bodyPartId = partKeyToBodyPartId[partKey];
    if (bodyPartId && data.partsStatus[bodyPartId as BodyPartId]) {
      return data.partsStatus[bodyPartId as BodyPartId];
    }
    // Default to original
    return 'original';
  };

  // Parts grouped by view
  const frontParts = ['front_bumper', 'hood', 'headlight_left', 'headlight_right', 'front_windshield'];
  const rearParts = ['rear_bumper', 'trunk', 'taillight_left', 'taillight_right', 'rear_windshield'];
  const leftParts = ['left_front_door', 'left_rear_door', 'left_front_fender', 'left_rear_quarter', 'left_mirror'];
  const rightParts = ['right_front_door', 'right_rear_door', 'right_front_fender', 'right_rear_quarter', 'right_mirror'];
  const topParts = ['roof'];

  const buildPartRow = (partKey: string) => {
    const condition = getPartCondition(partKey);
    const config = getStatusConfig(condition, partKey);
    const partName = PART_NAMES[partKey] || BODY_PART_LABELS[partKey as BodyPartId] || partKey;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:10px;height:10px;border-radius:3px;background:${config.color};flex-shrink:0;"></span>
        <span style="font-size:10px;color:#374151;">${partName}</span>
      </div>
      <span style="font-size:9px;color:${config.color};font-weight:600;background:${config.bgColor};padding:2px 8px;border-radius:10px;">${config.label}</span>
    </div>`;
  };

  const buildViewSection = (title: string, parts: string[]) => {
    const rows = parts.map(buildPartRow).join('');
    return `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;flex:1;min-width:200px;">
      <div style="background:#1e40af;color:white;padding:8px 12px;font-size:12px;font-weight:600;text-align:center;">${title}</div>
      <div style="padding:8px 10px;background:white;">${rows}</div>
    </div>`;
  };

  // Build damage rows for table
  const damageRows = Object.entries(data.damageDetails || {})
    .filter(([, detail]) => detail.condition !== 'original' && (detail.condition as string) !== 'good')
    .map(([partKey, detail]) => {
      const config = getStatusConfig(detail.condition, partKey);
      const partName = PART_NAMES[partKey] || BODY_PART_LABELS[partKey as BodyPartId] || partKey;
      return `<tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 12px;font-size:11px;text-align:right;color:#374151;">${partName}</td>
        <td style="padding:10px 12px;text-align:center;">
          <span style="display:inline-flex;align-items:center;gap:4px;background:${config.bgColor};padding:3px 10px;border-radius:12px;">
            <span style="width:8px;height:8px;border-radius:2px;background:${config.color};"></span>
            <span style="font-size:10px;color:${config.color};font-weight:600;">${config.label}</span>
          </span>
        </td>
        <td style="padding:10px 12px;font-size:10px;text-align:center;color:#6b7280;">-</td>
        <td style="padding:10px 12px;font-size:10px;text-align:right;color:#374151;">${detail.notes || '-'}</td>
      </tr>`;
    }).join('');

  // Count parts status - consider all parts including those in damageDetails
  const allPartKeys = new Set([
    ...frontParts,
    ...rearParts,
    ...leftParts,
    ...rightParts,
    ...topParts,
  ]);
  
  let goodParts = 0;
  let damagedParts = 0;
  
  allPartKeys.forEach(partKey => {
    const condition = getPartCondition(partKey);
    if (condition === 'original' || condition === 'good') {
      goodParts++;
    } else if (condition !== 'not_inspected') {
      damagedParts++;
    }
  });
  
  const totalParts = goodParts + damagedParts;

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير فحص السيارة</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo',sans-serif;font-size:11px;color:#1f2937;direction:rtl;background:#f8fafc;}
.container{max-width:210mm;margin:0 auto;background:white;}
@media print{
  body{background:white;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .container{max-width:100%;}
}
</style></head><body>
<div class="container">

<!-- SECTION 1: Cover -->
<div style="background:linear-gradient(180deg,#1e40af 0%,#3b82f6 100%);padding:20px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
    <span style="font-size:14px;color:white;font-weight:600;">${options.companyName || 'معرض السيارات'}</span>
    <div style="width:45px;height:45px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#1e40af;">م</div>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;text-align:center;">
    <div style="font-size:20px;font-weight:700;color:#1e40af;margin-bottom:12px;">تقرير فحص السيارة</div>
    ${carThumbnail ? `<img src="${carThumbnail}" style="width:100%;max-width:260px;height:140px;object-fit:contain;margin:0 auto 12px;display:block;border-radius:8px;background:#f8fafc;" crossorigin="anonymous" />` : '<div style="height:100px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;margin-bottom:12px;font-size:12px;">لا توجد صورة</div>'}
    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
      <div style="text-align:center;padding:8px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc;">
        <div style="font-size:9px;color:#6b7280;">الماركة</div>
        <div style="font-size:13px;font-weight:600;color:#1f2937;">${data.car?.brand || '-'}</div>
      </div>
      <div style="text-align:center;padding:8px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc;">
        <div style="font-size:9px;color:#6b7280;">الموديل</div>
        <div style="font-size:13px;font-weight:600;color:#1f2937;">${data.car?.model || '-'}</div>
      </div>
      <div style="text-align:center;padding:8px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc;">
        <div style="font-size:9px;color:#6b7280;">سنة الصنع</div>
        <div style="font-size:13px;font-weight:600;color:#1f2937;">${data.car?.year || '-'}</div>
      </div>
      <div style="text-align:center;padding:8px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc;">
        <div style="font-size:9px;color:#6b7280;">نوع الهيكل</div>
        <div style="font-size:13px;font-weight:600;color:#1f2937;">${BODY_TYPE_LABELS[data.bodyType] || 'سيدان'}</div>
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
    <span style="font-size:11px;color:rgba(255,255,255,0.9);">${dateStr}</span>
    <span style="background:#22c55e;color:white;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:600;">معتمد</span>
    <span style="font-size:11px;color:rgba(255,255,255,0.9);">#${data.car?.id || '---'}</span>
  </div>
</div>

<!-- SECTION 2: Vehicle Info -->
<div style="padding:15px 20px;background:#f8fafc;">
  <div style="background:#1e40af;color:white;padding:10px 15px;border-radius:8px 8px 0 0;font-size:13px;font-weight:600;">معلومات السيارة</div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:15px;display:flex;gap:20px;">
    <div style="flex:1;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;">
        <span style="color:#6b7280;font-size:11px;">الماركة:</span>
        <span style="font-weight:600;font-size:11px;">${data.car?.brand || '-'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;">
        <span style="color:#6b7280;font-size:11px;">الموديل:</span>
        <span style="font-weight:600;font-size:11px;">${data.car?.model || '-'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;">
        <span style="color:#6b7280;font-size:11px;">سنة الصنع:</span>
        <span style="font-weight:600;font-size:11px;">${data.car?.year || '-'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;">
        <span style="color:#6b7280;font-size:11px;">نوع الهيكل:</span>
        <span style="font-weight:600;font-size:11px;">${BODY_TYPE_LABELS[data.bodyType] || 'سيدان'}</span>
      </div>
    </div>
    <div style="flex:1;">
      <div style="background:#f8fafc;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">ملخص الفحص</div>
        <div style="display:flex;justify-content:center;gap:15px;">
          <div style="text-align:center;">
            <div style="width:36px;height:36px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;margin:0 auto 4px;">${goodParts}</div>
            <div style="font-size:9px;color:#6b7280;">سليم</div>
          </div>
          <div style="text-align:center;">
            <div style="width:36px;height:36px;background:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;margin:0 auto 4px;">${damagedParts}</div>
            <div style="font-size:9px;color:#6b7280;">متضرر</div>
          </div>
          <div style="text-align:center;">
            <div style="width:36px;height:36px;background:#1e40af;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;margin:0 auto 4px;">${totalParts}</div>
            <div style="font-size:9px;color:#6b7280;">الإجمالي</div>
          </div>
        </div>
        <div style="margin-top:10px;">
          <span style="background:${damagedParts === 0 ? '#22c55e' : damagedParts <= 3 ? '#3b82f6' : '#f97316'};color:white;padding:4px 12px;border-radius:15px;font-size:10px;font-weight:600;">
            الحالة: ${damagedParts === 0 ? 'ممتازة' : damagedParts <= 3 ? 'جيدة' : 'مقبولة'}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- SECTION 3: Inspection Diagrams -->
<div style="padding:0 20px 15px;">
  <div style="background:#1e40af;color:white;padding:10px 15px;border-radius:8px 8px 0 0;font-size:13px;font-weight:600;">مخططات الفحص</div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:15px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      ${buildViewSection('المنظر الأمامي', frontParts)}
      ${buildViewSection('المنظر الخلفي', rearParts)}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;">
      ${buildViewSection('الجانب الأيسر', leftParts)}
      ${buildViewSection('الجانب الأيمن', rightParts)}
    </div>
  </div>
</div>

<!-- Color Legend -->
<div style="padding:0 20px 15px;">
  <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
    <div style="font-size:11px;font-weight:600;color:#374151;margin-bottom:8px;">دليل الألوان:</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      ${Object.entries(STATUS_CONFIG).filter(([key]) => !['good', 'needs_check'].includes(key)).map(([, cfg]) => 
        `<div style="display:flex;align-items:center;gap:4px;">
          <span style="width:12px;height:12px;border-radius:3px;background:${cfg.color};"></span>
          <span style="font-size:10px;color:#374151;">${cfg.label}</span>
        </div>`
      ).join('')}
    </div>
  </div>
</div>

<!-- SECTION 4: Damage Details Table -->
<div style="padding:0 20px 20px;">
  <div style="background:#1e40af;color:white;padding:10px 15px;border-radius:8px 8px 0 0;font-size:13px;font-weight:600;">تفاصيل الأضرار</div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
    ${damageRows ? `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 12px;font-size:11px;text-align:right;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;">الجزء</th>
          <th style="padding:10px 12px;font-size:11px;text-align:center;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;">الحالة</th>
          <th style="padding:10px 12px;font-size:11px;text-align:center;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;">الشدة</th>
          <th style="padding:10px 12px;font-size:11px;text-align:right;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;">ملاحظات</th>
        </tr>
      </thead>
      <tbody>${damageRows}</tbody>
    </table>
    ` : `
    <div style="padding:30px;text-align:center;">
      <div style="width:60px;height:60px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
        <span style="color:white;font-size:28px;font-weight:700;">✓</span>
      </div>
      <div style="font-size:14px;font-weight:600;color:#22c55e;">لا توجد أضرار مسجلة</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px;">السيارة بحالة ممتازة</div>
    </div>
    `}
  </div>
</div>

${data.technicalNotes ? `
<!-- Technical Notes -->
<div style="padding:0 20px 20px;">
  <div style="background:#f59e0b;color:white;padding:10px 15px;border-radius:8px 8px 0 0;font-size:13px;font-weight:600;">ملاحظات فنية</div>
  <div style="background:#fffbeb;border:1px solid #fcd34d;border-top:none;border-radius:0 0 8px 8px;padding:15px;">
    <p style="font-size:11px;color:#92400e;line-height:1.6;margin:0;">${data.technicalNotes}</p>
  </div>
</div>
` : ''}

<!-- Footer -->
<div style="padding:15px 20px;background:#f8fafc;border-top:1px solid #e5e7eb;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:9px;color:#6b7280;">تم إنشاء التقرير في: ${dateStr}</span>
    <span style="font-size:10px;font-weight:600;color:#1e40af;">${options.companyName || 'معرض السيارات'}</span>
    <span style="font-size:9px;color:#6b7280;">تقرير رقم: #${data.car?.id || '---'}</span>
  </div>
</div>

</div>
</body></html>`;
}

/**
 * Inspection PDF Generator Class
 */
export class InspectionPDFGenerator {
  private data: InspectionPDFData;
  private options: PDFReportOptions;

  constructor(data: InspectionPDFData, options: Partial<PDFReportOptions> = {}) {
    this.data = data;
    this.options = { ...DEFAULT_PDF_OPTIONS, ...options };
  }

  /**
   * Convert image URL to base64 for print window
   */
  private async imageToBase64(url: string): Promise<string> {
    try {
      const fullUrl = url.startsWith('data:') ? url : (url.startsWith('http') ? url : getImageUrl(url));
      if (fullUrl.startsWith('data:')) return fullUrl;
      
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return '';
    }
  }

  /**
   * Convert all images in data to base64
   */
  async convertImagesToBase64(): Promise<InspectionPDFData> {
    const newData = { ...this.data };
    
    if (newData.car) {
      newData.car = { ...newData.car };
      
      // Convert thumbnail
      if (newData.car.thumbnail) {
        newData.car.thumbnail = await this.imageToBase64(newData.car.thumbnail);
      }
      
      // Convert first image if no thumbnail
      if (!newData.car.thumbnail && newData.car.images?.[0]?.url) {
        const base64 = await this.imageToBase64(newData.car.images[0].url);
        if (base64) {
          newData.car.thumbnail = base64;
        }
      }
    }
    
    return newData;
  }

  /**
   * Generate HTML report
   */
  generateHTML(): string {
    return generateReportHTML(this.data, this.options);
  }

  /**
   * Download as PDF file (opens print dialog with save as PDF option)
   */
  async download(filename?: string): Promise<void> {
    // Convert images to base64 first
    const dataWithBase64 = await this.convertImagesToBase64();
    const generator = new InspectionPDFGenerator(dataWithBase64, this.options);
    const html = generator.generateHTML();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Set document title for PDF filename
      const pdfFilename = filename || `inspection-report-${this.data.car?.id || 'unknown'}`;
      printWindow.document.title = pdfFilename;
      
      // Wait for images to load then trigger print (user can save as PDF)
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  /**
   * Print the report
   */
  async print(): Promise<void> {
    // Convert images to base64 first
    const dataWithBase64 = await this.convertImagesToBase64();
    const generator = new InspectionPDFGenerator(dataWithBase64, this.options);
    const html = generator.generateHTML();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for images to load
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}

/**
 * Quick function to generate and print report
 */
export async function printInspectionReport(
  data: InspectionPDFData,
  options?: Partial<PDFReportOptions>
): Promise<void> {
  const generator = new InspectionPDFGenerator(data, options);
  await generator.print();
}

/**
 * Quick function to download report
 */
export function downloadInspectionReport(
  data: InspectionPDFData,
  options?: Partial<PDFReportOptions>,
  filename?: string
): void {
  const generator = new InspectionPDFGenerator(data, options);
  generator.download(filename);
}
