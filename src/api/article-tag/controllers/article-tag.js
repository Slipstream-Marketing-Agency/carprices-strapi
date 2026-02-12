"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::article-tag.article-tag",
  ({ strapi }) => ({
    async listAllTags(ctx) {
      try {
        // Fetch the first 20 article tags, sorted by ID in descending order
        const data = await strapi.entityService.findMany(
          "api::article-tag.article-tag",
          {
            fields: ["title", "slug"], // Specify the fields to include in the response
            sort: { id: "desc" }, // Sort by ID in descending order
            limit: 20, // Limit the response to the first 20 results
            ...ctx.query, // Spread any additional query parameters that might be needed
          }
        );

        // Prepare a custom response that only includes the title and slug of each article tag
        const customResponse = data.map((tag) => ({
          title: tag.title,
          slug: tag.slug,
        }));

        // Send back the custom response
        ctx.body = customResponse;
      } catch (err) {
        ctx.body = err;
        ctx.status = 500; // Internal Server Error
      }
    },
    //   async listAllTags(ctx) {
    //     try {
    //       // Fetch all article tags and populate their related articles
    //       const tags = await strapi.entityService.findMany('api::article-tag.article-tag', {
    //         fields: ['title', 'slug'], // Specify the fields to include in the response
    //         populate: { articles: true }, // Populate the articles to count them
    //         ...ctx.query,
    //       });
    //       // Filter tags by those having more than one article and limit the result to 14
    //       const filteredAndLimitedTags = tags.filter(tag => tag.articles && tag.articles.length > 1)
    //                                           .slice(0, 14) // Limit to the first 14 tags that meet the condition
    //                                           .map(tag => ({
    //                                             title: tag.title,
    //                                             slug: tag.slug,
    //                                             articlesCount: tag.articles.length, // Optionally include the count of articles
    //                                           }));
    //       // Send back the filtered and limited list of article tags
    //       ctx.body = filteredAndLimitedTags;
    //     } catch (err) {
    //       ctx.body = err;
    //       ctx.status = 500; // Internal Server Error
    //     }
    //   },
    // You can keep the rest of your custom methods or overrides here
  })
);
