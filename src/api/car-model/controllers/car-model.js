// car-model controller

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::car-model.car-model",
  ({ strapi }) => ({
    async findOneBySlugWithHighTrim(ctx) {
      try {
        const { slug, year, brandslug } = ctx.params; // Extract the slug, year, and brandslug from request parameters
    
        const filterYear = year ? parseInt(year) : null;
    
        // Fetch the car model by slug and brandslug, including car trims where highTrim is true
        const model = await strapi.db
          .query("api::car-model.car-model")
          .findOne({
            where: {
              slug: slug,
              car_brands: {
                slug: brandslug, // Ensure the brand slug matches
              },
            },
            populate: {
              car_brands: true, // Populate car brands if you need to include brand information
              car_trims: {
                where: {
                  ...(filterYear && { year: filterYear }),
                },
                populate: {
                  featuredImage: true,
                  gallery_images: true,
                },
              },
              highlights: {
                populate: {
                  exteriorImage: true, // Populate the image in highlights
                  interiorImage: true, // Populate the image in highlights
                  lists: true, // Populate the lists in highlights
                },
              },
              key_features: {
                populate: {
                  key_feature_title: {
                    populate: {
                      text: true,
                      icon: true,
                    },
                  },
                },
              },
              seo: true, // Populate the SEO fields
              articles: { // Populate the articles relation
                populate: {
                  title: true, // Replace "title" with the fields you need from the articles
                  summary: true, // Replace "content" with the fields you need from the articles
                  slug: true, // Example for related fields inside articles,
                  coverImage: true, // Example for related fields inside articles,
                  article_type: true,
                },
              },
            },
          });
    
        if (!model) {
          return ctx.notFound("Car model not found"); // Return a 404 if the model is not found
        }
    
        // Rest of the code remains the same
        const highTrimArray = model.car_trims;
        const validTrims = model.car_trims.filter((trim) => trim.price > 0);
        const specTrims = model.car_trims;

        const articles = model.articles.map((art) => {
          return {
            title: art.title, // Title of the article
            slug: art.slug, // Slug of the article
            summary: art.summary, // Slug of the article
            coverImage: art.coverImage, // Cover image object (populated data)
            article_type: art.article_type, // Categories of the article (populated data)
          };
        });
    
        // Determine min and max prices, power, and torque
        const prices = validTrims.map((trim) => trim.price);
        const powers = highTrimArray
          .map((trim) => trim.power)
          .filter((power) => power != null);
        const torques = highTrimArray
          .map((trim) => trim.torque)
          .filter((torque) => torque != null);
    
        const minPrice = prices.length ? Math.min(...prices) : null;
        const maxPrice = prices.length ? Math.max(...prices) : null;
        const minPower = powers.length ? Math.min(...powers) : null;
        const maxPower = powers.length ? Math.max(...powers) : null;
        const minTorque = torques.length ? Math.min(...torques) : null;
        const maxTorque = torques.length ? Math.max(...torques) : null;
    
        // Extract unique numbers of cylinders and seats from the trims
        const cylindersSet = new Set(
          highTrimArray
            .map((trim) => trim.cylinders)
            .filter((cylinders) => cylinders != null)
        );
        const seatsSet = new Set(
          highTrimArray
            .map((trim) => trim.seatingCapacity)
            .filter((seats) => seats != null)
        );
    
        const enginesSet = new Set(
          highTrimArray.map((trim) => {
            const displacementLiters = trim.displacement
              ? (trim.displacement / 1000).toFixed(1) + "L"
              : "";
            return `${displacementLiters} ${trim.engine}`.trim();
          })
        );
    
        const uniqueEngines = Array.from(enginesSet);
    
        const motorSet = new Set(
          highTrimArray.map((trim) => {
            return `${trim.motor}`.trim();
          })
        );
    
        const uniqueMotors = Array.from(motorSet);
    
        const transmissionSet = new Set(
          highTrimArray.map((trim) => {
            return `${trim.transmission}`.trim();
          })
        );
    
        const uniqueTransmission = Array.from(transmissionSet);
    
        const fuelConsumptions = highTrimArray
          .map((trim) => trim.fuelConsumption)
          .filter((fuelConsumption) => fuelConsumption > 0);
        const minFuelConsumption = fuelConsumptions.length
          ? Math.min(...fuelConsumptions)
          : null;
        const maxFuelConsumption = fuelConsumptions.length
          ? Math.max(...fuelConsumptions)
          : null;
    
        // Convert Sets back to arrays
        const uniqueCylinders = Array.from(cylindersSet);
        const uniqueSeats = Array.from(seatsSet);
    
        const allTrims = model.car_trims
          .map((trim) => ({
            id: trim.id,
            name: trim.name,
            slug: trim.slug,
            year: trim.year,
            transmission: trim.transmission,
            seatingCapacity: trim.seatingCapacity,
            engine: trim.engine,
            drive: trim.drive,
            power: trim.power,
            torque: trim.torque,
            price: trim.price,
            highTrim: trim.highTrim,
            featuredImage: trim.featuredImage ? trim.featuredImage.url : null,
            displacement: trim.displacement,
            range: trim.range,
          }))
          .sort((a, b) => {
            // Move trims with price 0 to the end
            if (a.price === 0) return 1;
            if (b.price === 0) return -1;
            // Then sort by price from lowest to highest
            return a.price - b.price;
          });
    
        // Custom formatting for highTrim trims
        const highTrim = highTrimArray
          .filter((trim) => trim.highTrim)
          .map((trim) => ({
            name: trim.name,
            slug: trim.slug,
            metaTitle: trim.metaTitle,
            mainSlug: trim.mainSlug,
            description: trim.description,
            year: trim.year,
            price: trim.price,
            featuredImage: trim.featuredImage ? trim.featuredImage.url : null,
            engine: trim.engine,
            power: trim.power,
            torque: trim.torque,
            transmission: trim.transmission,
            gearBox: trim.gearBox,
            drive: trim.drive,
            fuelType: trim.fuelType,
            motor: trim.motor,
            motorType: trim.motorType,
            batteryCapacity: trim.batteryCapacity,
            chargingTime: trim.chargingTime,
            batteryWarranty: trim.batteryWarranty,
            range: trim.range,
            zeroToHundred: trim.zeroToHundred,
            topSpeed: trim.topSpeed,
            fuelConsumption: trim.fuelConsumption,
            cylinders: trim.cylinders,
            haveABS: trim.haveABS,
            haveFrontAirbags: trim.haveFrontAirbags,
            haveSideAirbags: trim.haveSideAirbags,
            haveRearAirbags: trim.haveRearAirbags,
            haveFrontParkAssist: trim.haveFrontParkAssist,
            haveRearParkAssist: trim.haveRearParkAssist,
            haveRearParkingCamera: trim.haveRearParkingCamera,
            have360ParkingCamera: trim.have360ParkingCamera,
            haveCruiseControl: trim.haveCruiseControl,
            haveAdaptiveCruiseControl: trim.haveAdaptiveCruiseControl,
            haveLaneChangeAssist: trim.haveLaneChangeAssist,
            airbags: trim.airbags,
            doors: trim.doors,
            frontBrakes: trim.frontBrakes,
            rearBrakes: trim.rearBrakes,
            length: trim.length,
            width: trim.width,
            height: trim.height,
            wheelbase: trim.wheelbase,
            weight: trim.weight,
            wheels: trim.wheels,
            tyresFront: trim.tyresFront,
            tyresRear: trim.tyresRear,
            seatingCapacity: trim.seatingCapacity,
            haveLeatherInterior: trim.haveLeatherInterior,
            haveFabricInterior: trim.haveFabricInterior,
            haveAppleCarPlay: trim.haveAppleCarPlay,
            haveAndroidAuto: trim.haveAndroidAuto,
            haveRearSeatEntertainment: trim.haveRearSeatEntertainment,
            haveCooledSeats: trim.haveCooledSeats,
            haveClimateControl: trim.haveClimateControl,
            isLuxury: trim.isLuxury,
            isPremiumLuxury: trim.isPremiumLuxury,
            isSafety: trim.isSafety,
            isFuelEfficient: trim.isFuelEfficient,
            isOffRoad: trim.isOffRoad,
            haveMusic: trim.haveMusic,
            haveTechnology: trim.haveTechnology,
            havePerformance: trim.havePerformance,
            isSpacious: trim.isSpacious,
            isElectric: trim.isElectric,
            isDiscontinued: trim.isDiscontinued,
            galleryImages: trim.gallery_images
              ? trim.gallery_images.map((image) => image.url)
              : [],
            fuelTankSize: trim.fuelTankSize,
            cargoSpace: trim.cargoSpace,
            highTrim: trim.highTrim,
            displacement: trim.displacement,
          }));
    
        // Prepare the response with the model data, including filtered car trims
        const customResponse = {
          status: "success",
          data: {
            model: {
              id: model.id,
              name: model.name,
              slug: model.slug,
              highlightsExteriorImage: model?.highlights?.exteriorImage.url,
              highlightsInteriorImage: model?.highlights?.interiorImage.url,
              highlightsList: model?.highlights?.lists,
              key_features: model?.key_features,
              brand: model.car_brands
                ? {
                    name: model.car_brands[0].name,
                    slug: model.car_brands[0].slug,
                  }
                : null,
              trims: allTrims, // Array of all trims
              highTrim: highTrim, // Array of highTrim trims
              price: {
                min: minPrice,
                max: maxPrice,
              },
              power: {
                min: minPower,
                max: maxPower,
              },
              torque: {
                min: minTorque,
                max: maxTorque,
              },
              cylinders: uniqueCylinders,
              seats: uniqueSeats,
              engines: uniqueEngines,
              motors: uniqueMotors,
              fuelConsumption: {
                min: minFuelConsumption,
                max: maxFuelConsumption,
              },
              transmissionList: uniqueTransmission,
              articles,
            },
            seo: {
              metaTitle: model.seo?.metaTitle || null,
              metaDescription: model.seo?.metaDescription || null,
              metaImage: model.seo?.metaImage?.url || null,
              metaSocial: model.seo?.metaSocial || null,
              metaRobots: model.seo?.metaRobots || null,
              structuredData: model.seo?.structuredData || null,
              metaViewport: model.seo?.metaViewport || null,
              canonicalURL: model.seo?.canonicalURL || null,
            },
          },
        };
    
        return customResponse; // Return the custom response
      } catch (error) {
        console.error("Error fetching model by slug:", error);
        ctx.throw(500, "Internal server error");
      }
    },
    

    async findLatestYearBySlug(ctx) {
      try {
        const { slug } = ctx.params;

        // Fetch the car model by slug and populate trims to get the years
        const model = await strapi.db
          .query("api::car-model.car-model")
          .findOne({
            where: { slug: slug },
            populate: {
              car_trims: true,
            },
          });

        if (!model) {
          return ctx.notFound("Car model not found");
        }

        // Extract years from trims and find the latest year
        const allYears = model.car_trims.map((trim) => trim.year);
        const latestYear = allYears.length ? Math.max(...allYears) : null;

        // Return only the latest year in the response
        return ctx.send({
          status: "success",
          data: {
            latestYear,
          },
        });
      } catch (error) {
        console.error("Error fetching latest year by slug:", error);
        ctx.throw(500, "Internal server error");
      }
    },

    async unifiedSearch(ctx) {
      try {
        const { searchTerm } = ctx.query;

        // If no search term is provided, fetch recent searches
        if (!searchTerm) {
          const recentSearches = await strapi.db
            .query("api::recent-search.recent-search")
            .findMany({
              limit: 10, // Limit the number of recent searches to fetch
              orderBy: { createdAt: "desc" }, // Order by most recent
            });

          return (ctx.body = { data: recentSearches });
        }

        // Existing search logic for brands, models, and trims
        // Step 1: Search in car brands
        const brands = await strapi.db
          .query("api::car-brand.car-brand")
          .findMany({
            where: {
              name: { $containsi: searchTerm },
            },
          });

        let models = [];

        // Step 2: Fetch models associated with each brand if the search term matches a brand
        if (brands.length > 0) {
          for (const brand of brands) {
            const brandModels = await strapi.db
              .query("api::car-model.car-model")
              .findMany({
                where: {
                  car_brands: brand.id,
                },
                populate: ["car_brands", "car_trims"],
                limit: 16, // Limit the number of models fetched for each brand
                orderBy: [
                  { year: "desc" }, // Assuming 'year' is a column in your 'car-model' table
                  { name: "asc" },
                ],
              });

            // Format the model data to include brand and the highest trim year
            const formattedBrandModels = brandModels.map((model) => {
              const highestTrimYear = model.car_trims.reduce(
                (max, trim) => (trim.year > max ? trim.year : max),
                0
              );
              return {
                type: "model",
                id: model.id,
                name: model.name,
                slug: model.slug,
                brand: model.car_brands[0].name,
                brandSlug: model.car_brands[0].slug || "N/A",
                year: highestTrimYear,
              };
            });

            models = models.concat(formattedBrandModels);
          }
        }

        // Step 3: If no brand matches, search in car models with a similar limit
        if (models.length === 0) {
          models = await strapi.db
            .query("api::car-model.car-model")
            .findMany({
              where: {
                name: { $containsi: searchTerm },
              },
              populate: ["car_brands", "car_trims"],
              limit: 16,
              orderBy: [
                { year: "desc" }, // Assuming 'year' is a column in your 'car-model' table
                { name: "asc" },
              ],
            })
            .then((models) =>
              models.map((model) => {
                const highestTrimYear = model.car_trims.reduce(
                  (max, trim) => (trim.year > max ? trim.year : max),
                  0
                );
                return {
                  type: "model",
                  id: model.id,
                  name: model.name,
                  slug: model.slug,
                  brand: model.car_brands[0].name || "N/A",
                  brandSlug: model.car_brands[0].slug || "N/A",
                  year: highestTrimYear,
                };
              })
            );
        }

        // Step 4: Search in car trims
        const trims = await strapi.db
          .query("api::car-trim.car-trim")
          .findMany({
            where: {
              name: { $containsi: searchTerm },
            },
            populate: ["car_model", "car_model.car_brands"],
            limit: 16,
            orderBy: [
              { year: "desc" }, // Assuming 'year' is a column in your 'car-trim' table
              { name: "asc" },
            ],
          })
          .then((trims) =>
            trims.map((trim) => ({
              type: "trim",
              id: trim.id,
              name: trim.name,
              slug: trim.slug,
              model: trim.car_model.name,
              modelSlug: trim.car_model.slug || "N/A",
              brand: trim.car_model.car_brands[0].name || "N/A",
              brandSlug: trim.car_model.car_brands[0].slug || "N/A",
              year: trim.year,
            }))
          );

        // Step 5: Combined search for brands and models
        const combinedSearchModels = await strapi.db
          .query("api::car-model.car-model")
          .findMany({
            where: {
              $and: [
                {
                  name: { $containsi: searchTerm.split(" ")[1] || "" },
                },
                {
                  car_brands: {
                    name: { $containsi: searchTerm.split(" ")[0] || "" },
                  },
                },
              ],
            },
            populate: ["car_brands", "car_trims"],
            limit: 16,
            orderBy: [
              { year: "desc" }, // Assuming 'year' is a column in your 'car-model' table
              { name: "asc" },
            ],
          })
          .then((models) =>
            models.map((model) => {
              const highestTrimYear = model.car_trims.reduce(
                (max, trim) => (trim.year > max ? trim.year : max),
                0
              );
              return {
                type: "model",
                id: model.id,
                name: model.name,
                slug: model.slug,
                brand: model.car_brands[0].name || "N/A",
                brandSlug: model.car_brands[0].slug || "N/A",
                year: highestTrimYear,
              };
            })
          );

        // Format brands for the response, not including models within each brand
        const formattedBrands = brands.map((brand) => ({
          type: "brand",
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
        }));

        // Step 6: Combine brands, models, combinedSearchModels, and trims in the same array for the response
        const combinedResults = [
          ...formattedBrands,
          ...models,
          ...combinedSearchModels,
          ...trims,
        ];

        return (ctx.body = { data: combinedResults });
      } catch (error) {
        console.error("Search error:", error);
        ctx.throw(500, "Internal server error");
      }
    },

    // Override the default findOne method
    async findOldModel(ctx) {
      try {
        const { slug } = ctx.params;
        const entity = await strapi.db
          .query("api::car-model.car-model")
          .findOne({
            where: { slug: slug },
            populate: {
              car_brands: true,
            },
          });

        if (!entity) {
          return ctx.notFound("Car model not found");
        }

        const carTrims = await strapi.db
          .query("api::car-trim.car-trim")
          .findMany({
            where: {
              car_models: entity.id,
              highTrim: true,
            },
            populate: { featuredImage: true },
          });

        const carTrimsData = carTrims.map((trim) => ({
          id: trim.id,
          name: trim.name,
          slug: trim.slug,
          year: trim.year,
          featuredImage: trim.featuredImage ? trim.featuredImage.url : null,
          // Add other fields from car_trims that you need
        }));

        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

        // Custom response structure
        const customResponse = {
          status: "success",
          message: "Car model found successfully",
          data: {
            name: entity.name, // Example of renaming a field
            slug: entity.slug,
            trims: carTrimsData,
            brand: entity.car_brands[0]
              ? {
                name: entity.car_brands[0].name,
                slug: entity.car_brands[0].slug,
              }
              : null,

            // Add other fields as needed
          },
        };

        return customResponse; // Return the custom response
      } catch (error) {
        console.log(error, "errorerrorerror");
        ctx.badRequest("Error occurred", error);
      }
    },

    async listYearsUnderTrims(ctx) {
      try {
        const { modelId } = ctx.params;

        // Fetch trims associated with the given model
        const trims = await strapi.db.query("api::car-trim.car-trim").findMany({
          where: {
            car_models: modelId, // Filter by the model Id
          },
          // Assuming 'year' is a field in your 'car-trim' model
          populate: ["year"],
        });

        // Extract unique years
        const years = [...new Set(trims.map((trim) => trim.year))].sort(
          (a, b) => b - a
        );

        // Return the list of available years under each trim
        ctx.body = years;
      } catch (error) {
        console.error("Error fetching years:", error);
        ctx.throw(500, "Internal server error");
      }
    },

    async findTrimsByYear(ctx) {
      try {
        const { modelId, year } = ctx.params;

        const targetYear = parseInt(year);

        // Step 1: Find the car model by slug and populate car_trims
        const model = await strapi.db
          .query("api::car-model.car-model")
          .findOne({
            where: { id: modelId },
            populate: ["car_trims", "car_trims.featuredImage"],
          });

        if (!model) {
          return ctx.notFound("Car model not found");
        }

        console.log(model, "model model ");

        // Step 2: Filter car_trims based on the provided year
        const filteredTrims = model.car_trims
          .filter((trim) => trim.year === targetYear && trim.price > 0)
          .map((trim) => ({
            name: trim.name,
            price: trim.price,
            featuredImage: trim.featuredImage.url,
          }));

        // Step 3: Create a custom response
        const customResponse = {
          status: "success",
          message: "Filtered trims found successfully",
          data: {
            model: {
              name: model.name,
              slug: model.slug,
              // Add other model-related data as needed
            },
            year: year,
            trims: filteredTrims,
          },
        };

        return customResponse; // Return the custom response with filtered trims
      } catch (error) {
        console.log(error, "errorerrorerror");
        ctx.badRequest("Error occurred", error);
      }
    },
    async findModelsWithVideos(ctx) {
      try {
        const { brandSlug } = ctx.query;

        // Check if brandSlug is provided
        if (!brandSlug) {
          ctx.throw(400, "Brand slug is required");
        }

        // Fetch the brand by its slug to get the brand ID
        const brand = await strapi.db.query("api::car-brand.car-brand").findOne({
          where: { slug: brandSlug },
        });

        if (!brand) {
          ctx.throw(404, "Brand not found");
        }

        // Fetch models that belong to the specified brand and have at least one associated video
        const modelsWithVideos = await strapi.db.query("api::car-model.car-model").findMany({
          where: {
            car_brands: { id: brand.id }, // Filter by the brand ID
            select_related_videos: { id: { $notNull: true } } // Ensure the model has at least one related video
          },
          populate: {
            select_related_videos: true, // Populate the relation with car videos to confirm they exist
          },
        });

        // Map the results to return only necessary fields
        const customResponse = modelsWithVideos.map((model) => ({
          id: model.id,
          name: model.name,
          slug: model.slug,
        }));

        // Return the list of models with videos
        ctx.body = customResponse;
      } catch (error) {
        ctx.throw(500, `Failed to fetch models with videos: ${error.message}`);
      }
    },





    async findModelsByBrandSlug(ctx) {
      const { brandSlug } = ctx.params;
      const { page = 1, pageSize = 10, search = "", sort = "latestYear", order = "desc", fromyear } = ctx.query;
    
      if (!brandSlug) {
        return ctx.throw(400, "Brand slug is required.");
      }
    
      try {
        const orderByClause = (sort === "latestYear" || sort === "modelName") ? `${sort} ${order.toUpperCase()}` : "latestYear DESC";
        const offset = (page - 1) * pageSize;
        const yearFilter = fromyear ? `AND car_trims.year >= ${parseInt(fromyear)}` : "";
    
        // Count query with year filter
        const countResult = await strapi.db.connection.raw(`
          SELECT COUNT(DISTINCT car_models.id) AS total
          FROM car_trims
          JOIN car_trims_car_models_links ON car_trims_car_models_links.car_trim_id = car_trims.id
          JOIN car_models ON car_trims_car_models_links.car_model_id = car_models.id
          JOIN car_trims_car_brands_links ON car_trims_car_brands_links.car_trim_id = car_trims.id
          JOIN car_brands ON car_trims_car_brands_links.car_brand_id = car_brands.id
          WHERE car_trims.high_trim = true
            AND car_trims.published_at IS NOT NULL
            AND car_models.published_at IS NOT NULL
            AND car_brands.slug = ?
            AND car_models.name ILIKE ?
            ${yearFilter}
        `, [brandSlug, `%${search}%`]);
    
        const totalModels = countResult.rows[0].total;
    
        // Main query to retrieve only the latest year model for each unique model
        const result = await strapi.db.connection.raw(`
          SELECT 
              car_models.name AS modelName,
              car_models.slug AS modelSlug,
              car_brands.name AS brandName,
              car_brands.slug AS brandSlug,
              MAX(car_trims.year) AS latestYear,
              featuredImage.url AS featuredImageUrl
          FROM car_trims
          JOIN car_trims_car_models_links ON car_trims_car_models_links.car_trim_id = car_trims.id
          JOIN car_models ON car_trims_car_models_links.car_model_id = car_models.id
          JOIN car_trims_car_brands_links ON car_trims_car_brands_links.car_trim_id = car_trims.id
          JOIN car_brands ON car_trims_car_brands_links.car_brand_id = car_brands.id
          LEFT JOIN files_related_morphs AS featured_image_frm ON featured_image_frm.related_id = car_trims.id
              AND featured_image_frm.related_type = 'api::car-trim.car-trim' AND featured_image_frm.field = 'featuredImage'
          LEFT JOIN files AS featuredImage ON featuredImage.id = featured_image_frm.file_id
          WHERE car_trims.high_trim = true
            AND car_trims.published_at IS NOT NULL
            AND car_models.published_at IS NOT NULL
            AND car_brands.slug = ?
            AND car_models.name ILIKE ?
            ${yearFilter}
          GROUP BY car_models.id, car_brands.name, car_brands.slug, featuredImage.url
          HAVING MAX(car_trims.year) = (
              SELECT MAX(ct.year)
              FROM car_trims AS ct
              JOIN car_trims_car_models_links AS ctcm ON ctcm.car_trim_id = ct.id
              WHERE ctcm.car_model_id = car_models.id
                AND ct.high_trim = true
          )
          ORDER BY ${orderByClause}
          LIMIT ?
          OFFSET ?;
        `, [brandSlug, `%${search}%`, parseInt(pageSize), offset]);
    
        const modelData = result.rows;
    
        // Format the data to return model name, slug, latestYear, brand name, brand slug, and featured image URL
        const sortedModels = modelData.map(model => ({
          name: model.modelname,
          slug: model.modelslug,
          latestYear: model.latestyear,
          brandName: model.brandname,
          brandSlug: model.brandslug,
          featuredImage: model.featuredimageurl || null,
        }));
    
        // Calculate pagination using the total count from the count query
        const pagination = {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          pageCount: Math.ceil(totalModels / pageSize),
          total: totalModels,
        };
    
        const yearCountMap = sortedModels.reduce((acc, model) => {
          const { latestYear } = model;
          acc[latestYear] = (acc[latestYear] || 0) + 1;
          return acc;
        }, {});
    
        const formattedYearCounts = Object.entries(yearCountMap)
          .map(([year, count]) => ({ year: parseInt(year), count }))
          .sort((a, b) => b.year - a.year);
    
        return ctx.send({
          status: "success",
          data: {
            models: sortedModels,
            pagination,
            yearCounts: formattedYearCounts,
          },
        });
      } catch (error) {
        console.error("Error fetching models by latest model year for brand:", error);
        ctx.throw(500, "Internal server error");
      }
    }
    
  })
);
