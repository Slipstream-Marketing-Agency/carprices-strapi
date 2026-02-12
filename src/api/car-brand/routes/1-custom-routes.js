// path: /src/api/car-brand/routes/custom-car-brand.js (create this file if it doesn't exist)
module.exports = {
  routes: [


    // New Routes

    {
      method: 'GET',
      path: '/brands/details',
      handler: 'car-brand.findBrandDetails',
      config: {
        auth: false,
        cache: {
          enabled: true, // Enable caching for this route
          maxAge: 3600, // Cache duration in seconds
        },
      },
    },
    {
      method: 'GET',
      path: '/brands/models',
      handler: 'car-brand.findModelsByBrandSlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/brands/select-related-videos',
      handler: 'car-brand.findRelatedVideos',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/brands/related-dealers',
      handler: 'car-brand.findRelatedDealers',
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/filter-brands-by-dealer-branch",
      handler: "car-brand.filterByBranches",
      config: {
        policies: [],
        auth: false
      }
    },

    {
      method: "GET",
      path: "/find-brands-with-videos",
      handler: "car-brand.findBrandsWithSelectedVideos",
      config: {
        policies: [],
        auth: false
      }
    },
    // --------------------------------------------------

    {
      method: "GET",
      path: "/car-brands/names", // Custom path for fetching brand names
      handler: "car-brand.findBrandNames", // Reference the custom method in the controller
      config: {
        auth: false, // Optionally, specify authentication requirements
      },
    },
    {
      // Define a new route for fetching a brand with its models
      method: "GET",
      path: "/car-brands/:brandId/with-models",
      handler: "car-brand.findBrandWithModels",
      config: {
        auth: false, // Adjust authentication as needed
      },
    },
    {
      method: 'GET',
      path: '/car-brands/:slug',
      handler: 'car-brand.findOneBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-brands-dealers",
      handler: "car-brand.findBrandsWithDealers",
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
    {
      method: "GET",
      path: "/brands-with-videos",
      handler: "car-brand.findBrandsWithVideos",
      config: {
        auth: false, // Set to true if authentication is needed
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'GET',
      path: '/list-cars',
      handler: 'car-brand.listCars',
      config: {
        auth: false, // Set this to true if you want authentication
      },
    },
    {
      method: "GET",
      path: "/latest-model-years",
      handler: "car-brand.findBrandsByLatestModelYear",
      config: {
        auth: false, // Set to true if authentication is required
      },
    },

  ],
};
