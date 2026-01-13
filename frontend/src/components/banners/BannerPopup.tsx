'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api, getImageUrl } from '@/lib/api';
import { Banner } from '@/types/banner';

const POPUP_SESSION_KEY = 'banner_popup_shown';

interface BannerPopupProps {
  /** Delay in milliseconds before showing the popup */
  delay?: number;
  /** Custom class name for the popup container */
  className?: string;
}

/**
 * BannerPopup Component
 * Shows a popup banner on page load
 * Uses sessionStorage to avoid repeat display during the same session
 */
export function BannerPopup({ delay = 1000, className = '' }: BannerPopupProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if popup was already shown in this session
  const wasShownInSession = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem(POPUP_SESSION_KEY) === 'true';
  }, []);

  // Mark popup as shown in session
  const markAsShown = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
    }
  }, []);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch popup banner
  useEffect(() => {
    if (wasShownInSession()) return;

    const fetchPopupBanner = async () => {
      try {
        const banners = await api.getBannersByPosition('popup');
        if (banners.length > 0) {
          setBanner(banners[0]);
          // Show popup after delay
          setTimeout(() => {
            setIsVisible(true);
            markAsShown();
            // Track view
            api.trackBannerView(banners[0].id).catch(console.error);
          }, delay);
        }
      } catch (error) {
        console.error('Error fetching popup banner:', error);
      }
    };

    fetchPopupBanner();
  }, [delay, wasShownInSession, markAsShown]);

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
  };

  // Handle click tracking
  const handleClick = async () => {
    if (banner) {
      try {
        await api.trackBannerClick(banner.id);
      } catch (error) {
        console.error('Error tracking banner click:', error);
      }
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!banner || !isVisible) {
    return null;
  }

  // Use mobile image if available and on mobile device
  const imageUrl = isMobile && banner.imageMobileUrl
    ? getImageUrl(banner.imageMobileUrl)
    : getImageUrl(banner.imageUrl);

  const content = (
    <div className="relative">
      <Image
        src={imageUrl}
        alt={banner.title}
        width={600}
        height={400}
        className="w-full h-auto object-cover rounded-lg"
        sizes="(max-width: 768px) 90vw, 600px"
        priority
      />
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-banner-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup content */}
      <div className="relative max-w-lg w-full animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="إغلاق"
        >
          <CloseIcon className="h-5 w-5 text-gray-600" />
        </button>

        {/* Banner content */}
        {banner.linkUrl ? (
          <Link
            href={banner.linkUrl}
            target={banner.linkTarget}
            rel={banner.linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            className="block"
          >
            {content}
          </Link>
        ) : (
          content
        )}

        {/* Hidden title for accessibility */}
        <span id="popup-banner-title" className="sr-only">
          {banner.title}
        </span>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default BannerPopup;
