const zlib = require('zlib');

const cacheService = require('../services/cache');

const isBuffer = (data) => Buffer.isBuffer(data);
const isReadableStream = (data) => data && typeof data.pipe === 'function';

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk.toString();
    });
    stream.on('end', () => resolve(data));
    stream.on('error', (error) => reject(error));
  });

module.exports = () => {
  return async (ctx, next) => {
    const cacheKey = `${ctx.request.method}:${ctx.request.url}`;

    // Check cache for an existing response
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      ctx.body = cachedResponse.body;
      ctx.set(cachedResponse.headers);
      ctx.set('X-Cache', 'HIT');
      return;
    }

    await next();

    if (ctx.status === 200) {
      try {
        let cacheableBody = ctx.body;

        // Handle Buffers
        if (isBuffer(cacheableBody)) {
          // Decompress if it's Gzipped
          if (ctx.response.headers['content-encoding'] === 'gzip') {
            cacheableBody = zlib.gunzipSync(cacheableBody).toString();
          } else {
            cacheableBody = cacheableBody.toString();
          }
        }

        // Handle Streams
        if (isReadableStream(cacheableBody)) {
          cacheableBody = await streamToString(cacheableBody);
        }

        // Ensure the body is serializable
        if (typeof cacheableBody !== 'string' && typeof cacheableBody !== 'object') {
          throw new Error('Response body is not serializable');
        }

        // Copy headers but remove compression-related ones
        const cacheableHeaders = { ...ctx.response.headers };
        delete cacheableHeaders['content-encoding'];
        delete cacheableHeaders['transfer-encoding'];

        // Cache the response for 60 seconds
        cacheService.set(
          cacheKey,
          { body: cacheableBody, headers: cacheableHeaders },
          60 // TTL: 60 seconds
        );
        ctx.set('X-Cache', 'MISS');
      } catch (error) {
        console.error('Failed to cache response:', error.message);
      }
    }
  };
};
