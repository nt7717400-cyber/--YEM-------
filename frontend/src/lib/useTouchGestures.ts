/**
 * Touch Gestures Hook
 * خطاف إيماءات اللمس للتفاعل المحسّن
 * 
 * Requirements: 6.2
 * - Enhanced pinch-to-zoom
 * - Gesture support (swipe, rotate)
 * - Smooth touch interactions
 */

import { useRef, useCallback } from 'react';

// ============================================
// Types
// ============================================

export interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export interface GestureState {
  /** Is currently performing a gesture */
  isGesturing: boolean;
  /** Gesture type */
  gestureType: 'none' | 'pan' | 'pinch' | 'rotate';
  /** Number of active touches */
  touchCount: number;
  /** Initial touch positions */
  initialTouches: TouchPoint[];
  /** Current touch positions */
  currentTouches: TouchPoint[];
  /** Pinch scale (1 = no change) */
  pinchScale: number;
  /** Pinch center point */
  pinchCenter: { x: number; y: number };
  /** Rotation angle in radians */
  rotationAngle: number;
  /** Pan delta */
  panDelta: { x: number; y: number };
  /** Velocity for momentum */
  velocity: { x: number; y: number };
}

export interface TouchGestureConfig {
  /** Minimum distance to start a pan gesture */
  panThreshold: number;
  /** Minimum scale change to start a pinch gesture */
  pinchThreshold: number;
  /** Enable momentum after gesture ends */
  enableMomentum: boolean;
  /** Momentum decay factor (0-1) */
  momentumDecay: number;
  /** Pinch sensitivity multiplier */
  pinchSensitivity: number;
  /** Rotation sensitivity multiplier */
  rotationSensitivity: number;
}

export interface TouchGestureCallbacks {
  onPinchStart?: (scale: number, center: { x: number; y: number }) => void;
  onPinchMove?: (scale: number, center: { x: number; y: number }) => void;
  onPinchEnd?: (scale: number) => void;
  onPanStart?: (delta: { x: number; y: number }) => void;
  onPanMove?: (delta: { x: number; y: number }) => void;
  onPanEnd?: (velocity: { x: number; y: number }) => void;
  onRotateStart?: (angle: number) => void;
  onRotateMove?: (angle: number) => void;
  onRotateEnd?: (angle: number) => void;
  onDoubleTap?: (position: { x: number; y: number }) => void;
}

// ============================================
// Default Configuration
// ============================================

