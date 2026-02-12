"use strict";

/**
 * compare-car controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::compare-car.compare-car",
  ({ strapi }) => ({
    async findCompareCar(ctx) {
      try {
        const entities = await strapi.entityService.findMany(
          "api::compare-car.compare-car",
          {
            ...ctx.query,
            populate: {
              car_models: {
                populate: {
                  car_brands: true,
                  car_trims: {
                    populate: {
                      featuredImage: true, // Ensure the featured image is populated
                    },
                  },
                },
              },
            },
          }
        );

        const customEntities = entities.map((entity) => ({
          id: entity.id,
          name: entity.name,
          carModels: entity.car_models.map((model) => {
            // Find the latest year among car_trims
            const latestYear = Math.max(
              ...model.car_trims.map((trim) => trim.year)
            );

            // Filter trims that are from the latest year and have a price greater than 0
            const latestYearTrims = model.car_trims.filter(
              (trim) => trim.year === latestYear && trim.price > 0
            );

            if (latestYearTrims.length === 0) {
              // Return early if no trims meet the criteria
              return {
                id: model.id,
                name: model.name,
                slug: model.slug,
                brand: model.car_brands?.[0]
                  ? {
                      name: model.car_brands[0].name,
                      slug: model.car_brands[0].slug,
                    }
                  : null,
                highTrim: null,
                minPrice: null,
                maxPrice: null,
              };
            }

            // Calculate min and max price among the filtered trims
            const prices = latestYearTrims.map((trim) => trim.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // Find the highTrim among the latest year trims
            const highTrim = latestYearTrims.reduce(
              (prev, current) => (prev.price > current.price ? prev : current),
              latestYearTrims[0]
            );

            // Extract the featuredImage URL
            const featuredImageUrl = highTrim.featuredImage?.formats?.thumbnail?.url || null;

            return {
              id: model.id,
              name: model.name,
              slug: model.slug,
              brand: model.car_brands?.[0]
                ? {
                    name: model.car_brands[0].name,
                    slug: model.car_brands[0].slug,
                  }
                : null,
              highTrim: {
                year: highTrim.year,
                featuredImage: featuredImageUrl,
                mainSlug: highTrim.mainSlug,
              },
              minPrice,
              maxPrice,
            };
          }),
        }));

        return customEntities;
      } catch (err) {
        ctx.throw(500, err.message || "An unexpected error occurred");
      }
    },
  })
);
