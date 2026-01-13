/**
 * LoadingProgress Component - مكون مؤشر تقدم التحميل
 * Requirements: 7.2 - THE System SHALL show loading progress indicator
 * 
 * Provides visual feedback during model loading with:
 * - Progress bar with percentage
 * - Animated loading state
 * - Arabic text support
 */

import { cn } from '@/lib/utils';

export interface LoadingProgressProps {
  /** Loading progress percentage (0-100) */
  progress: number;
  /** Optional message to display */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show percentage text */
  showPercentage?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether loading is complete */
  isComplete?: boolean;
}

/**
 * Loading progress bar with percentage indicator
 */
export function LoadingProgress({
  progress,
  message = 'جاري التحميل...',
  size = 'md',
  showPercentage = true,
  className,
  isComplete = false,
}: LoadingProgressProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  const sizeClasses = {
    sm: {
      container: 'gap-1.5',
      bar: 'h-1.5',
      text: 'text-xs',
      spinner: 'w-3 h-3',
    },
    md: {
      container: 'gap-2',
      bar: 'h-2',
      text: 'text-sm',
      spinner: 'w-4 h-4',
    },
    lg: {
      container: 'gap-3',
      bar: 'h-3',
      text: 'text-base',
      spinner: 'w-5 h-5',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div 
      className={cn(
        'flex flex-col items-center w-full max-w-xs',
        sizes.container,
        className
      )}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={message}
    >
      {/* Loading spinner and message */}
      <div className={cn('flex items-center gap-2', sizes.text)}>
        {!isComplete && (
          <div 
            className={cn(
              'border-2 border-primary border-t-transparent rounded-full animate-spin',
              sizes.spinner
            )}
          />
        )}
        {isComplete && (
          <svg 
            className={cn('text-green-500', sizes.spinner)} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        )}
        <span className="text-gray-600 font-medium">{message}</span>
      </div>

      {/* Progress bar */}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizes.bar
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            isComplete ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Percentage text */}
      {showPercentage && (
        <span className={cn('text-gray-500 font-mono', sizes.text)}>
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}

/**
 * 3D Model loading overlay component
 * Used inside the 3D viewer canvas
 */
export interface ModelLoadingOverlayProps {
  /** Loading progress percentage (0-100) */
  progress: number;
  /** Loading state */
  state: 'loading' | 'complete' | 'error';
  /** Error message if state is error */
  errorMessage?: string;
  /** Callback to retry loading */
  onRetry?: () => void;
}

export function ModelLoadingOverlay({
  progress,
  state,
  errorMessage,
  onRetry,
}: ModelLoadingOverlayProps) {
  if (state === 'complete') {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
      {state === 'loading' && (
        <LoadingProgress
          progress={progress}
          message="جاري تحميل النموذج..."
          size="lg"
          showPercentage={true}
        />
      )}
      
      {state === 'error' && (
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-medium">فشل تحميل النموذج</p>
            {errorMessage && (
              <p className="text-gray-500 text-sm mt-1">{errorMessage}</p>
            )}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default LoadingProgress;
