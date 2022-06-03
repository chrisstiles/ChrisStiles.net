import LRU from 'lru-cache';
import type { NextApiRequest, NextApiResponse } from 'next';

const rateLimit = (options: RateLimitOptions) => {
  const tokenCache = new LRU({
    max: options.uniqueTokenPerInterval,
    maxAge: options.interval
  });

  const getUserToken = (
    req: NextApiRequest,
    defaultToken: string = options.defaultToken
  ) => {
    return [req.headers['x-forwarded-for'] ?? defaultToken].flat()[0];
  };

  return {
    getUserToken,
    check(
      req: NextApiRequest,
      res: NextApiResponse,
      limit: number,
      token?: string
    ) {
      token ??= getUserToken(req, token);

      return new Promise<void>((resolve, reject) => {
        const tokenCount: any[] = tokenCache.get(token) || [0];

        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }

        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader(
          'X-RateLimit-Remaining',
          isRateLimited ? 0 : limit - currentUsage
        );

        return isRateLimited ? reject() : resolve();
      });
    }
  };
};

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval: number;
  defaultToken: string;
};

export default rateLimit;
