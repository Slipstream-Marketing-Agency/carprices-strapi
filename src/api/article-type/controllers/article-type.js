'use strict';

/**
 * article-type controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article-type.article-type', ({ strapi }) => ({
  // Custom method to fetch only the type name and slug
  async findTypeList(ctx) {
    try {
      const types = await strapi.db.query('api::article-type.article-type').findMany({
        select: ['type', 'slug'],
        where: {
          publishedAt: { $ne: null }, // Check if publishedAt is not null (i.e., it's published)
        },
      });

      ctx.send(types);
    } catch (error) {
      console.error('Error fetching article types:', error);
      ctx.throw(500, 'Unable to fetch article types');
    }
  },
}));
