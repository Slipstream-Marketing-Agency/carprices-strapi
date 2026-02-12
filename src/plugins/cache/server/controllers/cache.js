const cacheService = require('../services/cache');

module.exports = {
  async clearCache(ctx) {
    try {
      cacheService.flush();
      ctx.send({ success: true, message: 'Cache cleared successfully' });
    } catch (error) {
      ctx.send({ success: false, message: 'Failed to clear cache' });
    }
  },
};
