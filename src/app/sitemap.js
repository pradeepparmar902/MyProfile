import { db } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://credoras.org";

  // Get all public profiles
  let profiles = [];
  try {
    profiles = await db.profile.findMany({
      where: { isPublic: true },
    });
  } catch (error) {
    console.error("Failed to fetch profiles for sitemap:", error);
  }

  const profileUrls = profiles.map((profile) => ({
    url: `${baseUrl}/profile/${profile.username}`,
    lastModified: profile.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...profileUrls,
  ];
}
