module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/article-types/type-list',
        handler: 'article-type.findTypeList',
        config: {
          auth: false, // Set to true if authentication is required
        },
      },
    ],
  };
  