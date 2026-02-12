const path = require("path");

module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");

  const connections = {
    postgres: {
      connection: {
        connectionString: env("DATABASE_URL"),
        host: env(
          "DATABASE_HOST",
          // "carpricesadmindb.cntuteg0xsdv.me-central-1.rds.amazonaws.com"
        ),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "postgres"),
        user: env("DATABASE_USERNAME", "postgres"),
        password: env("DATABASE_PASSWORD", "0DGLS2XA1GELNHVK66H"),
        ssl: env.bool("DATABASE_SSL", true) ? { rejectUnauthorized: false } : false,
        schema: env("DATABASE_SCHEMA", "public"),
        acquireTimeoutMillis: 60000, // Connection acquisition timeout
        idleTimeoutMillis: 30000,    // Idle connection timeout
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 15),

      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 600000),
    },
  };
};
