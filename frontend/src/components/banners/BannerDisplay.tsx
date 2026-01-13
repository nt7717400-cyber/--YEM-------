'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api, getImageUrl } from '@/lib/api';
import { Banner, BannerPosition } from '@/types/banner';

interface BannerDisplayProps {
  position: BannerPosition;
  className?: string;
  /** Show only the first banner (for single banner positions) */
  single?: boolean;
}

/**
 * BannerDisplay Component
 * Fetches and displays banners for a specific position
 * Handles click tracking and responsive image display
 */
export function BannerDisplay({ position, className = '', single = false }: BannerDisplayProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTracked, setViewTracked] = useState<Set<number>>(new Set());

  // Fetch banners for the position
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await api.getBannersByPosition(position);
        setBanners(single ? data.slice(0, 1) : data);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [position, single]);

  // Track view when banner becomes visible
  const trackView = useCallback(async (bannerId: number) => {
    if (viewTracked.has(bannerId)) return;
    
    try {
      await api.trackBannerView(bannerId);
      setViewTracked(prev => new Set(prev).add(bannerId));
    } catch (error) {
      console.error('Error tracking banner view:', error);
    }
  }, [viewTracked]);

  // Track views when banners are loaded
  useEffect(() => {
    banners.forEach(banner => {
      trackView(banner.id);
    });
  }, [banners, trackView]);

  // Handle click tracking
  const handleClick = async (banner: Banner) => {
    try {
      await api.trackBannerClick(banner.id);
    } catch (error) {
      console.error('Error tracking banner click:', error);
    }
  };

  if (loading) {
    return <BannerSkeleton className={className} />;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className={`banner-display ${className}`}>
      {banners.map((banner) => (
        <BannerItem
          key={banner.id}
          banner={banner}
          onClick={() => handleClick(banner)}
        />
      ))}
    </div>
  );
}

interface BannerItemProps {
  banner: Banner;
  onClick: () => void;
}

function BannerItem({ banner, onClick }: BannerItemProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use mobile image if available and on mobile device
  const imageUrl = isMobile && banner.imageMobileUrl
    ? getImageUrl(banner.imageMobileUrl)
    : getImageUrl(banner.imageUrl);

  const content = (
    <div className="relative w-full overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt={banner.title}
        width={1200}
        height={400}
        className="w-full h-auto object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        priority={banner.position === 'hero_top'}
      />
    </div>
  );

  // If banner has a link, wrap in Link component
  if (banner.linkUrl) {
    return (
      <Link
        href={banner.linkUrl}
        target={banner.linkTarget}
        rel={banner.linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className="block transition-opacity hover:opacity-95"
      >
        {content}
      </Link>
    );
  }

  return <div className="block">{content}</div>;
}

function BannerSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg w-full h-48 md:h-64" />
    </div>
  );
}

export default BannerDisplay;
