'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { CarGrid } from '@/components/cars';
import { SearchBar } from '@/components/search';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { BannerDisplay, BannerPopup } from '@/components/banners';
import { api } from '@/lib/api';
import { Car, ShowroomSettings } from '@/types';

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cars, settingsData] = await Promise.all([
          api.getFeaturedCars(),
          api.getSettings(),
        ]);
        setFeaturedCars(cars);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <LoadingPage />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Popup Banner */}
      <BannerPopup delay={1500} />

      {/* Hero Top Banner */}
      <BannerDisplay 
        position="hero_top" 
        single 
        className="container mx-auto px-4 pt-4"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {settings?.name || 'معرض وحدة اليمن للسيارات'}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {settings?.description || 'أفضل السيارات الجديدة والمستعملة في اليمن'}
          </p>
          <SearchBar className="max-w-xl mx-auto" />
        </div>
      </section>

      {/* Hero Bottom Banner */}
      <BannerDisplay 
        position="hero_bottom" 
        single 
        className="container mx-auto px-4 py-4"
      />

      {/* Featured Cars Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">السيارات المميزة</h2>
            <Link href="/cars">
              <Button variant="outline">عرض الكل</Button>
            </Link>
          </div>
          <CarGrid
            cars={featuredCars}
            emptyMessage="لا توجد سيارات مميزة حالياً"
          />
        </div>
      </section>

      {/* Footer Above Banner */}
      <BannerDisplay 
        position="footer_above" 
        single 
        className="container mx-auto px-4 py-4"
      />

      {/* Contact Section */}
      {settings && (
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-muted-foreground mb-8">
              نحن هنا لمساعدتك في اختيار السيارة المناسبة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="w-full sm:w-auto">
                    <WhatsAppIcon className="h-5 w-5 ml-2" />
                    واتساب
                  </Button>
                </a>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone}`}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <PhoneIcon className="h-5 w-5 ml-2" />
                    اتصل بنا
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
}

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
