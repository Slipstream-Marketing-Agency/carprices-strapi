module.exports = {
  routes: [
    {
      method: "GET",
      path: "/home/find", // Adjust the path as needed
      handler: "home.customMethod", // Reference the custom method
      config: {
        auth: false,
      },
    },
    // Include other routes as needed
  ],
};
