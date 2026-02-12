'use strict';

/**
 * dealer-branch controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::dealer-branch.dealer-branch', ({ strapi }) => ({
  async find(ctx) {
    try {
      const page = parseInt(ctx.query.page, 10) || 1;
      const pageSize = parseInt(ctx.query.pageSize, 10) || 10;
      const sort = ctx.query.sort || 'name';
      const order = ctx.query.order || 'ASC';

      // Build the query conditions based on any optional filters
      const queryConditions = {};

      // Example: If you want to add optional filtering by name
      if (ctx.query.name) {
        queryConditions.name = { $contains: ctx.query.name };
      }

      // Fetch dealer branches based on the query conditions, pagination, and sorting
      const dealerBranches = await strapi.db.query('api::dealer-branch.dealer-branch').findMany({
        where: queryConditions,
        select: ['name', 'slug'], // Select only the name and slug fields
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: {
          [sort]: order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        },
      });

      // Get the total number of dealer branches for pagination
      const totalDealerBranches = await strapi.db.query('api::dealer-branch.dealer-branch').count({
        where: queryConditions,
      });

      // Return the dealer branches along with pagination info
      ctx.body = {
        branches: dealerBranches,
        pagination: {
          page,
          pageSize,
          totalItems: totalDealerBranches,
          totalPages: Math.ceil(totalDealerBranches / pageSize),
        },
      };
    } catch (err) {
      strapi.log.error('Error fetching dealer branches:', err);
      return ctx.internalServerError('An error occurred');
    }
  },
  async filterByBrand(ctx) {
    const { brandSlug } = ctx.query;

    if (!brandSlug) {
      return ctx.badRequest('Brand slug is required');
    }

    try {
      // Find branches with populated car dealers
      const branches = await strapi.entityService.findMany('api::dealer-branch.dealer-branch', {
        populate: {
          car_dealers: {
            populate: ['select_related_brand'], // Populate related brand of each dealer
          }
        }
      });

      // Filter dealers and transform response to include only id, name, and slug
      const filteredBranches = branches.map(branch => {
        const filteredDealers = branch.car_dealers
          .filter(dealer => dealer.select_related_brand && dealer.select_related_brand.slug === brandSlug)
          .map(dealer => ({
            id: dealer.id,
            name: dealer.name,
            slug: dealer.slug
          }));

        return {
          id: branch.id,
          name: branch.name,
          slug: branch.slug,
          car_dealers: filteredDealers
        };
      }).filter(branch => branch.car_dealers.length > 0); // Exclude branches with no matching dealers

      ctx.send(filteredBranches);
    } catch (error) {
      strapi.log.error('Error fetching filtered branches:', error);
      ctx.send({ error: 'Error fetching filtered branches' });
    }
  }
}));
