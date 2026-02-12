"use strict";

/**
 * web-story controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::web-story.web-story",
  ({ strapi }) => ({
    // Fetch all web stories with pagination, sorting, and relations
    // Fetch all web stories with related images in storyPage populated
    async find(ctx) {
      const { page = 1, pageSize = 10, sort = "createdAt:desc" } = ctx.query;

      const stories = await strapi.entityService.findMany(
        "api::web-story.web-story",
        {
          populate: {
            coverImage: true, // Ensure cover image is populated
            storyPage: { populate: ["image"] }, // Populate the story page and its image
          },
          pagination: {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
          },
          sort,
        }
      );

      return stories;
    },

    // Fetch a specific web story by slug
    async findOneBySlug(ctx) {
      const { slug } = ctx.params;

      const story = await strapi.entityService.findMany(
        "api::web-story.web-story",
        {
          filters: { slug },
          populate: {
            coverImage: true,
            storyPage: { populate: ["image"] },
            seo: true
          },
        }
      );

      if (!story || story.length === 0) {
        return ctx.notFound("Web story not found");
      }

      return story[0];
    },

    // Fetch stories by category slug
    async findByCategory(ctx) {
      const { slug } = ctx.params;

      const stories = await strapi.entityService.findMany(
        "api::web-story.web-story",
        {
          filters: {
            article_categories: { slug }, // Properly filter stories by related category slug
          },
          populate: {
            coverImage: true, // Populate coverImage
            storyPage: true, // Populate storyPage (in case there are story pages)
            article_categories: true, // Populate categories for the stories
          },
        }
      );

      return stories;
    },

    // Fetch stories by tag slug
    async findByTag(ctx) {
      const { slug } = ctx.params;

      const stories = await strapi.entityService.findMany(
        "api::web-story.web-story",
        {
          filters: {
            article_tags: { slug }, // Filter stories by related tag slug
          },
          populate: {
            coverImage: true, // Populate coverImage
            storyPage: { populate: ["image"] }, // Populate storyPage
            article_categories: true, // Populate categories for the stories
            article_tags: true, // Populate tags for the stories
          },
        }
      );

      return stories;
    },

    // Fetch all categories
    async findCategories(ctx) {
      try {
        // Fetch categories that are associated with at least one web story
        const categories = await strapi.entityService.findMany(
          "api::article-category.article-category",
          {
            filters: {
              web_stories: {
                $notNull: true, // Ensure the category is linked to at least one web story
              },
            },
            populate: {
              web_stories: {
                fields: ["title"], // Only populate necessary fields from web stories
              },
            },
            fields: ["name", "slug"], // Specify fields to include in the response
          }
        );

        // Return only categories that are linked to web stories
        return categories.filter(
          (category) => category.web_stories && category.web_stories.length > 0
        );
      } catch (err) {
        ctx.body = err;
        ctx.status = 500; // Internal Server Error
      }
    },

    // Fetch all tags associated with web stories
    async findTagsForWebStories(ctx) {
      try {
        const tags = await strapi.entityService.findMany(
          "api::article-tag.article-tag",
          {
            filters: {
              web_stories: {
                $notNull: true, // Ensure that the tag is associated with at least one web story
              },
            },
            populate: {
              web_stories: {
                fields: ["title"], // Only populate the necessary fields
              },
            }, // Populate related web stories
            fields: ["title", "slug"], // Specify the fields to include in the response
          }
        );

        // Return only tags associated with web stories
        return tags.filter(
          (tag) => tag.web_stories && tag.web_stories.length > 0
        );
      } catch (err) {
        ctx.body = err;
        ctx.status = 500; // Internal Server Error
      }
    },

    async findPopularTags(ctx) {
      const tags = await strapi.entityService.findMany("api::tag.tag", {
        populate: {
          web_stories: true, // Assuming web_stories is the relation in the tag content type
        },
      });

      // Sort tags by the number of associated web stories
      const popularTags = tags
        .map((tag) => ({
          ...tag,
          storyCount: tag.web_stories.length, // Count associated stories
        }))
        .sort((a, b) => b.storyCount - a.storyCount); // Sort by story count (most popular first)

      return popularTags;
    },
  })
);
