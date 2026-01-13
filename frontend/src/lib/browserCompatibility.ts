/**
 * Browser Compatibility Utilities
 * أدوات التوافق مع المتصفحات
 * 
 * Requirements: 8.1
 * - Chrome, Firefox, Safari, Edge support
 * - Browser feature detection
 * - Polyfills and fallbacks
 */

// ============================================
// Types
// ============================================

export interface BrowserInfo {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'ie' | 'unknown';
  version: number;
  isSupported: boolean;
  isMobile: boolean;
  engine: 'blink' | 'gecko' | 'webkit' | 'unknown';
}

export interface WebGLInfo {
  supported: boolean;
  version: 1 | 2 | null;
  renderer: string | null;
  vendor: string | null;
  maxTextureSize: number;
  maxViewportDims: number[];
  extensions: string[];
}

export interface FeatureSupport {
  webgl: boolean;
  webgl2: boolean;
  webp: boolean;
  avif: boolean;
  touchEvents: boolean;
  pointerEvents: boolean;
  resizeObserver: boolean;
  intersectionObserver: boolean;
  requestAnimationFrame: boolean;
  performance: boolean;
  localStorage: boolean;
  indexedDB: boolean;
  webWorkers: boolean;
  offscreenCanvas: boolean;
  sharedArrayBuffer: boolean;
}

export interface CompatibilityReport {
  browser: BrowserInfo;
  webgl: WebGLInfo;
  features: FeatureSupport;
  recommendations: string[];
  canRun3D: boolean;
  performanceLevel: 'high' | 'medium' | 'low';
}

// ============================================
// Browser Detection
// ============================================

/**
 * Detect browser information from user agent
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      name: 'unknown',
      version: 0,
      isSupported: false,
      isMobile: false,
      engine: 'unknown',
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  let name: BrowserInfo['name'] = 'unknown';
  let version = 0;
  let engine: BrowserInfo['engine'] = 'unknown';

  // Detect browser and version
  if (ua.includes('edg/')) {
    name = 'edge';
    version = parseFloat(ua.match(/edg\/(\d+)/)?.[1] || '0');
    engine = 'blink';
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    name = 'chrome';
    version = parseFloat(ua.match(/chrome\/(\d+)/)?.[1] || '0');
    engine = 'blink';
  } else if (ua.includes('firefox')) {
    name = 'firefox';
    version = parseFloat(ua.match(/firefox\/(\d+)/)?.[1] || '0');
    engine = 'gecko';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    name = 'safari';
    version = parseFloat(ua.match(/version\/(\d+)/)?.[1] || '0');
    engine = 'webkit';
  } else if (ua.includes('opr') || ua.includes('opera')) {
    name = 'opera';
    version = parseFloat(ua.match(/(?:opr|opera)\/(\d+)/)?.[1] || '0');
    engine = 'blink';
  } else if (ua.includes('trident') || ua.includes('msie')) {
    name = 'ie';
    version = parseFloat(ua.match(/(?:msie |rv:)(\d+)/)?.[1] || '0');
    engine = 'unknown';
  }

  // Check if mobile
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

  // Check if supported (minimum versions)
  const minVersions: Record<string, number> = {
    chrome: 80,
    firefox: 75,
    safari: 13,
    edge: 80,
    opera: 67,
    ie: Infinity, // IE is not supported
  };

  const isSupported = version >= (minVersions[name] || 0);

  return { name, version, isSupported, isMobile, engine };
}

// ============================================
// WebGL Detection
// ============================================

/**
 * Detect WebGL capabilities
 */
