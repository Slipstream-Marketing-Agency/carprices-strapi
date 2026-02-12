module.exports = {
  routes: [
    
    {
      method: "GET",
      path: "/car-models/find-model/:slug",
      handler: "car-model.findOldModel",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-models/search",
      handler: "car-model.unifiedSearch",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-models/:modelId/years-under-trims",
      handler: "car-model.listYearsUnderTrims",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-models/:modelId/trims/:year",
      handler: "car-model.findTrimsByYear",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-models/find-one-model/:brandslug/:slug/:year",
      handler: "car-model.findOneBySlugWithHighTrim",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/car-models/latest-year/:slug',
      handler: 'car-model.findLatestYearBySlug',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/models-with-videos",
      handler: "car-model.findModelsWithVideos",
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
    {
      method: 'GET',
      path: '/car-models/brand/:brandSlug',
      handler: 'car-model.findModelsByBrandSlug',
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
  ],
};
