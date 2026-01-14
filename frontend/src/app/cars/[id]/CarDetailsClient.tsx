'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout, Breadcrumb, generateCarDetailsBreadcrumb } from '@/components/layout';
import { CarGallery, CarSpecs, InspectionViewer } from '@/components/cars';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { BannerDisplay } from '@/components/banners';
import { api, getImageUrl } from '@/lib/api';
import { Car, ShowroomSettings } from '@/types';
import type { BodyPartId, PartStatus } from '@/types/inspection';
import type { Bid } from '@/types/auction';

/**
 * CarDetailsClient - Requirements: 3.1-3.8
 * 
 * Integrated car details page with:
 * - CarGallery with thumbnail navigation and lightbox (3.1, 3.2)
 * - Swipe gestures for mobile navigation (3.3)
 * - CarSpecs with organized sections and icons (3.4)
 * - Sticky contact buttons on mobile (3.5)
 * - Breadcrumb navigation (3.6)
 * - Animated sections on scroll (3.7)
 * - Related cars section (3.8)
 */

export default function CarDetailsClient() {
  const params = useParams();
  const id = params?.id as string;
  const [car, setCar] = useState<Car | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auction state
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [bidderName, setBidderName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [recentBids, setRecentBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (!id) return;
    
    async function loadData() {
      try {
        const [carData, settingsData] = await Promise.all([
          api.getCarById(parseInt(id)),
          api.getSettings(),
        ]);
        
        if (carData) {
          setCar(carData);
          // Increment view count
          api.incrementViewCount(parseInt(id)).catch(console.error);
          
          // Load bids if auction car
          if (carData.priceType === 'AUCTION' && carData.auction) {
            loadBids(carData.auction.id);
          }
        }
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading car:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Load bids for auction
  const loadBids = async (auctionId: number) => {
    try {
      const bidsData = await api.getAuctionBids(auctionId);
      setRecentBids(bidsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading bids:', error);
    }
  };

  // Countdown timer for auctions
  useEffect(() => {
    if (!car?.auction?.endTime) return;

    const auctionEndTime = car.auction.endTime;
    
    const updateCountdown = () => {
      const endTime = new Date(auctionEndTime).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft('انتهى المزاد');
        setIsAuctionEnded(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days} يوم ${hours} ساعة ${minutes} دقيقة`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
      } else {
        setTimeLeft(`${minutes} دقيقة ${seconds} ثانية`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [car?.auction?.endTime]);

  // Handle bid submission
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car?.auction) return;

    setBidError('');
    setBidSuccess('');

    if (!bidderName.trim()) {
      setBidError('الاسم مطلوب');
      return;
    }
    if (!phoneNumber.trim() || !/^7[0-9]{8}$/.test(phoneNumber)) {
      setBidError('رقم الهاتف غير صحيح (يجب أن يبدأ بـ 7 ويتكون من 9 أرقام)');
      return;
    }
    const amount = parseFloat(bidAmount);
    const minBid = car.auction.currentPrice + car.auction.minIncrement;
    if (isNaN(amount) || amount < minBid) {
      setBidError(`الحد الأدنى للمزايدة هو ${minBid.toLocaleString('ar-YE')} ريال`);
      return;
    }

    setBidding(true);
    try {
      await api.placeBid(car.auction.id, {
        bidderName: bidderName.trim(),
        phoneNumber: phoneNumber.trim(),
        amount
      });
      
      setBidSuccess('تم تقديم عرضك بنجاح!');
      setBidAmount('');
      
      const updatedCar = await api.getCarById(car.id);
      if (updatedCar) {
        setCar(updatedCar);
        if (updatedCar.auction) {
          loadBids(updatedCar.auction.id);
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setBidError(err.message || 'حدث خطأ في تقديم العرض');
    } finally {
      setBidding(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingPage />
      </MainLayout>
    );
  }

  if (!car) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">السيارة غير موجودة</h1>
          <p className="text-muted-foreground mb-8">
            عذراً، لم نتمكن من العثور على السيارة المطلوبة
          </p>
          <Link href="/cars">
            <Button>العودة لجميع السيارات</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const formattedPrice = new Intl.NumberFormat('ar-YE', {
    style: 'currency',
    currency: 'YER',
    maximumFractionDigits: 0,
  }).format(car.price);

  const images = car.images?.length > 0 ? car.images : [{ id: 0, url: '/placeholder-car.svg', order: 0, carId: car.id, createdAt: '' }];
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${car.name} - ${car.brand} ${car.model} ${car.year}`;
  
  // Generate breadcrumb items - Requirement 3.6
  const breadcrumbItems = generateCarDetailsBreadcrumb(car.name);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* Breadcrumb - Requirement 3.6 */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Section - Requirements 3.1, 3.2, 3.3 */}
          <div className="space-y-4">
            <CarGallery
              images={images}
              carName={car.name}
              enableLightbox={true}
              enableSwipe={true}
            />
            
            {/* Video Section */}
            {car.video && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">فيديو السيارة</h3>
                <VideoSection video={car.video} />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{car.name}</h1>
                <div className="flex gap-2 flex-shrink-0">
                  {car.isFeatured && (
                    <Badge className="bg-primary">مميزة</Badge>
                  )}
                  <Badge variant={car.condition === 'NEW' ? 'default' : 'secondary'}>
                    {car.condition === 'NEW' ? 'جديدة' : 'مستعملة'}
                  </Badge>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {car.brand} - {car.model} - {car.year}
              </p>
              
              {/* Auction Section */}
              {car.priceType === 'AUCTION' && car.auction ? (
                <AuctionSection
                  auction={car.auction}
                  timeLeft={timeLeft}
                  isAuctionEnded={isAuctionEnded}
                  bidderName={bidderName}
                  setBidderName={setBidderName}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  bidAmount={bidAmount}
                  setBidAmount={setBidAmount}
                  bidding={bidding}
                  bidError={bidError}
                  bidSuccess={bidSuccess}
                  recentBids={recentBids}
                  onPlaceBid={handlePlaceBid}
                />
              ) : (
                <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
              )}
            </div>

            <Separator />

            {/* Car Specifications - Requirement 3.4 */}
            <CarSpecs car={car} />

            {/* Description */}
            {car.description && (
              <>
                <Separator />
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-lg font-bold mb-2">الوصف</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {car.description}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Contact Buttons - Desktop */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-4">
              <ContactButtons settings={settings} car={car} shareUrl={shareUrl} />
            </div>

            {/* Share Buttons */}
            <ShareButtons shareUrl={shareUrl} shareText={shareText} />
          </div>
        </div>

        {/* Car Detail Banner */}
        <BannerDisplay position="car_detail" single className="mt-8" />

        {/* Inspection Section - For Used Cars Only */}
        {car.condition === 'USED' && car.bodyType && car.inspection && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="inspection-section">
            <InspectionViewer
              bodyType={car.bodyType}
              partsStatus={(() => {
                const bodyParts = car.inspection?.bodyParts;
                if (!bodyParts) return {} as Record<BodyPartId, PartStatus>;
                if (!Array.isArray(bodyParts)) return bodyParts as unknown as Record<BodyPartId, PartStatus>;
                const partsRecord: Record<BodyPartId, PartStatus> = {} as Record<BodyPartId, PartStatus>;
                bodyParts.forEach((part) => {
                  partsRecord[part.partId] = part.status;
                });
                return partsRecord;
              })()}
              mechanical={car.inspection.mechanical}
              damageDetails={car.inspection.damageDetails}
              car={car}
            />
          </div>
        )}
      </div>

      {/* Sticky Contact Buttons - Mobile - Requirement 3.5 */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background border-t p-4 z-40 shadow-lg">
        <div className="flex gap-3 max-w-lg mx-auto">
          <ContactButtons settings={settings} car={car} shareUrl={shareUrl} mobile />
        </div>
      </div>
    </MainLayout>
  );
}

// Video Section Component
function VideoSection({ video }: { video: Car['video'] }) {
  if (!video) return null;

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (video.type === 'YOUTUBE') {
    const embedUrl = getYoutubeEmbedUrl(video.url);
    if (!embedUrl) return null;
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <video
        src={video.url.startsWith('http') ? video.url : `${process.env.NEXT_PUBLIC_API_URL}${video.url}`}
        controls
        className="w-full h-full"
      />
    </div>
  );
}

// Auction Section Component
interface AuctionSectionProps {
  auction: NonNullable<Car['auction']>;
  timeLeft: string;
  isAuctionEnded: boolean;
  bidderName: string;
  setBidderName: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  bidAmount: string;
  setBidAmount: (value: string) => void;
  bidding: boolean;
  bidError: string;
  bidSuccess: string;
  recentBids: Bid[];
  onPlaceBid: (e: React.FormEvent) => void;
}

function AuctionSection({
  auction,
  timeLeft,
  isAuctionEnded,
  bidderName,
  setBidderName,
  phoneNumber,
  setPhoneNumber,
  bidAmount,
  setBidAmount,
  bidding,
  bidError,
  bidSuccess,
  recentBids,
  onPlaceBid,
}: AuctionSectionProps) {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 space-y-4" data-testid="auction-section">
      <div className="flex items-center justify-between">
        <Badge variant={auction.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-sm">
          <GavelIcon className="w-4 h-4 ml-1" />
          {auction.status === 'ACTIVE' ? 'مزاد نشط' : 
           auction.status === 'ENDED' ? 'انتهى المزاد' :
           auction.status === 'SOLD' ? 'تم البيع' : 'ملغي'}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="w-4 h-4" />
          <span>{auction.bidCount} مزايدة</span>
        </div>
      </div>

      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground mb-1">السعر الحالي</p>
        <p className="text-4xl font-bold text-primary">
          {new Intl.NumberFormat('ar-YE').format(auction.currentPrice)} <span className="text-lg">ريال</span>
        </p>
        {auction.currentPrice > auction.startingPrice && (
          <p className="text-sm text-muted-foreground mt-1">
            السعر الابتدائي: {new Intl.NumberFormat('ar-YE').format(auction.startingPrice)} ريال
          </p>
        )}
      </div>

      <div className="bg-background/50 rounded-md p-3 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          <ClockIcon className="w-4 h-4 inline ml-1" />
          الوقت المتبقي
        </p>
        <p className={`text-xl font-bold ${isAuctionEnded ? 'text-destructive' : 'text-foreground'}`}>
          {timeLeft || 'جاري الحساب...'}
        </p>
      </div>

      {auction.status === 'ACTIVE' && !isAuctionEnded && (
        <form onSubmit={onPlaceBid} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="الاسم" value={bidderName} onChange={(e) => setBidderName(e.target.value)} disabled={bidding} />
            <Input placeholder="رقم الهاتف (7xxxxxxxx)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={bidding} dir="ltr" />
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={`الحد الأدنى: ${(auction.currentPrice + auction.minIncrement).toLocaleString('ar-YE')}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              disabled={bidding}
              dir="ltr"
              className="flex-1"
            />
            <Button type="submit" disabled={bidding} className="min-w-[100px]">
              {bidding ? 'جاري...' : 'مزايدة'}
            </Button>
          </div>
          {bidError && <p className="text-sm text-destructive">{bidError}</p>}
          {bidSuccess && <p className="text-sm text-green-600">{bidSuccess}</p>}
        </form>
      )}

      {recentBids.length > 0 && (
        <div className="pt-2">
          <p className="text-sm font-medium mb-2">آخر المزايدات</p>
          <div className="space-y-1">
            {recentBids.map((bid, index) => (
              <div key={bid.id} className={`flex justify-between text-sm p-2 rounded ${index === 0 ? 'bg-primary/10' : 'bg-muted/50'}`}>
                <span>{bid.bidderName} <span dir="ltr" className="inline-block">{bid.maskedPhone}</span></span>
                <span className="font-medium">{new Intl.NumberFormat('ar-YE').format(bid.amount)} ريال</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Contact Buttons Component - Requirement 3.5
interface ContactButtonsProps {
  settings: ShowroomSettings | null;
  car: Car;
  shareUrl: string;
  mobile?: boolean;
}

function ContactButtons({ settings, car, shareUrl, mobile }: ContactButtonsProps) {
  const formattedPrice = new Intl.NumberFormat('ar-YE', {
    style: 'currency',
    currency: 'YER',
    maximumFractionDigits: 0,
  }).format(car.price);

  const whatsappMessage = encodeURIComponent(
`مرحباً، أنا مهتم بالسيارة التالية:

• الاسم: ${car.name}
• الماركة: ${car.brand}
• الموديل: ${car.model}
• سنة الصنع: ${car.year}
• السعر: ${formattedPrice}
• الحالة: ${car.condition === 'NEW' ? 'جديدة' : 'مستعملة'}${car.origin ? `
• الوارد: ${car.origin}` : ''}${car.condition === 'USED' && car.kilometers ? `
• الكيلومترات: ${new Intl.NumberFormat('ar-YE').format(car.kilometers)} كم` : ''}

رابط السيارة:
${shareUrl}

أرجو التواصل معي لمزيد من التفاصيل.`);

  return (
    <>
      {settings?.whatsapp && (
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button size={mobile ? 'default' : 'lg'} className="w-full">
            <WhatsAppIcon className="w-5 h-5 ml-2" />
            {mobile ? 'واتساب' : 'تواصل عبر واتساب'}
          </Button>
        </a>
      )}
      {settings?.phone && (
        <a href={`tel:${settings.phone}`} className="flex-1">
          <Button size={mobile ? 'default' : 'lg'} variant="outline" className="w-full">
            <PhoneIcon className="w-5 h-5 ml-2" />
            {mobile ? 'اتصال' : 'اتصل بنا'}
          </Button>
        </a>
      )}
    </>
  );
}

// Share Buttons Component
function ShareButtons({ shareUrl, shareText }: { shareUrl: string; shareText: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">مشاركة</h3>
      <div className="flex gap-2">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline" aria-label="مشاركة على فيسبوك">
            <FacebookIcon className="w-4 h-4" />
          </Button>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline" aria-label="مشاركة على تويتر">
            <TwitterIcon className="w-4 h-4" />
          </Button>
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline" aria-label="مشاركة على واتساب">
            <WhatsAppIcon className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}

// Icons
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

function GavelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
