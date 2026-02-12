"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::car-section.car-section",
  ({ strapi }) => ({
    async findAll(ctx) {
      try {
        const { suvs, performance, electric, featured, popular } = ctx.query; // Extract filters from query params

        // Build dynamic query filters based on the passed query parameters
        let filters = {};

        if (suvs === "1") {
          filters = {
            ...filters,
            name: "SUVs", // Filter for SUVs section
          };
        }

        if (performance === "1") {
          filters = {
            ...filters,
            name: "Performance", // Filter for Performance cars section
          };
        }

        if (electric === "1") {
          filters = {
            ...filters,
            name: "Popular Electric Cars", // Filter for Electric cars section
          };
        }

        if (featured === "1") {
          filters = {
            ...filters,
            name: "Featured Cars", // Filter for Featured Cars section
          };
        }

        if (popular === "1") {
          filters = {
            ...filters,
            name: "Popular Cars", // Filter for Popular Cars section
          };
        }

        // Query the database with the dynamic filters
        const entities = await strapi.entityService.findMany(
          "api::car-section.car-section",
          {
            filters, // Apply the filters dynamically
            ...ctx.query, // Pass any other query parameters (pagination, etc.)
            populate: {
              car_models: {
                populate: {
                  car_brands: {
                    populate: {
                      brandLogo: true,
                    },
                  },
                  car_trims: {
                    populate: {
                      featuredImage: true,
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
            const latestYear = Math.max(
              ...model.car_trims.map((trim) => trim.year)
            );

            const latestYearTrims = model.car_trims.filter(
              (trim) => trim.year === latestYear && trim.price > 0
            );

            const prices = latestYearTrims.map((trim) => trim.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            const highTrim = latestYearTrims.reduce(
              (latest, current) =>
                latest.year > current.year ? latest : current,
              { year: -Infinity }
            );

            const featuredImage =
              highTrim && highTrim.featuredImage
                ? highTrim?.featuredImage?.formats?.thumbnail
                : null;

            return {
              id: model.id,
              model: model ? {
                name: model.name,
                slug: model.slug,
              } : null,
              brand: model.car_brands
                ? {
                  name: model.car_brands[0].name,
                  slug: model.car_brands[0].slug,
                }
                : null,
              featuredImage: featuredImage ? {
                url: featuredImage.url,
                ext: featuredImage.ext,
                mime: featuredImage.mime,
                size: featuredImage.size,
                width: featuredImage.width,
                height: featuredImage.height
              } : "",
              power: highTrim.power,
              displacement: highTrim.displacement,
              transmission: highTrim.transmission,
              torque: highTrim.torque,
              engine: highTrim.engine,
              year: highTrim.year,
              minPrice: prices.length > 0 ? minPrice : null,
              maxPrice: prices.length > 0 ? maxPrice : null,
            };
          }),
        }));

        customEntities.sort((a, b) => a.id - b.id);

        return customEntities;
      } catch (err) {
        ctx.throw(500, err);
      }
    },
  })
);