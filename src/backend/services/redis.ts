import { createClient } from 'redis';

const port = parseInt(process.env.REDIS_PORT) || 6379;

export const redisClient = createClient({
  disableOfflineQueue: true,
  url: `redis://${process.env.REDIS_HOST}:${port}`,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err)).connect();

redisClient.once('connect', () => {
  console.log('Redis Client Connected');
});
