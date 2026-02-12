// ~/strapi-aws-s3/backend/config/plugins.js

module.exports = ({ env }) => ({
  upload: {
    config: {
      // ✅ Remove AWS S3 provider options to fallback to local file storage
      provider: "local",
      providerOptions: {
        sizeLimit: 10000000, // 10 MB (optional)
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  "import-export-entries": {
    enabled: true,
    config: {
      jsonLimit: "100mb",
    },
  },
  ckeditor: {
    enabled: true,
    resolve: "./src/plugins/strapi-plugin-ckeditor",
  },
  "vercel-deploy": {
    enabled: true,
  },
  redirects: {
    enabled: true,
  },
  seo: {
    enabled: true,
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env('SMTP_PORT', 587),
        secure: false,
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      settings: {
        defaultFrom: 'no-reply@slipstream.agency',
        defaultReplyTo: 'sahin@slipstream.agency',
      },
    },
  },
  meilisearch: {
    host: env('MEILISEARCH_HOST'),
    apiKey: env('MEILISEARCH_API_KEY'),
    settings: {
      'car-trim': {
        indexName: 'car-trim',
        fields: ['name', 'year', 'price', 'highTrim', 'car_brands', 'car_models'],
        filterableAttributes: ['year', 'price', 'car_brands.name', 'car_models.name', 'highTrim'],
      },
      'car-model': {
        indexName: 'car-models',
        fields: ['name', 'slug', 'car_brands'],
        filterableAttributes: ['name', 'car_brands.name'],
      },
      'car-brand': {
        indexName: 'car-brands',
        fields: ['name', 'slug'],
        filterableAttributes: ['name'],
      },
    },
  },
  'all-cars-list': {
    enabled: true,
    resolve: './src/plugins/all-cars-list'
  },
  'rest-cache': {
    enabled: false,
    config: {
      provider: {
        name: "memory",
        options: {
          max: 32767,
          maxAge: 3600,
        },
      },
      strategy: {
        contentTypes: [
          'api::car-brand.car-brand',
          'api::car-trim.car-trim',
          'api::article.article',
          'api::article-category.article-category',
          'api::article-comment.article-comment',
          'api::article-tag.article-tag',
          'api::article-type.article-type',
          'api::author.author',
          'api::brand-section.brand-section',
          "api::car-body-type.car-body-type",
          'api::car-dealer.car-dealer',
          "api::car-model.car-model",
          'api::car-review.car-review',
          "api::car-section.car-section",
          'api::car-video.car-video',
          "api::compare-car.compare-car",
          'api::dealer-branch.dealer-branch',
          "api::home.home",
          'api::page.page',
          "api::web-story.web-story"
        ],
        routes: [
          {
            method: 'GET',
            path: '/api/articles/search/:type/tags-categories',
            keys: ['query','page','pageSize'],
          },
        ],
      },
    },
  },
  'cache': {
    enabled: false,
    resolve: './src/plugins/cache'
  },
});


// module.exports = ({ env }) => ({
//   upload: {
//     config: {
//       provider: "aws-s3",
//       providerOptions: {
//         baseUrl: env("CDN_URL"),
//         rootPath: env("CDN_ROOT_PATH"),
//         s3Options: {
//           accessKeyId: env("AWS_ACCESS_KEY_ID"),
//           secretAccessKey: env("AWS_ACCESS_SECRET"),
//           region: env("AWS_REGION"),
//           params: {
//             ACL: env("AWS_ACL", "public-read"),
//             signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
//             Bucket: env("AWS_BUCKET"),
//           },
//         },
//       },
//       actionOptions: {
//         upload: {},
//         uploadStream: {},
//         delete: {},
//       },
//     },
//   },
//   "import-export-entries": {
//     enabled: true,
//     config: {
//       jsonLimit: "100mb",
//     },
//   },
//   ckeditor: {
//     enabled: true,
//     resolve: "./src/plugins/strapi-plugin-ckeditor",
//   },
//   "vercel-deploy": {
//     enabled: true,
//   },
//   redirects: {
//     enabled: true,
//   },
//   seo: {
//     enabled: true,
//   },
//   email: {
//     config: {
//       provider: 'nodemailer',  // Use the 'smtp' provider here
//       providerOptions: {
//         host: env('SMTP_HOST', 'smtp.gmail.com'),  // Your SMTP host (e.g., smtp.gmail.com)
//         port: env('SMTP_PORT', 587),  // Port (587 for TLS, 465 for SSL)
//         secure: false,  // Set to true for SSL (port 465)
//         auth: {
//           user: env('SMTP_USERNAME'),  // Your email username
//           pass: env('SMTP_PASSWORD'),  // Your email passwordzz\z
//         },
//         // Optional, for handling TLS issues:
//         tls: {
//           rejectUnauthorized: false,
//         },
//       },
//       settings: {
//         defaultFrom: 'no-reply@slipstream.agency',  // Sender email address
//         defaultReplyTo: 'sahin@slipstream.agency',  // Reply-to email address
//       },
//     },
//   },
//   meilisearch: {
//     host: env('MEILISEARCH_HOST'), // The Meilisearch domain
//     apiKey: env('MEILISEARCH_API_KEY'),       // Replace with the actual master key
//     settings: {
//       'car-trim': {
//         indexName: 'car-trim',
//         fields: ['name', 'year', 'price', 'highTrim', 'car_brands', 'car_models'],
//         filterableAttributes: ['year', 'price', 'car_brands.name', 'car_models.name', 'highTrim'],
//       },
//       'car-model': {
//         indexName: 'car-models',
//         fields: ['name', 'slug', 'car_brands'],
//         filterableAttributes: ['name', 'car_brands.name'],
//       },
//       'car-brand': {
//         indexName: 'car-brands',
//         fields: ['name', 'slug'],
//         filterableAttributes: ['name'],
//       },
//     },
//   },
//   'all-cars-list': {
//     enabled: true,
//     resolve: './src/plugins/all-cars-list'
//   },
//   'rest-cache': {
//     enabled: false,
//     config: {
//       provider: {
//         name: "memory",
//         options: {
//           max: 32767,
//           maxAge: 3600,
//         },
//       },
//       strategy: {
//         // Define default cache settings
//         contentTypes: [
//           'api::car-brand.car-brand',
//           'api::car-trim.car-trim',
//           'api::article.article',
//           'api::article-category.article-category',
//           'api::article-comment.article-comment',
//           'api::article-tag.article-tag',
//           'api::article-type.article-type',
//           'api::author.author',
//           'api::brand-section.brand-section',
//           "api::car-body-type.car-body-type",
//           'api::car-dealer.car-dealer',
//           "api::car-model.car-model",
//           'api::car-review.car-review',
//           "api::car-section.car-section",
//           'api::car-video.car-video',
//           "api::compare-car.compare-car",
//           'api::dealer-branch.dealer-branch',
//           "api::home.home",
//           'api::page.page',
//           "api::web-story.web-story"
//         ], routes: [
//           // Specify the route to cache, including dynamic handling for queries
//           {
//             method: 'GET',
//             path: '/api/articles/search/:type/tags-categories', // Your custom API route
//             keys: ['query','page','pageSize'], // This enables query parameter-based caching
//           },
//         ],
//       },
//       // clearRelatedCache: true, 
//     },
//   },
//   'cache': {
//     enabled: false,
//     resolve: './src/plugins/cache'
//   },
//   // translate: {
//   //   enabled: true,
//   //   config: {
//   //     // Choose one of the available providers
//   //     provider: 'gct',
//   //     // Pass credentials and other options to the provider
//   //     providerOptions: {
//   //       // your API key - required and wil cause errors if not provided
//   //       apiKey: 'AIzaSyD25Ek9HHBDpxu-jCWzPiCInFZSoWfB5Bw',
//   //       // use custom api url - optional
//   //       apiUrl: 'translation.googleapis.com',
//   //     },
//   //     // other options ...
//   //   },
//   // },
// });


