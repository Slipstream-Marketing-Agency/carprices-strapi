module.exports = {
  routes: [
    {
      method: "GET",
      path: "/car-trims/global-search",
      handler: "car-trim.globalSearch",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/fuel-types",
      handler: "car-trim.listFuelTypes",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/fueltypes-by-brand",
      handler: "car-trim.listFuelTypesByBrand",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/filtered-fueltypes",
      handler: "car-trim.listFilteredFuelTypes",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/price-range-by-brands",
      handler: "car-trim.getFilterLists",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/fuelList",
      handler: "car-trim.getFuelLists",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/brandList",
      handler: "car-trim.getBrandList",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/bodyList",
      handler: "car-trim.getBodyLists",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/cylinderList",
      handler: "car-trim.getCylinderList",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/driveList",
      handler: "car-trim.getDriveLists",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/transmissionList",
      handler: "car-trim.getTransmissionList",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/priceRange",
      handler: "car-trim.getPriceRange",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/powerRange",
      handler: "car-trim.getPowerRange",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/displacementRange",
      handler: "car-trim.getDisplacementRange",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/getSeatList",
      handler: "car-trim.getSeatList",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/filter",
      handler: "car-trim.fetchCarTrims",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/homefilter",
      handler: "car-trim.homeFilter",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/findonetrim/:modelSlug/:slug/:year",
      handler: "car-trim.findOneTrim",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/sitemap",
      handler: "car-trim.listAllTrims",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/car-trims/generate",
      handler: "car-trim.generateSitemap",
      config: {
        policies: [],
        auth: false,
      },
    },

    {
      method: "GET",
      path: "/car-trims/compare/:slug",
      handler: "car-trim.compareCarTrims",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      "method": "GET",
      "path": "/car-trims/years",
      "handler": "car-trim.getAvailableYears",
      "config": {
        "policies": [],
        auth: false,
      }
    },
    {
      method: "GET",
      path: "/car-trims/:year/brands",
      handler: "car-trim.getBrandsByYear", // Corrected handler name
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'GET',
      path: '/car-trims/:year/brands/:brandSlug/models',
      handler: 'car-trim.getModelsByYearAndBrand',
      config: {
        policies: [],
        auth: false,  // Set to true if authentication is needed
      },
    },
    {
      method: 'GET',
      path: '/car-trims/:year/brands/:brandSlug/models/:modelSlug/trims',
      handler: 'car-trim.getTrimsByYearBrandAndModel',
      config: {
        policies: [],
        auth: false,  // Set to true if authentication is needed
      },
    },

    {
      method: 'POST',
      path: '/car-trims/calculate-ownership-cost',
      handler: 'car-trim.calculateOwnershipCost',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/high-trims/:year/:brand',
      handler: 'car-trim.getHighTrimsByYearAndBrand',
      config: {
        auth: false, // Set to true if authentication is required
      },
    },

    // {
    //   method: "GET",
    //   path: "/car-trims/searchcars",
    //   handler: "car-trim.searchcars",
    //   config: {
    //     policies: [],
    //     auth: false,
    //   },
    // },
  ],
};
