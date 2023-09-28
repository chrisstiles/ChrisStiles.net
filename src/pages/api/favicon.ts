import { isValidURL } from '@helpers';
import cache from 'memory-cache';
import { getAverageColor } from 'fast-average-color-node';
import { TinyColor } from '@ctrl/tinycolor';
import type { NextApiRequest, NextApiResponse } from 'next';

const cacheDuration = 1000 * 60 * 10; // 10 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fallback = null } = req.query;
  let { url, size = 96 } = req.query;

  if (!url) return res.json({ url: fallback, isFallback: true });

  if (Array.isArray(url)) url = url[0];
  if (Array.isArray(size)) size = size[0];

  if (!url.startsWith('http') && isValidURL(url)) {
    url = `https://${url}`;
  }

  try {
    const domain = new URL(url);
    const cacheKey = `${domain.hostname}-${size}`;
    const cachedUrl = cache.get(cacheKey);
    if (cachedUrl) return res.send(cachedUrl);

    const locations = getPotentialFaviconUrls(domain, size);

    for (const location of locations) {
      const response = await fetch(location);

      if (response.ok) {
        const isDark = await isDarkIcon(response);
        const data = { url: location, isDark };
        cache.put(cacheKey, data, cacheDuration);
        return res.json(data);
      }
    }

    const data = { url: fallback, isFallback: true };
    cache.put(cacheKey, data, cacheDuration);
    return res.json(data);
  } catch {
    return res.json({ url: fallback, isFallback: true });
  }
}

function getPotentialFaviconUrls(url: URL, size: number | string) {
  const domain = `${url.protocol}//${url.hostname}`;
  const domainAlt = url.hostname.startsWith('www')
    ? domain.replace('www.', '')
    : `${url.protocol}www.${url.hostname}`;

  const g1 = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=${size}&url=`;
  const g2 = `https://www.google.com/s2/favicons?sz=${size}&domain=`;

  return [
    `${g1}${domain}`,
    `${g2}${domain}`,
    `${g1}${domainAlt}`,
    `${g2}${domainAlt}`
  ];
}

async function isDarkIcon(response: Response) {
  try {
    const content = await response.arrayBuffer();
    const color = await getAverageColor(Buffer.from(content));
    return new TinyColor(color.hex).getBrightness() <= 100;
  } catch {
    // Ignore error and default to light icon
  }

  return false;
}

export type FaviconResponse = {
  url: string;
  isDark?: boolean;
  isFallback?: boolean;
};
