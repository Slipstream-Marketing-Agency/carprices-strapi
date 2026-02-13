// path: /src/api/car-brand/controllers/car-brand.js
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;
const cache = {};
module.exports = createCoreController(
  "api::car-brand.car-brand",
  ({ strapi }) => ({

    // New Controllers


    async findBrandDetails(ctx) {
      try {
        const { brandSlug } = ctx.query;

        if (!brandSlug) {
          return ctx.badRequest('Please provide a brand slug');
        }

        // Retrieve brand details and SEO information in a single query
        const brand = await strapi.db.query('api::car-brand.car-brand').findOne({
          where: { slug: brandSlug },
          select: ['id', 'slug', 'name', 'description'],
          populate: {
            brandLogo: { select: ['url', 'formats'] },
            coverImage: { select: ['url', 'formats'] },
            seo: true,  // Fetch SEO information
          },
        });

        if (!brand) return ctx.notFound('Brand not found');

        // Return brand details and SEO information
        return {
          brand: {
            id: brand.id,
            name: brand.name,
            description: brand.description,
            logo: brand.brandLogo?.formats?.thumbnail?.url,
            cover: brand.coverImage?.formats?.small?.url,
          },
          seo: brand.seo,
        };
      } catch (err) {
        ctx.throw(500, err);
      }
    },
    async findModelsByBrandSlug(ctx) {
      try {
        const { brandSlug, page = 1, pageSize = 10, searchTerm } = ctx.query;
        if (!brandSlug) {
          return ctx.badRequest('Please provide a brand slug');
        }
        let sort;

        try {
          const sortQuery = JSON.parse(ctx.query.sort);
          if (sortQuery === "price-asc") {
            sort = ["price:asc"];
          } else if (sortQuery === "price-desc") {
            sort = ["price:desc"];
          } else {
            sort = ["year:desc", "price:asc"]; // Default sorting order if no specific sort parameter is provided
          }
        } catch (error) {
          sort = ["year:desc", "price:asc"]; // Default sorting order if sort parameter is not valid
        }

        let filters = {
          $and: [
            { year: { $gte: new Date().getFullYear() - 1 } }, // Default filter for year
            {
              $or: [
                { price: { $gt: 0 } }, // Include cars with price greater than 0
                { price: { $eq: null } }, // Include cars with null/undefined price (if needed)
              ],
            },
            { highTrim: true }, // Default filter for highTrim
            { publishedAt: { $ne: null } },
            { car_brands: { slug: { $in: [brandSlug] } } },
          ],
        };

        // Debugging information
        console.log("Filters:", filters);

        const { results, total } = await strapi.services[
          "api::car-trim.car-trim"
        ].findhomeFilterWithPagination({
          filters,
          page,
          pageSize,
          sort,
        });

        console.log("Results:", results);

        const formattedResults = results.map((entity) => {
          const carModelId =
            entity.car_models && entity.car_models.length > 0
              ? entity.car_models[0].id
              : null;
          const carBrand =
            entity.car_brands && entity.car_brands.length > 0
              ? entity.car_brands[0]
              : null;

          if (!carModelId || !carBrand) {
            console.warn(
              "Skipping entity due to missing car_models or car_brands:",
              entity
            );
            return null;
          }

          return {
            id: entity.id,
            seats: entity.seating_capacity,
            name: entity.name,
            slug: entity.slug,
            brand: {
              name: carBrand.name,
              slug: carBrand.slug,
              logo: carBrand.brandLogo ? carBrand.brandLogo.url : null,
            },
            model: {
              name: entity.car_models[0].name,
              slug: entity.car_models[0].slug,
              year: entity.car_models[0].year,
            },
            featuredImage: entity?.featuredImage ? {
              url: entity?.featuredImage?.formats?.thumbnail?.url,
              ext: entity?.featuredImage?.formats?.thumbnail?.ext,
              mime: entity?.featuredImage?.formats?.thumbnail?.mime,
              size: entity?.featuredImage?.formats?.thumbnail?.size,
              width: entity?.featuredImage?.formats?.thumbnail?.width,
              height: entity?.featuredImage?.formats?.thumbnail?.height
            } : null,
            year: entity.year,
            price: entity.price,
            power: entity.power,
            displacement: entity.displacement,
            transmission: entity.transmission,
            cylinders: entity.cylinders,
            bodyType: entity.car_body_types[0].name,
            minPrice: entity.price,
            maxPrice: entity.price,
            seatingCapacity: entity.seatingCapacity,
            engine: entity.engine,
            torque: entity.torque,
          };
        });

        const validFormattedResults = formattedResults.filter(
          (result) => result !== null
        );

        ctx.body = {
          code: 200,
          message: "Success",
          data: validFormattedResults,
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        };
        // const { brandSlug, page = 1, pageSize = 10, searchTerm } = ctx.query;

        // if (!brandSlug) {
        //   return ctx.badRequest('Please provide a brand slug');
        // }

        // // Define the base query for car models
        // const modelQuery = {
        //   where: {
        //     ...(searchTerm ? { name: { $containsi: searchTerm } } : {}),
        //   },
        //   select: ['id', 'name', 'slug'], // Only necessary fields
        //   populate: {
        //     car_trims: {
        //       select: ['id', 'year', 'price', 'highTrim', 'engine', 'power', 'torque'],
        //       where: {
        //         price: { $gt: 0 },
        //       },
        //       orderBy: { year: 'desc' },
        //       populate: {
        //         featuredImage: { select: ['url', 'formats'] },
        //       },
        //     },
        //   },
        // };

        // // Retrieve the brand and its car models with optional search filter
        // const brandWithModels = await strapi.db.query('api::car-brand.car-brand').findOne({
        //   where: { slug: brandSlug },
        //   populate: {
        //     car_models: modelQuery,
        //   },
        // });

        // if (!brandWithModels) return ctx.notFound('Brand not found');

        // // Process models for latest trims and price range
        // const modelsWithLatestTrims = brandWithModels.car_models.map(model => {
        //   // Get all trims
        //   const trims = model.car_trims;

        //   // Calculate the price range based on all trims
        //   const prices = trims.map((trim) => trim.price).filter((price) => price > 0);
        //   const minPrice = prices.length ? Math.min(...prices) : null;
        //   const maxPrice = prices.length ? Math.max(...prices) : null;

        //   // Get only the latest year's high trim with price > 0
        //   const latestYear = trims.length > 0 ? Math.max(...trims.map(trim => trim.year)) : null;
        //   const latestYearHighTrim = trims.find(trim => trim.year === latestYear && trim.highTrim === true && trim.price > 0);

        //   return {
        //     id: model.id,
        //     name: model.name,
        //     slug: model.slug,
        //     car_trims: latestYearHighTrim ? [latestYearHighTrim] : [], // Only include the latest year's high trim with non-zero price
        //     priceRange: { min: minPrice, max: maxPrice },
        //   };
        // });

        // // Filter out models where `car_trims` array is empty (i.e., no valid high trim)
        // const filteredModels = modelsWithLatestTrims.filter(model => model.car_trims.length > 0);

        // // Apply pagination
        // const total = filteredModels.length;
        // const paginatedModels = filteredModels.slice(
        //   (page - 1) * pageSize,
        //   page * pageSize
        // );

        // // Return only the paginated models data
        // return {
        //   data: paginatedModels,
        //   pagination: {
        //     page: parseInt(page, 10),
        //     pageSize: parseInt(pageSize, 10),
        //     pageCount: Math.ceil(total / pageSize),
        //     total,
        //   },
        // };
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async findRelatedVideos(ctx) {
      try {
        const { brandSlug, page = 1, pageSize = 10 } = ctx.query;

        if (!brandSlug) {
          return ctx.badRequest('Please provide a brand slug');
        }

        // Retrieve related videos for the brand
        const brand = await strapi.db.query('api::car-brand.car-brand').findOne({
          where: { slug: brandSlug },
          populate: {
            select_related_videos: {
              limit: parseInt(pageSize),
              start: (page - 1) * pageSize,
            },
          },
        });

        if (!brand) return ctx.notFound('Brand not found');

        return {
          data: brand.select_related_videos,
          pagination: {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            total: brand.select_related_videos.length,
          },
        };
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async findRelatedDealers(ctx) {
      try {
        const { brandSlug, page = 1, pageSize = 10 } = ctx.query;

        if (!brandSlug) {
          return ctx.badRequest('Please provide a brand slug');
        }

        // Retrieve related dealers for the brand
        const brand = await strapi.db.query('api::car-brand.car-brand').findOne({
          where: { slug: brandSlug },
          populate: {
            selected_related_dealers: {
              limit: parseInt(pageSize),
              start: (page - 1) * pageSize,
            },
          },
        });

        if (!brand) return ctx.notFound('Brand not found');

        return {
          data: brand.selected_related_dealers,
          pagination: {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            total: brand.selected_related_dealers.length,
          },
        };
      } catch (err) {
        ctx.throw(500, err);
      }
    },


    async filterByBranches(ctx) {
      const { branchSlug } = ctx.query;
    
      // Validate that the branchSlug parameter is provided
      if (!branchSlug) {
        return ctx.badRequest('Branch slug is required');
      }
    
      try {
        // Fetch car brands that have related dealers under the specified branch
        const brands = await strapi.entityService.findMany('api::car-brand.car-brand', {
          filters: {
            selected_related_dealers: {
              dealer_branch: {
                slug: branchSlug, // Filter based on the branch slug
              },
            },
          },
          populate: {
            selected_related_dealers: {
              populate: ['dealer_branch'], // Populate dealer_branch data within selected_related_dealers
            },
          },
        });
    
        // Filter and structure the data to include only relevant dealers for the specified branch
        const filteredBrands = brands
          .map((brand) => {
            const filteredDealers = brand.selected_related_dealers
              .filter((dealer) => dealer.dealer_branch && dealer.dealer_branch.slug === branchSlug)
              .map((dealer) => ({
                id: dealer.id,
                name: dealer.name,
                slug: dealer.slug,
              }));
    
            return {
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              selected_related_dealers: filteredDealers,
            };
          })
          .filter((brand) => brand.selected_related_dealers.length > 0); // Exclude brands without relevant dealers
    
        // Send the filtered brands in the response
        ctx.send(filteredBrands);
      } catch (error) {
        // Log and return an error message
        strapi.log.error('Error fetching filtered brands:', error);
        ctx.internalServerError('Error fetching filtered brands');
      }
    },   
    
    
    async findBrandsWithSelectedVideos(ctx) {
      try {
          // Adjust fields based on actual schema
          const brandsWithVideos = await strapi.entityService.findMany("api::car-brand.car-brand", {
              filters: {
                  select_related_videos: {
                      $notNull: true,
                  },
              },
              fields: ["id", "name", "slug"], // Fields for car brands
              populate: {
                  select_related_videos: {
                      fields: ["id", "title"], // Replace `name` with `title` or correct field name in `car_videos`
                  },
              },
              pagination: {
                  page: ctx.query.page || 1,
                  pageSize: ctx.query.pageSize || 25,
              },
          });

          // Fetch count and pagination details for the response
          const totalCount = await strapi.entityService.count("api::car-brand.car-brand", {
              filters: {
                  select_related_videos: {
                      $notNull: true,
                  },
              },
          });

          return {
              data: brandsWithVideos,
              meta: {
                  pagination: {
                      page: ctx.query.page || 1,
                      pageSize: ctx.query.pageSize || 25,
                      pageCount: Math.ceil(totalCount / (ctx.query.pageSize || 25)),
                      total: totalCount,
                  },
              },
          };
      } catch (error) {
          console.error("Error fetching brands with selected videos:", error);
          ctx.throw(500, "Internal server error");
      }
  },

    // ------------------------------------------------------------------------------------------------------------





    // Method to fetch brands with id, name, and slug
    async findBrandNames(ctx) {
      try {
        const { page = 1, pageSize = 10 } = ctx.query;

        // Calculate offset for pagination
        const offset = (page - 1) * pageSize;

        // Fetch car brands with pagination and media fields included
        const entities = await strapi.db
          .query("api::car-brand.car-brand")
          .findMany({
            select: ["id", "name", "slug"],
            populate: { brandLogo: true, coverImage: true },
            limit: pageSize,
            offset: offset,
            orderBy: { name: "asc" },
          });

        // Get the total number of car brands for pagination calculation
        const totalBrands = await strapi.db
          .query("api::car-brand.car-brand")
          .count();

        // Format the data in Strapi response style
        const data = entities.map((entity) => ({
          id: entity.id,
          attributes: {
            name: entity.name,
            slug: entity.slug,
            brandLogo: entity.brandLogo?.formats?.small?.url, // Use the small format of brandLogo if available
          },
        }));

        // Return paginated response
        ctx.body = {
          brands: data,
          pagination: {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            totalItems: totalBrands,
            totalPages: Math.ceil(totalBrands / pageSize),
          },
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    async findOneBySlug(ctx) {
      try {
        const { slug } = ctx.params;

        const entity = await strapi.db
          .query("api::car-brand.car-brand")
          .findOne({
            where: { slug },
            populate: {
              brandLogo: true,
              coverImage: true,
              car_models: {
                populate: {
                  car_trims: {
                    populate: {
                      car_body_types: true, // Assuming this is how you access body types, adjust as needed
                    },
                  },
                },
              },
              seo: true, // Populate the SEO fields
            },
          });

        if (!entity) {
          return ctx.notFound("Brand not found");
        }

        // Determine the latest year from all trims across all models
        const allYears = entity.car_models.flatMap((model) =>
          model.car_trims.map((trim) => trim.year)
        );
        const latestYear = Math.max(...allYears);

        let bodyTypesInfo = new Map();

        entity.car_models.forEach((model) => {
          const validTrims = model.car_trims.filter(
            (trim) => trim.year === latestYear
          );
          validTrims.forEach((trim) => {
            trim.car_body_types.forEach((bodyType) => {
              if (bodyType && bodyType.name) {
                let key = `${bodyType.name}-${bodyType.slug}`;
                if (!bodyTypesInfo.has(key)) {
                  bodyTypesInfo.set(key, {
                    name: bodyType.name,
                    slug: bodyType.slug,
                    modelCount: 0,
                    models: new Set(),
                  });
                }
                let bodyTypeInfo = bodyTypesInfo.get(key);
                bodyTypeInfo.models.add(model.name); // Add the model to the set of models for this body type
              }
            });
          });
        });

        // Update modelCount for each body type based on the set size
        bodyTypesInfo.forEach((value, key) => {
          value.modelCount = value.models.size;
        });

        const uniqueCarBodyTypesArray = Array.from(bodyTypesInfo.values()).map(
          (info) => ({
            name: info.name,
            slug: info.slug,
            modelCount: info.modelCount,
          })
        );

        let allValidTrims = [];
        let modelsWithPriceRange = entity.car_models
          .map((model) => {
            const validTrims = model.car_trims.filter(
              (trim) => trim.year === latestYear && trim.price > 0
            );

            const prices = validTrims.map((trim) => trim.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // Include valid trims for overall calculations
            allValidTrims.push(
              ...validTrims.map((trim) => ({
                ...trim,
                modelName: model.name,
                modelSlug: model.slug,
              }))
            );

            return {
              modelName: model.name,
              modelSlug: model.slug,
              minPrice: isFinite(minPrice) ? minPrice : null,
              maxPrice: isFinite(maxPrice) ? maxPrice : null,
            };
          })
          .filter((model) => model.minPrice !== null && model.maxPrice !== null)
          .sort((a, b) => a.minPrice - b.minPrice);
        // Sort trims for overall statistics
        const sortedByPrice = allValidTrims.sort((a, b) => a.price - b.price);
        const sortedByPower = allValidTrims.sort((a, b) => b.power - a.power);

        const mostAffordableTrim = sortedByPrice[0] || null;
        const mostExpensiveTrim =
          sortedByPrice[sortedByPrice.length - 1] || null;
        const mostPowerfulTrim = sortedByPower[0] || null;

        const data = {
          id: entity.id,
          attributes: {
            name: entity.name,
            slug: entity.slug,
            description: entity.description,
            brandLogo: entity.brandLogo ? entity.brandLogo.url : null,
            coverImage: entity.coverImage ? entity.coverImage.url : null,
            modelsWithPriceRange: modelsWithPriceRange,
            uniqueCarBodyTypes: uniqueCarBodyTypesArray,
            mostAffordableModel: mostAffordableTrim
              ? {
                modelName: mostAffordableTrim.modelName,
                modelSlug: mostAffordableTrim.modelSlug,
                trimName: mostAffordableTrim.name,
                trimSlug: mostAffordableTrim.slug,
                year: mostAffordableTrim.year,
                price: mostAffordableTrim.price,
                power: mostAffordableTrim.power,
              }
              : null,
            mostExpensiveModel: mostExpensiveTrim
              ? {
                modelName: mostExpensiveTrim.modelName,
                modelSlug: mostExpensiveTrim.modelSlug,
                trimName: mostExpensiveTrim.name,
                trimSlug: mostExpensiveTrim.slug,
                year: mostExpensiveTrim.year,
                price: mostExpensiveTrim.price,
                power: mostExpensiveTrim.power,
              }
              : null,
            mostPowerfulModel: mostPowerfulTrim
              ? {
                modelName: mostPowerfulTrim.modelName,
                modelSlug: mostPowerfulTrim.modelSlug,
                trimName: mostPowerfulTrim.name,
                trimSlug: mostPowerfulTrim.slug,
                year: mostPowerfulTrim.year,
                price: mostPowerfulTrim.price,
                power: mostPowerfulTrim.power,
              }
              : null,
          },
          seo: {
            metaTitle: entity.seo?.metaTitle || null,
            metaDescription: entity.seo?.metaDescription || null,
            metaImage: entity.seo?.metaImage?.url || null,
            metaSocial: entity.seo?.metaSocial || null,
            metaRobots: entity.seo?.metaRobots || null,
            structuredData: entity.seo?.structuredData || null,
            metaViewport: entity.seo?.metaViewport || null,
            canonicalURL: entity.seo?.canonicalURL || null,
          },
        };

        ctx.body = data;
      } catch (error) {
        ctx.throw(500, `Failed to fetch brand by slug: ${error.message}`);
      }
    },

    async findBrandWithModels(ctx) {
      try {
        const { brandId } = ctx.params; // Get brandId from request parameters

        // Fetch the brand and populate its related models
        const entity = await strapi.db
          .query("api::car-brand.car-brand")
          .findOne({
            where: { id: brandId }, // Adjust this line if you're using slug or another identifier
            populate: {
              car_models: true, // Ensure this is the correct relation field name in your brand model
            },
          });

        if (!entity) {
          // Handle case where brand is not found
          return ctx.notFound("Brand not found");
        }

        // Format and return the brand with its related models
        const brandWithModels = {
          id: entity.id,
          attributes: {
            name: entity.name,
            slug: entity.slug,
            models: entity.car_models.map((model) => ({
              id: model.id,
              name: model.name,
              slug: model.slug,
              // Include other model attributes as needed
            })),
          },
        };

        ctx.body = brandWithModels;
      } catch (error) {
        ctx.throw(500, `Failed to fetch brand with models: ${error.message}`);
      }
    },
    async findBrandsWithVideos(ctx) {
      try {
        // Fetch brands that have at least one associated video
        const brandsWithVideos = await strapi.db.query("api::car-brand.car-brand").findMany({
          where: {
            select_related_videos: {
              id: {
                $notNull: true, // Ensure that related videos have an ID
              },
            },
          },
          populate: {
            select_related_videos: true, // Populate the relation with car videos to ensure they exist
          },
        });

        // Filter brands to ensure they have at least one associated video
        const filteredBrands = brandsWithVideos.filter((brand) => brand.select_related_videos.length > 0);

        // Map the results to return only necessary fields
        const customResponse = filteredBrands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
        }));

        // Return the list of brands with videos
        ctx.body = customResponse;
      } catch (error) {
        ctx.throw(500, `Failed to fetch brands with videos: ${error.message}`);
      }
    },
    async findBrandsWithDealers(ctx) {
      try {
        // Fetch brands that have at least one associated car dealer, sorted by brand name
        const brandsWithDealers = await strapi.db
          .query("api::car-brand.car-brand")
          .findMany({
            where: {
              selected_related_dealers: {
                id: {
                  $notNull: true, // Ensure that related car dealers have an ID
                },
              },
            },
            populate: {
              selected_related_dealers: true, // Populate the relation with car dealers
            },
            orderBy: {
              name: "asc", // Sort brands by name in ascending order
            },
          });
    
        // Filter brands to ensure they have at least one associated car dealer
        const filteredBrands = brandsWithDealers.filter(
          (brand) => brand.selected_related_dealers.length > 0
        );
        // Map the results to return only necessary fields
        const customResponse = filteredBrands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
        }));

        // Return the list of brands with car dealers
        ctx.body = customResponse;
      } catch (error) {
        console.error("Error fetching brands with dealers:", error);
        ctx.throw(500, `Failed to fetch brands with car dealers: ${error.message}`);
      }
    },





    async listCars(ctx) {
      try {
        const { year, modelName, brand, trim, _limit = 10, _page = 1, search } = ctx.query;

        const filters = {};

        // Apply case-insensitive brand filter
        if (brand) {
          filters.name = { $containsi: brand };
        }

        // Apply nested filters for car models and trims if provided
        if (modelName || year || trim) {
          filters.car_models = {
            ...(modelName ? { name: { $containsi: modelName } } : {}),
            car_trims: {
              ...(year ? { year: year } : {}),
              ...(trim ? { name: { $containsi: trim } } : {}),
              highTrim: true,
            },
          };
        }

        // Global search across multiple attributes
        if (search) {
          filters.$or = [
            { name: { $containsi: search } },
            { "car_models.name": { $containsi: search } },
            { "car_models.car_trims.name": { $containsi: search } },
            { "car_models.car_trims.year": { $eq: parseInt(search, 10) } },
          ];
        }

        const start = (_page - 1) * _limit;

        const brands = await strapi.entityService.findMany('api::car-brand.car-brand', {
          filters,
          populate: {
            car_models: {
              populate: {
                car_trims: {
                  filters: { highTrim: true },
                },
              },
            },
          },
          start,
          limit: _limit,
        });

        const result = brands.map((brand) => {
          return brand.car_models
            .map((model) => {
              const highTrim = model.car_trims.find(trim => trim.highTrim && (!year || trim.year == year));
              if (highTrim) {
                return {
                  brand: brand.name,
                  brandId: brand.id, // Include brand ID
                  year: highTrim.year,
                  modelName: model.name,
                  modelId: model.id, // Include model ID
                  highTrimName: highTrim.name,
                  trimId: highTrim.id, // Include trim ID
                };
              }
              return null;
            })
            .filter(Boolean);
        }).flat();

        const sortedResult = result.sort((a, b) => b.year - a.year);

        const paginatedResult = sortedResult.slice(start, start + parseInt(_limit, 10));

        const totalCount = sortedResult.length;
        const pageCount = Math.ceil(totalCount / _limit);

        ctx.send({
          data: paginatedResult,
          pagination: {
            page: parseInt(_page, 10),
            pageCount,
            total: totalCount,
            pageSize: parseInt(_limit, 10),
          },
        });
      } catch (error) {
        console.error("Error in listCars controller:", error);
        ctx.throw(500, error);
      }
    },



    // Get Latest Model Year Brands

    async findBrandsByLatestModelYear(ctx) {
      const { page = 1, pageSize = 10, search = "", sort = "latestYear", order = "desc" } = ctx.query;

      try {
        const orderByClause = (sort === "latestYear" || sort === "brandName") ? `${sort} ${order.toUpperCase()}` : "latestYear DESC";
        const offset = (page - 1) * pageSize;

        // Query to count the total number of matching published brands without pagination
        const countResult = await strapi.db.connection.raw(`
          SELECT COUNT(DISTINCT car_brands.id) AS total
          FROM car_trims
          JOIN car_trims_car_brands_links ON car_trims_car_brands_links.car_trim_id = car_trims.id
          JOIN car_brands ON car_trims_car_brands_links.car_brand_id = car_brands.id
          WHERE car_trims.high_trim = true
            AND car_trims.published_at IS NOT NULL
            AND car_brands.published_at IS NOT NULL
            AND car_brands.name ILIKE ?;
        `, [`%${search}%`]);

        const totalBrands = countResult.rows[0].total;

        // Main query to retrieve only published brands with pagination
        const result = await strapi.db.connection.raw(`
          SELECT 
              car_brands.name AS brandName,
              car_brands.slug AS brandSlug,
              MAX(car_trims.year) AS latestYear,
              logo.url AS brandLogoUrl,
              cover.url AS coverImageUrl
          FROM car_trims
          JOIN car_trims_car_brands_links ON car_trims_car_brands_links.car_trim_id = car_trims.id
          JOIN car_brands ON car_trims_car_brands_links.car_brand_id = car_brands.id
          LEFT JOIN files_related_morphs AS logo_frm ON logo_frm.related_id = car_brands.id
              AND logo_frm.related_type = 'api::car-brand.car-brand' AND logo_frm.field = 'brandLogo'
          LEFT JOIN files AS logo ON logo.id = logo_frm.file_id
          LEFT JOIN files_related_morphs AS cover_frm ON cover_frm.related_id = car_brands.id
              AND cover_frm.related_type = 'api::car-brand.car-brand' AND cover_frm.field = 'coverImage'
          LEFT JOIN files AS cover ON cover.id = cover_frm.file_id
          WHERE car_trims.high_trim = true
            AND car_trims.published_at IS NOT NULL
            AND car_brands.published_at IS NOT NULL
            AND car_brands.name ILIKE ?
          GROUP BY car_brands.id, logo.url, cover.url
          ORDER BY ${orderByClause}
          LIMIT ? OFFSET ?;
        `, [`%${search}%`, parseInt(pageSize), offset]);

        const brandData = result.rows;

        // Format the data to return brand name, slug, latestYear, logo URL, and cover image URL
        const sortedBrands = brandData.map(brand => ({
          name: brand.brandname,
          slug: brand.brandslug,
          latestYear: brand.latestyear,
          logo: brand.brandlogourl || null,
          coverImage: brand.coverimageurl || null,
        }));

        // Calculate pagination using the total count from the count query
        const pagination = {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          pageCount: Math.ceil(totalBrands / pageSize),
          total: totalBrands,
        };

        const yearCountMap = sortedBrands.reduce((acc, brand) => {
          const { latestYear } = brand;
          acc[latestYear] = (acc[latestYear] || 0) + 1;
          return acc;
        }, {});

        const formattedYearCounts = Object.entries(yearCountMap)
          .map(([year, count]) => ({ year: parseInt(year), count }))
          .sort((a, b) => b.year - a.year);

        return ctx.send({
          status: "success",
          data: {
            brands: sortedBrands,
            pagination,
            yearCounts: formattedYearCounts,
          },
        });
      } catch (error) {
        console.error("Error fetching brands by latest model year:", error);
        ctx.throw(500, "Internal server error");
      }
    }



  })
);
