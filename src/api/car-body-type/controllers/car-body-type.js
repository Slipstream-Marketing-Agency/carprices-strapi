"use strict";

/**
 * car-body-type controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::car-body-type.car-body-type",
  ({ strapi }) => ({
    async generateSitemap(ctx) {
      try {
        // Fetch entities with necessary relations
        const entity = await strapi.db
          .query("api::car-body-type.car-body-type")
          .findMany({
            populate: {},
          });

        // Generate sitemap for trims
        const trimsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entity
    .map(
      (entity) => `
      <url>
        <loc>https://carprices.ae/body-types/${entity.slug}</loc>
        <lastmod>${new Date(
          entity.updatedAt || entity.createdAt
        ).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>`
    )
    .join("")}
  </urlset>`;
        require("fs").writeFileSync(
          "public/bodytypes-sitemap.xml",
          trimsSitemap
        );

        ctx.body = "Sitemaps generated successfully.";
      } catch (error) {
        console.error("Error generating sitemaps:", error);
        ctx.body = "Error generating sitemaps.";
        ctx.status = 500;
      }
    },
  })
);
