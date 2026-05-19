/**
 * Configurable cache — memory (node-cache) or Redis when CACHE_PROVIDER=redis.
 */

const NodeCache = require('node-cache');
const config = require('../../config/env');

const memoryStore = new NodeCache({ stdTTL: 300, checkperiod: 60 });

let redisClient = null;

async function getRedis() {
  if (config.cache.provider !== 'redis' || !config.cache.redisUrl) return null;
  if (redisClient) return redisClient;
  try {
    const { createClient } = require('redis');
    redisClient = createClient({ url: config.cache.redisUrl });
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.warn('Redis unavailable, falling back to memory cache:', err.message);
    return null;
  }
}

async function get(key) {
  const redis = await getRedis();
  if (redis) {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : undefined;
  }
  return memoryStore.get(key);
}

async function set(key, value, ttlSeconds) {
  const redis = await getRedis();
  if (redis) {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
    return;
  }
  memoryStore.set(key, value, ttlSeconds);
}

async function del(key) {
  const redis = await getRedis();
  if (redis) {
    await redis.del(key);
    return;
  }
  memoryStore.del(key);
}

async function delPattern(prefix) {
  const redis = await getRedis();
  if (redis) {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length) await redis.del(keys);
    return;
  }
  const keys = memoryStore.keys().filter((k) => k.startsWith(prefix));
  memoryStore.del(keys);
}

const CACHE_KEYS = Object.freeze({
  RULES_EFFECTIVE: 'rules:effective',
  ANALYTICS_DISTRIBUTION: 'analytics:distribution',
  ANALYTICS_REGIONAL: 'analytics:regional',
});

module.exports = {
  get,
  set,
  del,
  delPattern,
  CACHE_KEYS,
};
