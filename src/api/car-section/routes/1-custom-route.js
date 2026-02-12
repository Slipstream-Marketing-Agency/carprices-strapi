module.exports = {
  routes: [
    {
      method: "GET",
      path: "/car-sections/findAll",
      handler: "car-section.findAll",
      config: {
        policies: [],
        auth: false,
      },
    },
    // other routes...
  ],
};
