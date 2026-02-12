module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/car-reviews',
        handler: 'car-review.create',
      },
      {
        method: 'GET',
        path: '/car-reviews',
        handler: 'car-review.find',
        config: {
          auth: false,
        },
      },
      {
        method: 'PUT',
        path: '/car-reviews/:id/helpful',
        handler: 'car-review.updateHelpful',
        config: {
          auth: false, // Allow public access if needed
        },
      },
    ],
  };
  