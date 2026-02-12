module.exports = [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "cdn.carprices.ae",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "cdn.carprices.ae",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:1337",
        "http://localhost:4000",
        "https://apis.carprices.ae",
        "https://carprices.ae",
        "https://www.carprices.ae",
        "https://staging.carprices.ae",
        "https://www.staging.carprices.ae",
        "http://127.0.0.1:1337",
        "http://127.0.0.1",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      headers: ["Content-Type", "Authorization"],
      credentials: true,
    },
  },
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      formLimit: "2mb",
      jsonLimit: "100mb",
    },
  },
  {
    name: "strapi::compression",
    config: {
      threshold: 1024, // Compress responses over 1 KB
      gzip: true,
      br: true, // Enable Brotli compression if supported
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
