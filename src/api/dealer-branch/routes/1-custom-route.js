module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/dealer-branches',
      handler: 'dealer-branch.find',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
    {
      "method": "GET",
      "path": "/filter-dealer-branches-by-brand",
      "handler": "dealer-branch.filterByBrand",
      "config": {
        "policies": [],
        auth: false
      }
    }
  ],
};
