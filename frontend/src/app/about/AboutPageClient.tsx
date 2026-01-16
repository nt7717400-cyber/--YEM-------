'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { ShowroomSettings } from '@/types';

export default function AboutPageClient() {
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">من نحن</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            تعرف على معرض وحدة اليمن للسيارات
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* About Section */}
          <section className="space-y-6" aria-labelledby="about-heading">
            <Card>
              <CardContent className="p-6">
                <h2 id="about-heading" className="text-2xl font-bold mb-4">
                  {settings?.name || 'معرض وحدة اليمن للسيارات'}
                </h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {settings?.description ||
                    'نحن معرض متخصص في بيع السيارات الجديدة والمستعملة بأفضل الأسعار وأعلى جودة. نسعى دائماً لتقديم أفضل الخدمات لعملائنا الكرام.'}
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">معلومات التواصل</h2>
                <address className="space-y-4 not-italic">
                  {settings?.address && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon
                        className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium">العنوان</p>
                        <p className="text-muted-foreground">{settings.address}</p>
                      </div>
                    </div>
                  )}

                  {settings?.phone && (
                    <div className="flex items-start gap-3">
                      <PhoneIcon
                        className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium">رقم الهاتف</p>
                        <a
                          href={`tel:${settings.phone}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          dir="ltr"
                        >
                          {settings.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {settings?.whatsapp && (
                    <div className="flex items-start gap-3">
                      <WhatsAppIcon
                        className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium">واتساب</p>
                        <a
                          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          dir="ltr"
                        >
                          {settings.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {settings?.workingHours && (
                    <div className="flex items-start gap-3">
                      <ClockIcon
                        className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium">ساعات العمل</p>
                        <p className="text-muted-foreground">{settings.workingHours}</p>
                      </div>
                    </div>
                  )}
                </address>

                <Separator className="my-6" />

                {/* Contact Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {settings?.whatsapp && (
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full">
                        <WhatsAppIcon className="w-5 h-5 ml-2" aria-hidden="true" />
                        تواصل عبر واتساب
                      </Button>
                    </a>
                  )}
                  {settings?.phone && (
                    <a href={`tel:${settings.phone}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <PhoneIcon className="w-5 h-5 ml-2" aria-hidden="true" />
                        اتصل بنا
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Map Section */}
          <section className="space-y-6" aria-labelledby="location-heading">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <h2 id="location-heading" className="sr-only">
                  موقعنا على الخريطة
                </h2>
                {settings?.mapLatitude && settings?.mapLongitude ? (
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${settings.mapLongitude}!3d${settings.mapLatitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sar!2s!4v1234567890`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                    title="موقع المعرض على الخريطة"
                  />
                ) : (
                  <div className="h-[400px] bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
                      <p>لم يتم تحديد الموقع على الخريطة</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">لماذا تختارنا؟</h2>
                <div className="grid grid-cols-2 gap-4">
                  <article className="text-center p-4 bg-muted/50 rounded-lg">
                    <CarIcon className="w-8 h-8 mx-auto mb-2 text-primary" aria-hidden="true" />
                    <p className="font-bold">تشكيلة واسعة</p>
                    <p className="text-sm text-muted-foreground">سيارات متنوعة</p>
                  </article>
                  <article className="text-center p-4 bg-muted/50 rounded-lg">
                    <ShieldIcon className="w-8 h-8 mx-auto mb-2 text-primary" aria-hidden="true" />
                    <p className="font-bold">ضمان الجودة</p>
                    <p className="text-sm text-muted-foreground">فحص شامل</p>
                  </article>
                  <article className="text-center p-4 bg-muted/50 rounded-lg">
                    <PriceTagIcon className="w-8 h-8 mx-auto mb-2 text-primary" aria-hidden="true" />
                    <p className="font-bold">أسعار منافسة</p>
                    <p className="text-sm text-muted-foreground">أفضل العروض</p>
                  </article>
                  <article className="text-center p-4 bg-muted/50 rounded-lg">
                    <HeadsetIcon className="w-8 h-8 mx-auto mb-2 text-primary" aria-hidden="true" />
                    <p className="font-bold">دعم متواصل</p>
                    <p className="text-sm text-muted-foreground">خدمة عملاء</p>
                  </article>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

// Icons
function MapPinIcon({ className }: { className?: string }) {
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
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
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
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
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
        d="M8 17h8M8 17v-4m8 4v-4m-8 0h8m-8 0l-2-4h12l-2 4M6 17H4a1 1 0 01-1-1v-2a1 1 0 011-1h2m14 4h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
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
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function PriceTagIcon({ className }: { className?: string }) {
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
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"
      />
    </svg>
  );
}
