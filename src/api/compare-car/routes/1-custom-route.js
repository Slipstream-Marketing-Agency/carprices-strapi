module.exports = {
  routes: [
    // ... existing routes
    {
      method: "GET",
      path: "/compare-car/home",
      handler: "compare-car.findCompareCar",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
