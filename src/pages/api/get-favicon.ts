import { isValidURL } from '@helpers';
import cache from 'memory-cache';
import type { NextApiRequest, NextApiResponse } from 'next';

const cacheDuration = 1000 * 60 * 10; // 10 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { url, fallback = '', size = 48 } = req.query;

  if (!url) {
    return res.send(fallback);
  }

  if (Array.isArray(url)) url = url[0];
  if (Array.isArray(size)) size = size[0];

  if (!url.startsWith('http') && isValidURL(url)) {
    url = `https://${url}`;
  }

  try {
    const domain = new URL(url);
    const cacheKey = `${domain.hostname}-${size}`;
    const cachedUrl = cache.get(cacheKey);

    if (cachedUrl) {
      return res.send(cachedUrl);
    }

    const locations = getPotentialFaviconUrls(domain, size);
    console.log(locations);

    for (const location of locations) {
      const response = await fetch(location);

      if (response.ok) {
        cache.put(cacheKey, location, cacheDuration);
        return res.send(location);
      }
    }

    return res.send(fallback);
  } catch {
    return res.send(fallback);
  }
}

function getPotentialFaviconUrls(url: URL, size: number | string) {
  const domain = `${url.protocol}//${url.hostname}`;
  const domainAlt = url.hostname.startsWith('www')
    ? domain.replace('www.', '')
    : `${url.protocol}www.${url.hostname}`;

  const g1 = `https://www.google.com/s2/favicons?sz=${size}&domain=`;
  const g2 = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=${size}&url=`;

  return [
    `${g1}${domain}`,
    `${g2}${domain}`,
    `${g1}${domainAlt}`,
    `${g2}${domainAlt}`,
    `${domain}/favicon.svg`,
    `${domain}/favicon.ico`
  ];
}
