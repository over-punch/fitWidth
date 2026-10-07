// Sitemap for fitwidth.com: the tool page plus the talk, transcript, paper and data.
import type { MetadataRoute } from 'next'

/** Lists every public route. lastModified is fixed so the timestamp only changes with real content updates. */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: 'https://fitwidth.com', lastModified: '2026-10-07', changeFrequency: 'monthly', priority: 1 },
		{ url: 'https://fitwidth.com/paper', lastModified: '2026-10-07', changeFrequency: 'monthly', priority: 0.7 },
		{ url: 'https://fitwidth.com/talk', lastModified: '2026-10-07', changeFrequency: 'monthly', priority: 0.6 },
		{ url: 'https://fitwidth.com/talk/transcript', lastModified: '2026-10-07', changeFrequency: 'monthly', priority: 0.5 },
		{ url: 'https://fitwidth.com/paper/data', lastModified: '2026-10-07', changeFrequency: 'monthly', priority: 0.5 },
	]
}
