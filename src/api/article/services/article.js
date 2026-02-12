'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::article.article', ({ strapi }) => ({
  // Extend the service with a new function to update article view counts
  async updateArticleViews(viewsData) {
    // Iterate over the views data fetched from Google Analytics
    for (const { path, views } of viewsData) {
      // Extract the slug from the path
      // Adjust the logic here to match how your article paths correspond to slugs in Strapi
      const slug = path.split('/news/')[1];
      if (!slug) continue; // Skip if the slug couldn't be determined

      try {
        // Find the article by slug
        const articles = await strapi.entityService.findMany('api::article.article', {
          filters: { slug },
        });

        // If article found, update its view count
        if (articles.length > 0) {
          const article = articles[0];
          await strapi.entityService.update('api::article.article', article.id, {
            data: { viewCount: views },
          });
        }
      } catch (error) {
        console.error(`Error updating views for article slug: ${slug}`, error);
        // Handle error appropriately
      }
    }
  },
}));
