import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RATE_LIMITER_CONFIG } from '../configs';
import { redisClient } from './redis';

export class RateLimiterService {
  client: any;
  rateLimiter: RateLimiterRedis;
  constructor() {
    this.client = redisClient;
  }
  #getRateLimiter(key: string): RateLimiterRedis {
    if (this.rateLimiter) {
      return this.rateLimiter;
    }
    const config = {
      keyPrefix: key,
      ...RATE_LIMITER_CONFIG[key],
    };

    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      ...config,
      useRedisPackage: true,
    });
    return this.rateLimiter;
  }

  #getCustomRateLimiter(
    key: string,
    customConfig: {
      points: number;
      duration: number;
      blockDuration: number;
    },
  ): RateLimiterRedis {
    if (this.rateLimiter) {
      return this.rateLimiter;
    }
    const config = {
      keyPrefix: key,
      ...customConfig,
    };

    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      ...config,
      useRedisPackage: true,
    });
    return this.rateLimiter;
  }

  async consume(
    prefix: string,
    key: string,
    customConfig?: {
      points: number;
      duration: number;
      blockDuration: number;
    },
  ): Promise<{ status: boolean; message: string; retryDuration: number }> {
    let rateLimiter: RateLimiterRedis;

    if (customConfig && Object.keys(customConfig).length) {
      rateLimiter = this.#getCustomRateLimiter(prefix, customConfig);
    } else {
      rateLimiter = this.#getRateLimiter(prefix);
    }

    const stats = await rateLimiter.get(`${prefix}_${key}`);

    let retrySecs = 0;
    if (stats !== null && stats.consumedPoints > rateLimiter.points) {
      retrySecs = Math.round(stats.msBeforeNext / 1000) || 1;
    }

    const failResponse = {
      status: false,
      message: 'Too Many Attempts',
      retryDuration: 0,
    };

    if (customConfig && Object.keys(customConfig).length) {
      failResponse['retryDuration'] = Math.ceil((retrySecs || customConfig.blockDuration) / 60);
      failResponse.message = `Too Many Attempts. Retry after ${failResponse['retryDuration']} mins`;
    } else {
      failResponse['retryDuration'] = Math.ceil(
        (retrySecs || RATE_LIMITER_CONFIG[prefix].blockDuration) / 60,
      );
      failResponse.message = `Too Many Attempts. Retry after ${failResponse['retryDuration']} mins`;
    }

    if (retrySecs > 0) {
      return failResponse;
    }

    try {
      await rateLimiter.consume(`${prefix}_${key}`);
    } catch (error) {
      return failResponse;
    }

    return {
      status: true,
      message: '',
      retryDuration: 0,
    };
  }

  reset(prefix: string, key: string) {
    const rateLimiter = this.#getRateLimiter(prefix);
    return rateLimiter.delete(`${prefix}_${key}`);
  }
}
