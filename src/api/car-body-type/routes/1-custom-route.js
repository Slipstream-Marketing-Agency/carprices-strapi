module.exports = {
  routes: [
    {
      method: "GET",
      path: "/car-body-type/generateSitemap",
      handler: "car-body-type.generateSitemap",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
