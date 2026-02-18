module.exports = [
  "strapi::errors",
  {
    name: "global::rate-limiter",
    config: {
      interval: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute per IP
      delayAfter: 50, // Start adding delay after 50 requests
      prefixKey: "rl_",
    },
  },
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
      jsonLimit: "5mb",
    },
  },
  // Compression disabled — causes issues with Node.js server-side fetch (undici)
  // decompression. Re-enable behind a reverse proxy (e.g., Nginx) in production.
  // {
  //   name: "strapi::compression",
  //   config: {
  //     threshold: 1024,
  //     gzip: true,
  //     br: true,
  //   },
  // },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