export function detectWebGL(): WebGLInfo {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      supported: false,
      version: null,
      renderer: null,
      vendor: null,
      maxTextureSize: 0,
      maxViewportDims: [0, 0],
      extensions: [],
    };
  }

  const canvas = document.createElement('canvas');
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let version: 1 | 2 | null = null;

  // Try WebGL2 first
  try {
    gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    if (gl) version = 2;
  } catch {
    // WebGL2 not available
  }

  // Fall back to WebGL1
  if (!gl) {
    try {
      gl = (canvas.getContext('webgl') || 
            canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) version = 1;
    } catch {
      // WebGL1 not available
    }
  }

  if (!gl) {
    return {
      supported: false,
      version: null,
      renderer: null,
      vendor: null,
      maxTextureSize: 0,
      maxViewportDims: [0, 0],
      extensions: [],
    };
  }

  // Get debug info
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo 
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
    : gl.getParameter(gl.RENDERER);
  const vendor = debugInfo 
    ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
    : gl.getParameter(gl.VENDOR);

  // Get capabilities
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);

  // Get extensions
  const extensions = gl.getSupportedExtensions() || [];

  return {
    supported: true,
    version,
    renderer,
    vendor,
    maxTextureSize,
    maxViewportDims: Array.from(maxViewportDims),
    extensions,
  };
}

// ============================================
// Feature Detection
// ============================================

/**
 * Detect browser feature support
 */
export function detectFeatures(): FeatureSupport {
  if (typeof window === 'undefined') {
    return {
      webgl: false,
      webgl2: false,
      webp: false,
      avif: false,
      touchEvents: false,
      pointerEvents: false,
      resizeObserver: false,
      intersectionObserver: false,
      requestAnimationFrame: false,
      performance: false,
      localStorage: false,
      indexedDB: false,
      webWorkers: false,
      offscreenCanvas: false,
      sharedArrayBuffer: false,
    };
  }

  const webglInfo = detectWebGL();

  return {
    webgl: webglInfo.supported,
    webgl2: webglInfo.version === 2,
    webp: checkWebPSupport(),
    avif: checkAVIFSupport(),
    touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    pointerEvents: 'PointerEvent' in window,
    resizeObserver: 'ResizeObserver' in window,
    intersectionObserver: 'IntersectionObserver' in window,
    requestAnimationFrame: 'requestAnimationFrame' in window,
    performance: 'performance' in window && 'now' in performance,
    localStorage: checkLocalStorage(),
    indexedDB: 'indexedDB' in window,
    webWorkers: 'Worker' in window,
    offscreenCanvas: 'OffscreenCanvas' in window,
    sharedArrayBuffer: 'SharedArrayBuffer' in window,
  };
}

/**
 * Check WebP support
 */
