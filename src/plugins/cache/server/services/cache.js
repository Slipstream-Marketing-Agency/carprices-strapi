const NodeCache = require('node-cache');
const cache = new NodeCache();

module.exports = {
  set: (key, value, ttl = 60) => {
    const cacheableValue = JSON.parse(JSON.stringify(value)); // Ensure value is serializable
    cache.set(key, cacheableValue, ttl);
  },
  get: (key) => {
    return cache.get(key);
  },
  del: (key) => {
    cache.del(key);
  },
  flush: () => {
    cache.flushAll();
  },
};
