import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://fazaacaetg.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/cars/', '/about/'],
        disallow: ['/admin/', '/api/', '/_next/static/', '/_next/image/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
