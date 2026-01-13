'use client';

import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, GripVertical, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

/**
 * FileUpload Component - Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 * 
 * Features:
 * - Drag-and-drop file upload (12.1)
 * - Upload progress for each file (12.2)
 * - Image previews before upload completes (12.3)
 * - Validation with clear error messages (12.4)
 * - Reorder images by drag-and-drop (12.5)
 * - Display file size and dimensions (12.6)
 * - Confirm before removing (12.7)
 */

export type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: FileStatus;
  error?: string;
  dimensions?: { width: number; height: number };
}

export interface FileUploadProps {
  /** Accepted file types (e.g., "image/*") */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Callback when files are uploaded */
  onUpload?: (files: UploadedFile[]) => void;
  /** Callback when files are reordered */
  onReorder?: (files: UploadedFile[]) => void;
  /** Callback when a file is removed */
  onRemove?: (fileId: string) => void;
  /** Initial files (for editing) */
  initialFiles?: UploadedFile[];
  /** Custom upload handler - if provided, handles the actual upload */
  uploadHandler?: (file: File, onProgress: (progress: number) => void) => Promise<void>;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// Utility functions for validation and formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateFile(
  file: File,
  accept?: string,
  maxSize?: number
): { valid: boolean; error?: string } {
  // Check file type
  if (accept) {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return fileType.startsWith(baseType);
      }
      return fileType === type;
    });
    
    if (!isAccepted) {
      return { valid: false, error: `نوع الملف غير مدعوم: ${file.type || fileExtension}` };
    }
  }
  
  // Check file size
  if (maxSize && file.size > maxSize) {
    return { 
      valid: false, 
      error: `حجم الملف (${formatFileSize(file.size)}) يتجاوز الحد الأقصى (${formatFileSize(maxSize)})` 
    };
  }
  
  return { valid: true };
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }
    
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function FileUpload({
  accept = 'image/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 20,
  onUpload,
  onReorder,
  onRemove,
  initialFiles = [],
  uploadHandler,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.preview.startsWith('blob:')) {
          URL.revokeObjectURL(f.preview);
        }
      });
    };
  }, []);

  const processFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.length;
    
    if (remainingSlots <= 0) {
      return;
    }
    
    const filesToProcess = fileArray.slice(0, remainingSlots);
    const processedFiles: UploadedFile[] = [];
    
    for (const file of filesToProcess) {
      const validation = validateFile(file, accept, maxSize);
      const id = generateFileId();
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
      
      let dimensions: { width: number; height: number } | undefined;
      if (file.type.startsWith('image/')) {
        try {
          dimensions = await getImageDimensions(file);
        } catch {
          // Ignore dimension errors
        }
      }
      
      const uploadedFile: UploadedFile = {
        id,
        file,
        preview,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error,
        dimensions,
      };
      
      processedFiles.push(uploadedFile);
    }
    
    setFiles(prev => {
      const updated = [...prev, ...processedFiles];
      return updated;
    });
    
    // Start uploading valid files
    for (const uploadedFile of processedFiles) {
      if (uploadedFile.status === 'pending' && uploadHandler) {
        simulateUpload(uploadedFile.id);
      }
    }
    
    onUpload?.(processedFiles);
  }, [files.length, maxFiles, accept, maxSize, uploadHandler, onUpload]);

  const simulateUpload = useCallback(async (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' as FileStatus, progress: 0 } : f
    ));
    
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    if (uploadHandler) {
      try {
        await uploadHandler(file.file, (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
          ));
        });
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'success' as FileStatus, progress: 100 } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'error' as FileStatus, 
            error: error instanceof Error ? error.message : 'فشل في رفع الملف' 
          } : f
        ));
      }
    } else {
      // Simulate upload progress for demo
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'success' as FileStatus, progress: 100 } : f
          ));
        } else {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: Math.min(progress, 99) } : f
          ));
        }
      }, 200);
    }
  }, [files, uploadHandler]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [processFiles]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
    onRemove?.(fileId);
    setDeleteConfirmId(null);
  }, [onRemove]);

  // Drag and drop reordering
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOverItem = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    setFiles(prev => {
      const newFiles = [...prev];
      const [draggedFile] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(index, 0, draggedFile);
      return newFiles;
    });
    setDraggedIndex(index);
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    onReorder?.(files);
  }, [files, onReorder]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone - Requirement 12.1 */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
          'transition-colors duration-200',
          isDragging && !disabled && 'border-primary bg-primary/5',
          !isDragging && !disabled && 'border-gray-300 hover:border-primary/50 hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-100'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="منطقة رفع الملفات"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileDialog();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          aria-hidden="true"
        />
        
        <Upload className={cn(
          'mx-auto h-12 w-12 mb-4',
          isDragging ? 'text-primary' : 'text-gray-400'
        )} />
        
        <p className="text-gray-600 mb-2">
          {isDragging ? (
            'أفلت الملفات هنا'
          ) : (
            <>
              اسحب الملفات هنا أو{' '}
              <span className="text-primary underline">اختر من جهازك</span>
            </>
          )}
        </p>
        
        <p className="text-sm text-gray-400">
          {accept === 'image/*' ? 'الصور فقط' : accept} • 
          الحد الأقصى {formatFileSize(maxSize)} لكل ملف •
          {maxFiles} ملفات كحد أقصى
        </p>
        
        {files.length >= maxFiles && (
          <p className="text-sm text-amber-600 mt-2">
            تم الوصول للحد الأقصى من الملفات
          </p>
        )}
      </div>

      {/* File List with Previews - Requirements 12.2, 12.3, 12.5, 12.6 */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div
              key={file.id}
              draggable={!disabled && file.status !== 'uploading'}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative group rounded-lg border overflow-hidden bg-white',
                'transition-all duration-200',
                draggedIndex === index && 'opacity-50 scale-95',
                file.status === 'error' && 'border-red-300 bg-red-50'
              )}
            >
              {/* Preview Image - Requirement 12.3 */}
              <div className="aspect-square relative bg-gray-100">
                {file.preview ? (
                  <Image
                    src={file.preview}
                    alt={file.file.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Progress Overlay - Requirement 12.2 */}
                {file.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                    <div className="w-3/4 bg-white/30 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-white text-sm mt-1">{Math.round(file.progress)}%</span>
                  </div>
                )}
                
                {/* Status Icons */}
                {file.status === 'success' && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
                
                {file.status === 'error' && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                )}
                
                {/* First image badge */}
                {index === 0 && (
                  <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    الرئيسية
                  </span>
                )}
                
                {/* Drag Handle - Requirement 12.5 */}
                {!disabled && file.status !== 'uploading' && (
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
                  </div>
                )}
                
                {/* Delete Button - Requirement 12.7 */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(file.id);
                    }}
                    className={cn(
                      'absolute top-2 right-2 bg-red-500 text-white rounded-full p-1',
                      'opacity-0 group-hover:opacity-100 transition-opacity',
                      'hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500'
                    )}
                    aria-label={`حذف ${file.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* File Info - Requirement 12.6 */}
              <div className="p-2 text-xs">
                <p className="truncate font-medium" title={file.file.name}>
                  {file.file.name}
                </p>
                <p className="text-gray-500">
                  {formatFileSize(file.file.size)}
                  {file.dimensions && (
                    <span className="mr-2">
                      • {file.dimensions.width}×{file.dimensions.height}
                    </span>
                  )}
                </p>
                {file.error && (
                  <p className="text-red-500 mt-1">{file.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog - Requirement 12.7 */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleRemoveFile(deleteConfirmId)}
        title="حذف الملف"
        description="هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />
    </div>
  );
}

export default FileUpload;