function checkWebPSupport(): boolean {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check AVIF support (async check simplified to sync)
 */
function checkAVIFSupport(): boolean {
  // AVIF support is harder to detect synchronously
  // We'll assume modern browsers support it
  const browser = detectBrowser();
  if (browser.name === 'chrome' && browser.version >= 85) return true;
  if (browser.name === 'firefox' && browser.version >= 93) return true;
  if (browser.name === 'safari' && browser.version >= 16) return true;
  if (browser.name === 'edge' && browser.version >= 85) return true;
  return false;
}

/**
 * Check localStorage availability
 */
function checkLocalStorage(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Compatibility Report
// ============================================

/**
 * Generate a full compatibility report
 */
export function getCompatibilityReport(): CompatibilityReport {
  const browser = detectBrowser();
  const webgl = detectWebGL();
  const features = detectFeatures();
  const recommendations: string[] = [];

  // Check browser support
  if (!browser.isSupported) {
    recommendations.push(`يرجى تحديث متصفح ${browser.name} إلى أحدث إصدار`);
  }

  // Check WebGL
  if (!webgl.supported) {
    recommendations.push('متصفحك لا يدعم WebGL. سيتم استخدام العرض ثنائي الأبعاد');
  } else if (webgl.version === 1) {
    recommendations.push('متصفحك يدعم WebGL 1 فقط. قد تكون بعض الميزات محدودة');
  }

  // Check texture size
  if (webgl.maxTextureSize < 4096) {
    recommendations.push('حجم الـ Texture محدود. قد تكون جودة الصور أقل');
  }

  // Determine if 3D can run
  const canRun3D = webgl.supported && browser.isSupported;

  // Determine performance level
  let performanceLevel: 'high' | 'medium' | 'low' = 'medium';
  
  if (webgl.version === 2 && webgl.maxTextureSize >= 8192 && !browser.isMobile) {
    performanceLevel = 'high';
  } else if (!webgl.supported || webgl.maxTextureSize < 2048 || browser.name === 'ie') {
    performanceLevel = 'low';
  }

  // Mobile-specific recommendations
  if (browser.isMobile) {
    if (performanceLevel === 'high') performanceLevel = 'medium';
    recommendations.push('أنت تستخدم جهاز محمول. تم تحسين الإعدادات للأداء');
  }

  return {
    browser,
    webgl,
    features,
    recommendations,
    canRun3D,
    performanceLevel,
  };
}

// ============================================
// Browser-Specific Fixes
// ============================================

/**
 * Apply browser-specific CSS fixes
 */
export function applyBrowserFixes(): void {
  if (typeof document === 'undefined') return;

  const browser = detectBrowser();
  const html = document.documentElement;

  // Add browser class for CSS targeting
  html.classList.add(`browser-${browser.name}`);
  html.classList.add(`engine-${browser.engine}`);
  
  if (browser.isMobile) {
    html.classList.add('is-mobile');
  }

  // Safari-specific fixes
  if (browser.name === 'safari') {
    // Fix for Safari's handling of 100vh on mobile
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);

    // Fix for Safari's WebGL context loss
    html.classList.add('safari-webgl-fix');
  }

  // Firefox-specific fixes
  if (browser.name === 'firefox') {
    // Firefox has different scrollbar styling
    html.classList.add('firefox-scrollbar');
  }

  // Edge-specific fixes
  if (browser.name === 'edge') {
    // Edge legacy compatibility
    html.classList.add('edge-compat');
  }
}

/**
 * Get CSS vendor prefix for current browser
 */
export function getVendorPrefix(): string {
  const browser = detectBrowser();
  
  switch (browser.engine) {
    case 'webkit':
      return '-webkit-';
    case 'gecko':
      return '-moz-';
    case 'blink':
      return ''; // Blink doesn't need prefixes for most things
    default:
      return '';
  }
}

/**
 * Check if a CSS property is supported
 */
export function isCSSPropertySupported(property: string, value?: string): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return true; // Assume supported if we can't check
  }
  
  if (value) {
    return CSS.supports(property, value);
  }
  return CSS.supports(property, 'initial');
}

// ============================================
// Performance Hints
// ============================================

/**
 * Get recommended settings based on browser capabilities
 */
export function getRecommendedSettings(): {
  antialias: boolean;
  shadows: boolean;
  pixelRatio: number;
  maxTextureSize: number;
  enablePostProcessing: boolean;
} {
  const report = getCompatibilityReport();
  
  const settings = {
    antialias: true,
    shadows: true,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    maxTextureSize: 2048,
    enablePostProcessing: true,
  };

  switch (report.performanceLevel) {
    case 'low':
      settings.antialias = false;
      settings.shadows = false;
      settings.pixelRatio = 1;
      settings.maxTextureSize = 1024;
      settings.enablePostProcessing = false;
      break;
    case 'medium':
      settings.antialias = true;
      settings.shadows = true;
      settings.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      settings.maxTextureSize = 2048;
      settings.enablePostProcessing = false;
      break;
    case 'high':
      settings.antialias = true;
      settings.shadows = true;
      settings.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      settings.maxTextureSize = 4096;
      settings.enablePostProcessing = true;
      break;
  }

  return settings;
}

// ============================================
// Singleton Instance
// ============================================

let cachedReport: CompatibilityReport | null = null;

/**
 * Get cached compatibility report (singleton)
 */
export function getCachedCompatibilityReport(): CompatibilityReport {
  if (!cachedReport) {
    cachedReport = getCompatibilityReport();
  }
  return cachedReport;
}

/**
 * Clear cached report (useful for testing)
 */
export function clearCachedReport(): void {
  cachedReport = null;
}

const browserCompatibility = {
  detectBrowser,
  detectWebGL,
  detectFeatures,
  getCompatibilityReport,
  getCachedCompatibilityReport,
  applyBrowserFixes,
  getVendorPrefix,
  isCSSPropertySupported,
  getRecommendedSettings,
};

export default browserCompatibility;
