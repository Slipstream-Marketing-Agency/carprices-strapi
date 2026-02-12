// src/plugins/cache/server/routes/cache.js
module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'myController.index',
    config: {
      middlewares: ['plugin::cache.cacheResponse'],
    },
  },
  {
    method: 'POST',
    path: '/clear',
    handler: 'cache.clearCache',
    config: {
      auth: false,
    },
  },
];
