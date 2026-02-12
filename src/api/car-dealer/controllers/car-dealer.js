'use strict';

/**
 * car-dealer controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::car-dealer.car-dealer', ({ strapi }) => ({
  async findByBrandOrDealer(ctx) {
    try {
      const { brandSlug, dealerBranch } = ctx.query;
      const page = parseInt(ctx.query.page, 10) || 1;
      const pageSize = parseInt(ctx.query.pageSize, 10) || 10;
      const sort = ctx.query.sort || 'name';
      const order = ctx.query.order || 'ASC';

      // Build the query conditions based on the presence of brandSlug and dealerBranch
      const queryConditions = {};

      // Add filter for brandSlug if provided
      if (brandSlug) {
        // Find the car brands that match the slug(s)
        const brandSlugs = brandSlug.split(','); // Support multiple brand slugs
        const brands = await strapi.db.query('api::car-brand.car-brand').findMany({
          where: { slug: { $in: brandSlugs } },
        });

        if (!brands || brands.length === 0) {
          return ctx.notFound('No car brands found for the given slug(s)');
        }

        // Extract brand IDs
        const brandIds = brands.map((brand) => brand.id);

        // Add brand filter to the query conditions
        queryConditions.select_related_brand = { $in: brandIds };
      }

      // Add filter for dealerBranch if provided
      if (dealerBranch) {
        // Find the dealer branch by slug
        const branch = await strapi.db.query('api::dealer-branch.dealer-branch').findOne({
          where: { slug: dealerBranch }, // Use slug instead of name
        });

        if (!branch) {
          return ctx.notFound('Dealer branch not found');
        }

        // Add dealer branch filter to the query conditions
        queryConditions.dealer_branch = branch.id;
      }

      // Fetch car dealers based on the combined query conditions, pagination, and sorting
      const carDealers = await strapi.db.query('api::car-dealer.car-dealer').findMany({
        where: queryConditions,
        populate: {
          logo: true,
          location: true,
          dealer_branch: true,
          dealer_shop_image: true,
          select_related_brand: {
            populate: {
              brandLogo: true
            }
          }
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: {
          [sort]: order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        },
      });

      // Get the total number of car dealers for pagination
      const totalCarDealers = await strapi.db.query('api::car-dealer.car-dealer').count({
        where: queryConditions,
      });

      // Return the car dealers along with pagination info
      ctx.body = {
        dealers: carDealers,
        pagination: {
          page,
          pageSize,
          totalItems: totalCarDealers,
          totalPages: Math.ceil(totalCarDealers / pageSize),
        },
      };
    } catch (err) {
      strapi.log.error('Error fetching car dealers by brand slug or dealer branch:', err);
      return ctx.internalServerError('An error occurred');
    }
  },
  async findOneBySlug(ctx) {
    try {
      const { slug } = ctx.params;

      // Fetch the car dealer by slug
      const carDealer = await strapi.db.query('api::car-dealer.car-dealer').findOne({
        where: { slug },
        populate: {
          logo: true,
          location: true,
          dealer_branch: true,
          dealer_shop_image: true,
          select_related_brand: {
            populate: {
              brandLogo: true,
            },
          },
        },
      });

      // If no car dealer is found, return a 404 error
      if (!carDealer) {
        return ctx.notFound('Car dealer not found');
      }

      // Return the car dealer data
      ctx.body = carDealer;
    } catch (err) {
      strapi.log.error('Error fetching car dealer by slug:', err);
      return ctx.internalServerError('An error occurred');
    }
  },
}));