export const DEFAULT_TOUCH_GESTURE_CONFIG: TouchGestureConfig = {
  panThreshold: 10,
  pinchThreshold: 0.05,
  enableMomentum: true,
  momentumDecay: 0.95,
  pinchSensitivity: 1.0,
  rotationSensitivity: 1.0,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate distance between two points
 */
function getDistance(p1: TouchPoint, p2: TouchPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate center point between two points
 */
function getCenter(p1: TouchPoint, p2: TouchPoint): { x: number; y: number } {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Calculate angle between two points
 */
function getAngle(p1: TouchPoint, p2: TouchPoint): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Convert Touch to TouchPoint
 */
function touchToPoint(touch: { clientX: number; clientY: number; identifier: number }): TouchPoint {
  return {
    x: touch.clientX,
    y: touch.clientY,
    id: touch.identifier,
  };
}

// ============================================
// Touch Gestures Hook
// ============================================

export interface UseTouchGesturesOptions {
  config?: Partial<TouchGestureConfig>;
  callbacks?: TouchGestureCallbacks;
  enabled?: boolean;
}

export interface UseTouchGesturesResult {
  /** Current gesture state */
  gestureState: GestureState;
  /** Bind these handlers to your element */
  handlers: {
    onTouchStart: (event: React.TouchEvent | TouchEvent) => void;
    onTouchMove: (event: React.TouchEvent | TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent | TouchEvent) => void;
    onTouchCancel: (event: React.TouchEvent | TouchEvent) => void;
  };
  /** Reset gesture state */
  reset: () => void;
  /** Check if currently gesturing */
  isGesturing: boolean;
}

export function useTouchGestures(
  options: UseTouchGesturesOptions = {}
): UseTouchGesturesResult {
  const { 
    config: configOverrides, 
    callbacks,
    enabled = true,
  } = options;

  const configRef = useRef<TouchGestureConfig>({
    ...DEFAULT_TOUCH_GESTURE_CONFIG,
    ...configOverrides,
  });

  const gestureStateRef = useRef<GestureState>({
    isGesturing: false,
    gestureType: 'none',
    touchCount: 0,
    initialTouches: [],
    currentTouches: [],
    pinchScale: 1,
    pinchCenter: { x: 0, y: 0 },
    rotationAngle: 0,
    panDelta: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  });

  const initialDistanceRef = useRef(0);
  const initialAngleRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const lastTouchPositionRef = useRef<{ x: number; y: number } | null>(null);
  const velocityTrackingRef = useRef<{ x: number; y: number; time: number }[]>([]);

  // Reset gesture state
  const reset = useCallback(() => {
    gestureStateRef.current = {
      isGesturing: false,
      gestureType: 'none',
      touchCount: 0,
      initialTouches: [],
      currentTouches: [],
      pinchScale: 1,
      pinchCenter: { x: 0, y: 0 },
      rotationAngle: 0,
      panDelta: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
    };
    initialDistanceRef.current = 0;
    initialAngleRef.current = 0;
    velocityTrackingRef.current = [];
  }, []);

  // Handle touch start
  const onTouchStart = useCallback((event: React.TouchEvent | TouchEvent) => {
    if (!enabled) return;

    const touches = Array.from(event.touches).map(touchToPoint);
    const state = gestureStateRef.current;
    const now = Date.now();

    // Check for double tap
    if (touches.length === 1) {
      const touch = touches[0];
      if (
        lastTouchPositionRef.current &&
        now - lastTouchTimeRef.current < 300 &&
        getDistance(touch, { ...lastTouchPositionRef.current, id: 0 }) < 30
      ) {
        callbacks?.onDoubleTap?.({ x: touch.x, y: touch.y });
        lastTouchTimeRef.current = 0;
        lastTouchPositionRef.current = null;
        return;
      }
      lastTouchTimeRef.current = now;
      lastTouchPositionRef.current = { x: touch.x, y: touch.y };
    }

    state.touchCount = touches.length;
    state.initialTouches = touches;
    state.currentTouches = touches;
    state.isGesturing = true;

    if (touches.length === 2) {
      // Initialize pinch/rotate
      initialDistanceRef.current = getDistance(touches[0], touches[1]);
      initialAngleRef.current = getAngle(touches[0], touches[1]);
      state.pinchCenter = getCenter(touches[0], touches[1]);
      state.gestureType = 'pinch';
      callbacks?.onPinchStart?.(1, state.pinchCenter);
    } else if (touches.length === 1) {
      state.gestureType = 'pan';
      state.panDelta = { x: 0, y: 0 };
      callbacks?.onPanStart?.(state.panDelta);
    }

    velocityTrackingRef.current = [{ x: touches[0]?.x || 0, y: touches[0]?.y || 0, time: now }];
  }, [enabled, callbacks]);

  // Handle touch move
  const onTouchMove = useCallback((event: React.TouchEvent | TouchEvent) => {
    if (!enabled) return;

    const touches = Array.from(event.touches).map(touchToPoint);
    const state = gestureStateRef.current;
    const config = configRef.current;
    const now = Date.now();

    if (!state.isGesturing || touches.length === 0) return;

    state.currentTouches = touches;

    if (touches.length === 2 && state.gestureType === 'pinch') {
      // Calculate pinch scale
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = (currentDistance / initialDistanceRef.current) * config.pinchSensitivity;
      state.pinchScale = scale;
      state.pinchCenter = getCenter(touches[0], touches[1]);

      // Calculate rotation
      const currentAngle = getAngle(touches[0], touches[1]);
      state.rotationAngle = (currentAngle - initialAngleRef.current) * config.rotationSensitivity;

      callbacks?.onPinchMove?.(scale, state.pinchCenter);
      if (Math.abs(state.rotationAngle) > 0.1) {
        callbacks?.onRotateMove?.(state.rotationAngle);
      }
    } else if (touches.length === 1 && state.gestureType === 'pan') {
      // Calculate pan delta
      const initial = state.initialTouches[0];
      if (initial) {
        state.panDelta = {
          x: touches[0].x - initial.x,
          y: touches[0].y - initial.y,
        };
        callbacks?.onPanMove?.(state.panDelta);
      }

      // Track velocity
      velocityTrackingRef.current.push({ x: touches[0].x, y: touches[0].y, time: now });
      // Keep only last 5 points for velocity calculation
      if (velocityTrackingRef.current.length > 5) {
        velocityTrackingRef.current.shift();
      }
    }
  }, [enabled, callbacks]);

  // Handle touch end
  const onTouchEnd = useCallback((event: React.TouchEvent | TouchEvent) => {
    if (!enabled) return;

    const state = gestureStateRef.current;
    const config = configRef.current;
    const remainingTouches = Array.from(event.touches).map(touchToPoint);

    // Calculate velocity from tracking data
    if (config.enableMomentum && velocityTrackingRef.current.length >= 2) {
      const points = velocityTrackingRef.current;
      const first = points[0];
      const last = points[points.length - 1];
      const timeDelta = (last.time - first.time) / 1000; // Convert to seconds
      
      if (timeDelta > 0) {
        state.velocity = {
          x: (last.x - first.x) / timeDelta,
          y: (last.y - first.y) / timeDelta,
        };
      }
    }

    if (state.gestureType === 'pinch') {
      callbacks?.onPinchEnd?.(state.pinchScale);
      if (Math.abs(state.rotationAngle) > 0.1) {
        callbacks?.onRotateEnd?.(state.rotationAngle);
      }
    } else if (state.gestureType === 'pan') {
      callbacks?.onPanEnd?.(state.velocity);
    }

    if (remainingTouches.length === 0) {
      // All touches ended
      state.isGesturing = false;
      state.gestureType = 'none';
      state.touchCount = 0;
    } else if (remainingTouches.length === 1) {
      // Transition from pinch to pan
      state.gestureType = 'pan';
      state.touchCount = 1;
      state.initialTouches = remainingTouches;
      state.currentTouches = remainingTouches;
      state.pinchScale = 1;
      state.rotationAngle = 0;
    }
  }, [enabled, callbacks]);

  // Handle touch cancel
  const onTouchCancel = useCallback(() => {
    reset();
  }, [reset]);

  return {
    gestureState: gestureStateRef.current,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
    },
    reset,
    isGesturing: gestureStateRef.current.isGesturing,
  };
}

export default useTouchGestures;
