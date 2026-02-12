module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/car-videos/by-filter',
            handler: 'car-video.findByTrendingOrSort',
            config: {
                policies: [],
                middlewares: [],
                auth: false, // Set to true if authentication is required
            },
        },
        {
            method: 'GET',
            path: '/car-videos/by-brands-and-models',
            handler: 'car-video.findByBrandsAndModels',
            config: {
                policies: [],
                auth: false, 
            },
        },
        {
            method: 'GET',
            path: '/car-videos/:slug',
            handler: 'car-video.findOne',
            config: {
              auth: false, // Set to true if you want to restrict access
            },
          },
          
    ],
};
