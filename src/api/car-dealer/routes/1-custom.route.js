module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/car-dealers/by-filter',
      handler: 'car-dealer.findByBrandOrDealer',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
    {
      method: 'GET',
      path: '/car-dealers/slug/:slug',
      handler: 'car-dealer.findOneBySlug',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
