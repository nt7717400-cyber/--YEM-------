import { MetadataRoute } from 'next';

const BASE_URL = 'https://fazaacaetg.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/cars`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic car pages - fetch from API
  let carPages: MetadataRoute.Sitemap = [];
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.fazaacaetg.com';
    const response = await fetch(`${apiUrl}/cars?status=AVAILABLE&perPage=100`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (response.ok) {
      const data = await response.json();
      const cars = data.data || [];
      
      carPages = cars.map((car: { id: number; updated_at?: string }) => ({
        url: `${BASE_URL}/cars/${car.id}`,
        lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching cars for sitemap:', error);
  }

  return [...staticPages, ...carPages];
}
