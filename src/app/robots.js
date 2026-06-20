export default function robots() {
  const baseUrl = "https://credoras.org";

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/profile/'],
      disallow: ['/admin/', '/dashboard/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
