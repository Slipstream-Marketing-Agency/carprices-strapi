// Path: ./config/functions/cron.js

module.exports = {
  // Schedule to run every Sunday at midnight (0 0 * * 0)
  // '* * * * *': async () => {
  //   console.log('Fetching page views from Google Analytics...');
  //   const viewsData = await fetchPageViews();
  //   console.log('Fetched views data:', viewsData);
  //   // Assuming you have a service function to process and update views in Strapi
  //   await strapi.services.article.updateArticleViews(viewsData);
  // },

//   "* * * * *": async ({ strapi }) => {
//     // Runs every hour, adjust as needed
//     const entities = await strapi.db.query("api::car-trim.car-trim").findMany({
//       populate: {
//         car_models: true,
//         car_brands: true,
//       },
//     });

//     const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${entities
//   .map(
//     (entity) => `
//   <url>
//     <loc>https://carprices.ae/brands/${entity.car_brands[0].slug}/${
//       entity.car_models[0].slug
//     }/${entity.year}/${entity.slug}</loc>
//     <lastmod>${new Date(
//       entity.updatedAt || entity.createdAt
//     ).toISOString()}</lastmod>
//     <changefreq>monthly</changefreq>
//     <priority>0.8</priority>
//   </url>
// `
//   )
//   .join("")}
// </urlset>`;

//     require("fs").writeFileSync("public/trims-listing-sitemap.xml", sitemap); // Adjust path as needed
//     console.log("Sitemap generated.");
//   },
};
