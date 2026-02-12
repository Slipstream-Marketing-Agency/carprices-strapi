"use strict";

const { sanitize } = require('@strapi/utils');

const { createCoreController } = require("@strapi/strapi").factories;

const extractQueryParams = (ctx) => {
  let {
    brands,
    bodyTypes,
    fuelType,
    cylinders,
    drive,
    transmission,
    priceRanges,
    displacementRanges,
    powerRanges,
    haveMusic,
    isLuxury,
    isPremiumLuxury,
    haveTechnology,
    havePerformance,
    isSpacious,
    isElectric,
    isFuelEfficient,
    isOffRoad,
    isManualTransmission,
    isAffordableLuxury,
    isSafety,
    isDuneBashing,
    isOneSeat,
    isTwoSeat,
    isTwoPlusTwo,
    isThreeSeat,
    isFourSeat,
    isFiveSeat,
    isSixSeat,
    isSevenSeat,
    isEightSeat,
    isNineSeat,
    isNinePlusSeat,
  } = ctx.query;

  const parseJSON = (param) => {
    if (typeof param === "string") {
      try {
        return JSON.parse(param);
      } catch (err) {
        throw new Error(`Invalid format for ${param}`);
      }
    }
    return param || []; // Ensure non-JSON parsed parameters default to an empty array
  };

  return {
    brands: parseJSON(brands),
    bodyTypes: parseJSON(bodyTypes),
    fuelType: parseJSON(fuelType),
    cylinders: parseJSON(cylinders),
    drive: parseJSON(drive),
    transmission: parseJSON(transmission),
    priceRanges: parseJSON(priceRanges),
    displacementRanges: parseJSON(displacementRanges),
    powerRanges: parseJSON(powerRanges),
    haveMusic: haveMusic === "1",
    isLuxury: isLuxury === "1",
    isPremiumLuxury: isPremiumLuxury === "1",
    haveTechnology: haveTechnology === "1",
    havePerformance: havePerformance === "1",
    isSpacious: isSpacious === "1",
    isElectric: isElectric === "1",
    isFuelEfficient: isFuelEfficient === "1",
    isOffRoad: isOffRoad === "1",
    isManualTransmission: isManualTransmission === "1",
    isAffordableLuxury: isAffordableLuxury === "1",
    isSafety: isSafety === "1",
    isDuneBashing: isDuneBashing === "1",
    isOneSeat: isOneSeat === "1",
    isTwoSeat: isTwoSeat === "1",
    isTwoPlusTwo: isTwoPlusTwo === "1",
    isThreeSeat: isThreeSeat === "1",
    isFourSeat: isFourSeat === "1",
    isFiveSeat: isFiveSeat === "1",
    isSixSeat: isSixSeat === "1",
    isSevenSeat: isSevenSeat === "1",
    isEightSeat: isEightSeat === "1",
    isNineSeat: isNineSeat === "1",
    isNinePlusSeat: isNinePlusSeat === "1",
  };
};

module.exports = createCoreController(
  "api::car-trim.car-trim",
  ({ strapi }) => ({

    async globalSearch(ctx) {
      const { keyword } = ctx.query;
  
      if (!keyword) {
        return ctx.badRequest("Missing keyword parameter");
      }
  
      // Split keyword into individual terms
      const keywords = keyword.split(" ").map(term => term.trim());
  
      try {
        // Search in car brands
        const brandResults = await strapi.db.query("api::car-brand.car-brand").findMany({
          where: {
            $or: keywords.map(term => ({
              name: {
                $containsi: term,
              },
            })),
          },
          populate: ["brandLogo"],
        });
  
        // Search in car models
        const modelResults = await strapi.db.query("api::car-model.car-model").findMany({
          where: {
            $or: keywords.map(term => ({
              name: {
                $containsi: term,
              },
            })),
          },
          populate: ["featuredImage", "car_brands"],
        });
  
        // Search in car trims, including car brand and model names
        const trimResults = await strapi.db.query("api::car-trim.car-trim").findMany({
          where: {
            $or: keywords.map(term => ({
              name: { $containsi: term },
              car_brands: { name: { $containsi: term } },
              car_models: { name: { $containsi: term } },
            })),
          },
          populate: ["featuredImage", "car_brands", "car_models"],
        });
  
        // Sanitize and format trim results
        const sanitizedTrimResults = await Promise.all(
          trimResults.map(async (trim) => {
            const sanitizedTrim = await sanitize.contentAPI.output(
              trim,
              strapi.contentTypes["api::car-trim.car-trim"],
              ctx
            );
  
            const brandName = sanitizedTrim.car_brands?.[0]?.name || "Unknown Brand";
            const modelName = sanitizedTrim.car_models?.[0]?.name || "Unknown Model";
            const year = sanitizedTrim.year || "Unknown Year";
  
            // Format as "Year + Brand + Model Name"
            sanitizedTrim.displayText = `${year} ${brandName} ${modelName}`;
  
            return {
              brandName,
              displayText: sanitizedTrim.displayText,
              featuredImage: sanitizedTrim.featuredImage,
            };
          })
        );
  
        // Group trims under each brand
        const groupedResults = brandResults.reduce((acc, brand) => {
          const brandName = brand.name;
          acc[brandName] = sanitizedTrimResults
            .filter(trim => trim.brandName === brandName)
            .map(trim => trim.displayText);
          return acc;
        }, {});
        // Combine and return results
        ctx.send({
          brands: brandResults,
          models: modelResults,
          trims: groupedResults,
        });
      } catch (error) {
        console.error("Error during search:", error);
        ctx.internalServerError("An error occurred during the search");
      }
    },
    // async searchcars(ctx) {
    //   try {
    //     // Get the search term from query parameters
    //     const searchTerm = ctx.query.searchTerm;

    //     // Call a custom service method and pass the search term
    //     const data = await strapi.services[
    //       "api::car-trim.car-trim"
    //     ].customSearch(searchTerm);
    //     // Manipulate and structure the data as per your custom requirements
    //     const customResponse = data.map((item) => {
    //       return {
    //         name: entity.name,
    //         slug: entity.slug,
    //       };
    //     });

    //     // Return the custom response
    //     ctx.body = customResponse;
    //   } catch (error) {
    //     ctx.throw(500, error);
    //   }
    // },
    async findOneTrim(ctx) {
      try {
        const { slug, year, modelSlug } = ctx.params;
        const filterYear = year ? parseInt(year) : null;

        // Fetch the specific trim
        const entity = await strapi.db.query("api::car-trim.car-trim").findOne({
          where: {
            slug: slug,
            year: filterYear,
            car_models: {
              slug: modelSlug,
            },
          },
          populate: {
            car_brands: true,
            car_models: true,
            car_body_types: true,
            featuredImage: true,
            gallery_images: true,
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
            seo: true,
          },
        });

        console.log(entity, "entityentity");

        if (!entity) {
          return ctx.notFound("Car Trim not found");
        }

        // Fetch all trims related to the same car model and year
        const relatedTrims = await strapi.db
          .query("api::car-trim.car-trim")
          .findMany({
            where: {
              car_models: {
                slug: modelSlug,
              },
              year: filterYear, // Filter by the same year
            },
            populate: {
              featuredImage: true,
            },
          });

        // Map the related trims to a simplified structure
        const relatedTrimsData = relatedTrims.map((trim) => ({
          name: trim.name,
          slug: trim.slug,
          year: trim.year,
          price: trim.price,
          featuredImage: trim.featuredImage ? trim.featuredImage.url : null,
        }));

        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

        let imageUrls = [];

        if (entity && Array.isArray(entity.gallery_images)) {
          imageUrls = entity.gallery_images.map((image) => image.url);
        }

        // Custom response structure
        const customResponse = {
          status: "success",
          message: "Car Trim found successfully",
          data: {
            name: entity.name,
            slug: entity.slug,
            metaTitle: entity.metaTitle,
            mainSlug: entity.mainSlug,
            description: entity.description,
            key_features: entity?.key_features,
            brand: entity.car_brands?.[0]?.name || null,
            model: entity.car_models?.[0]?.name || null,
            bodyType: entity.car_body_types?.[0]?.name || null,
            year: entity.year,
            price: entity.price,
            featuredImage: entity.featuredImage
              ? entity.featuredImage.url
              : null,
            engine: entity.engine,
            power: entity.power,
            torque: entity.torque,
            transmission: entity.transmission,
            gearBox: entity.gearBox,
            drive: entity.drive,
            fuelType: entity.fuelType,
            motor: entity.motor,
            motorType: entity.motorType,
            batteryCapacity: entity.batteryCapacity,
            chargingTime: entity.chargingTime,
            batteryWarranty: entity.batteryWarranty,
            range: entity.range,
            zeroToHundred: entity.zeroToHundred,
            topSpeed: entity.topSpeed,
            fuelConsumption: entity.fuelConsumption,
            cylinders: entity.cylinders,
            haveABS: entity.haveABS,
            haveFrontAirbags: entity.haveFrontAirbags,
            haveSideAirbags: entity.haveSideAirbags,
            haveRearAirbags: entity.haveRearAirbags,
            haveFrontParkAssist: entity.haveFrontParkAssist,
            haveRearParkAssist: entity.haveRearParkAssist,
            haveRearParkingCamera: entity.haveRearParkingCamera,
            have360ParkingCamera: entity.have360ParkingCamera,
            haveCruiseControl: entity.haveCruiseControl,
            haveAdaptiveCuriseControl: entity.haveAdaptiveCruiseControl,
            haveLaneChangeAssist: entity.haveLaneChangeAssist,
            airbags: entity.airbags,
            doors: entity.doors,
            frontBrakes: entity.frontBrakes,
            rearBrakes: entity.rearBrakes,
            length: entity.length,
            width: entity.width,
            height: entity.height,
            wheelbase: entity.wheelbase,
            weight: entity.weight,
            wheels: entity.wheels,
            tyresFront: entity.tyresFront,
            tyresRear: entity.tyresRear,
            seatingCapacity: entity.seatingCapacity,
            haveLeatherInterior: entity.haveLeatherInterior,
            haveFabricInterior: entity.haveFabricInterior,
            haveAppleCarPlay: entity.haveAppleCarPlay,
            haveAndroidAuto: entity.haveAndroidAuto,
            haveRearSeatEntertainment: entity.haveRearSeatEntertainment,
            haveCooledSeats: entity.haveCooledSeats,
            haveClimateControl: entity.haveClimateControl,
            isLuxury: entity.isLuxury,
            isPremiumLuxury: entity.isPremiumLuxury,
            isSafety: entity.isSafety,
            isFuelEfficient: entity.isFuelEfficient,
            isOffRoad: entity.isOffRoad,
            haveMusic: entity.haveMusic,
            haveTechnology: entity.haveTechnology,
            havePerformance: entity.havePerformance,
            isSpacious: entity.isSpacious,
            isElectric: entity.isElectric,
            isDiscontinued: entity.isDiscontinued,
            galleryImages: imageUrls,
            fuelTankSize: entity.fuelTankSize,
            cargoSpace: entity.cargoSpace,
            highTrim: entity.highTrim,
            displacement: entity.displacement,
            relatedTrims: relatedTrimsData, // Add the related trims data here
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
          },
        };

        return customResponse; // Return the custom response
      } catch (error) {
        console.log(error, "errorerrorerror");
        ctx.badRequest("Error occurred", error);
      }
    },

    async listFuelTypes(ctx) {
      try {
        const fuelTypes = await strapi
          .service("api::car-trim.car-trim")
          .getFuelTypes();
        ctx.body = fuelTypes;
      } catch (err) {
        ctx.status = 500;
        ctx.body = "Internal Server Error: " + err.message;
      }
    },

    async listFuelTypesByBrand(ctx) {
      try {
        const brandId = ctx.query.brand;
        if (!brandId) {
          return ctx.badRequest("No brand specified");
        }

        const fuelTypes = await strapi.services[
          "api::car-trim.car-trim"
        ].getFuelTypesByBrand(brandId);
        ctx.body = fuelTypes;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async listFilteredFuelTypes(ctx) {
      try {
        const queryParams = ctx.query;

        // Creating a filters object with proper validation and conversion
        const filters = {
          car_brands: queryParams.brand ? { id: queryParams.brand } : undefined,
          minPrice: queryParams.minPrice
            ? parseFloat(queryParams.minPrice)
            : undefined,
          maxPrice: queryParams.maxPrice
            ? parseFloat(queryParams.maxPrice)
            : undefined,
          power: queryParams.power ? parseFloat(queryParams.power) : undefined,
          displacement: queryParams.displacement
            ? parseFloat(queryParams.displacement)
            : undefined,
          transmission: queryParams.transmission,
          transmission: queryParams.cylinders
            ? parseInt(queryParams.cylinders, 10)
            : undefined,
          drive: queryParams.drive,
        };

        // Removing undefined filters
        Object.keys(filters).forEach(
          (key) => filters[key] === undefined && delete filters[key]
        );

        const fuelTypes = await strapi.services[
          "api::car-trim.car-trim"
        ].getFilteredFuelTypes(filters);
        ctx.body = fuelTypes;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getFilterLists(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getFilterLists(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getFuelLists(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getFuelLists(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getBrandList(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        console.log(priceRanges, "priceRangesTop1");
        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        console.log(priceRanges, "priceRangesTop2");

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getBrandList(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getBodyLists(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getBodyLists(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getCylinderList(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getCylinderList(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getDriveLists(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getDriveLists(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getTransmissionList(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getTransmissionList(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getPriceRange(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getPriceRange(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getPowerRange(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getPowerRange(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getDisplacementRange(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getDisplacementRange(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,

          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async getSeatList(ctx) {
      try {
        let brands = ctx.query.brands;
        let bodyTypes = ctx.query.bodyTypes;
        let fuelType = ctx.query.fuelType;
        let cylinders = ctx.query.cylinders;
        let drive = ctx.query.drive;
        let transmission = ctx.query.transmission;
        let priceRanges = ctx.query.priceRanges;
        let displacementRanges = ctx.query.displacementRanges;
        let powerRanges = ctx.query.powerRanges;
        const haveMusic = ctx.query.haveMusic;
        const isLuxury = ctx.query.isLuxury;
        const isPremiumLuxury = ctx.query.isPremiumLuxury;
        const haveTechnology = ctx.query.haveTechnology;
        const havePerformance = ctx.query.havePerformance;
        const isSpacious = ctx.query.isSpacious;
        const isElectric = ctx.query.isElectric;
        const isFuelEfficient = ctx.query.isFuelEfficient;
        const isOffRoad = ctx.query.isOffRoad;
        const isManualTransmission = ctx.query.isManualTransmission;
        const isAffordableLuxury = ctx.query.isAffordableLuxury;
        const isSafety = ctx.query.isSafety;
        const isDuneBashing = ctx.query.isDuneBashing;
        const isOneSeat = ctx.query.isOneSeat === "1";
        const isTwoSeat = ctx.query.isTwoSeat === "1";
        const isTwoPlusTwo = ctx.query.isTwoPlusTwo === "1";
        const isThreeSeat = ctx.query.isThreeSeat === "1";
        const isFourSeat = ctx.query.isFourSeat === "1";
        const isFiveSeat = ctx.query.isFiveSeat === "1";
        const isSixSeat = ctx.query.isSixSeat === "1";
        const isSevenSeat = ctx.query.isSevenSeat === "1";
        const isEightSeat = ctx.query.isEightSeat === "1";
        const isNineSeat = ctx.query.isNineSeat === "1";
        const isNinePlusSeat = ctx.query.isNinePlusSeat === "1";

        console.log(isDuneBashing, "isDuneBashing");

        // Check if brands is a string and try to parse it as JSON
        if (typeof brands === "string") {
          try {
            brands = JSON.parse(brands);
          } catch (err) {
            return ctx.badRequest("Invalid format for brands");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
          brands = null;
        }

        if (typeof bodyTypes === "string") {
          try {
            bodyTypes = JSON.parse(bodyTypes);
          } catch (err) {
            return ctx.badRequest("Invalid format for bodyTypes");
          }
        }

        // If bodyTypes is not provided or is an empty array, handle accordingly in the service
        if (!bodyTypes || !Array.isArray(bodyTypes) || bodyTypes.length === 0) {
          bodyTypes = null;
        }

        if (typeof cylinders === "string") {
          try {
            cylinders = JSON.parse(cylinders);
          } catch (err) {
            return ctx.badRequest("Invalid format for cylinders");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!cylinders || !Array.isArray(cylinders) || cylinders.length === 0) {
          cylinders = null;
        }

        if (typeof fuelType === "string") {
          try {
            fuelType = JSON.parse(fuelType);
          } catch (err) {
            return ctx.badRequest("Invalid format for fuelType");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!fuelType || !Array.isArray(fuelType) || fuelType.length === 0) {
          fuelType = null;
        }

        if (typeof drive === "string") {
          try {
            drive = JSON.parse(drive);
          } catch (err) {
            return ctx.badRequest("Invalid format for drive");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (!drive || !Array.isArray(drive) || drive.length === 0) {
          drive = null;
        }

        if (typeof transmission === "string") {
          try {
            transmission = JSON.parse(transmission);
          } catch (err) {
            return ctx.badRequest("Invalid format for transmission");
          }
        }

        // If brands is not provided or is an empty array, handle accordingly in the service
        if (
          !transmission ||
          !Array.isArray(transmission) ||
          transmission.length === 0
        ) {
          transmission = null;
        }

        // Parse and validate priceRanges if it's a string
        if (typeof priceRanges === "string") {
          try {
            priceRanges = JSON.parse(priceRanges);
          } catch (err) {
            return ctx.badRequest("Invalid format for priceRanges");
          }
        }

        // Parse and validate displacementRanges and powerRanges
        if (typeof displacementRanges === "string") {
          displacementRanges = JSON.parse(displacementRanges);
        }
        if (typeof powerRanges === "string") {
          powerRanges = JSON.parse(powerRanges);
        }

        const priceRange = await strapi.services[
          "api::car-trim.car-trim"
        ].getSeatList(
          brands,
          bodyTypes,
          cylinders,
          fuelType,
          drive,
          priceRanges,
          displacementRanges,
          powerRanges,
          transmission,
          haveMusic,
          isLuxury,
          isPremiumLuxury,
          haveTechnology,
          havePerformance,
          isSpacious,
          isElectric,
          isFuelEfficient,
          isOffRoad,
          isManualTransmission,
          isAffordableLuxury,
          isDuneBashing,
          isSafety,
          isOneSeat,
          isTwoPlusTwo,
          isTwoSeat,
          isThreeSeat,
          isFourSeat,
          isFiveSeat,
          isSixSeat,
          isSevenSeat,
          isEightSeat,
          isNineSeat,
          isNinePlusSeat
        );
        ctx.body = priceRange;
      } catch (err) {
        ctx.throw(500, err);
      }
    },

    async fetchCarTrims(ctx) {
      try {
        const sort = ctx.query.sort || ["year:desc", "price:asc"];
        const page = parseInt(ctx.query.page, 10) || 1;
        const pageSize = parseInt(ctx.query.pageSize, 10) || 10;

        const brands = ctx.query.brands ? JSON.parse(ctx.query.brands) : [];
        const bodyTypes = ctx.query.bodyTypes
          ? JSON.parse(ctx.query.bodyTypes)
          : [];
        const cylinders = ctx.query.cylinders
          ? JSON.parse(ctx.query.cylinders)
          : [];
        const fuelType = ctx.query.fuelType
          ? JSON.parse(ctx.query.fuelType)
          : [];
        const drive = ctx.query.drive ? JSON.parse(ctx.query.drive) : [];
        const priceRanges = ctx.query.priceRanges
          ? JSON.parse(ctx.query.priceRanges)
          : [];
        const displacementRanges = ctx.query.displacementRanges
          ? JSON.parse(ctx.query.displacementRanges)
          : [];
        const powerRanges = ctx.query.powerRanges
          ? JSON.parse(ctx.query.powerRanges)
          : [];
        const transmission = ctx.query.transmission
          ? JSON.parse(ctx.query.transmission)
          : [];

        // Building range filters
        const priceRangeFilter = priceRanges.map((range) => ({
          price: { $gte: range.min, $lte: range.max },
        }));
        const displacementRangeFilter = displacementRanges.map((range) => ({
          displacement: { $gte: range.min, $lte: range.max },
        }));
        const powerRangeFilter = powerRanges.map((range) => ({
          power: { $gte: range.min, $lte: range.max },
        }));

        let filters = {
          $and: [
            { year: { $gte: new Date().getFullYear() } }, // Default filter for year
            { price: { $gte: 0 } }, // Default filter for price
            { highTrim: true }, // Default filter for highTrim
            { publishedAt: { $ne: null } },
            ...(brands.length > 0
              ? [{ car_brands: { slug: { $in: brands } } }]
              : []),
            ...(bodyTypes.length > 0
              ? [{ car_body_types: { slug: { $in: bodyTypes } } }]
              : []),
            ...(cylinders.length > 0
              ? [{ cylinders: { $in: cylinders } }]
              : []),
            ...(transmission.length > 0
              ? [{ transmission: { $in: transmission } }]
              : []),
            ...(fuelType.length > 0 ? [{ fuelType: { $in: fuelType } }] : []),
            ...(drive.length > 0 ? [{ drive: { $in: drive } }] : []),
            ...(priceRangeFilter.length > 0 ? [{ $or: priceRangeFilter }] : []),
            ...(displacementRangeFilter.length > 0
              ? [{ $or: displacementRangeFilter }]
              : []),
            ...(powerRangeFilter.length > 0 ? [{ $or: powerRangeFilter }] : []),
          ],
        };
        // Aconst isSafety = ctx.query.isSafety; logic to populate filters based on other ctx.query parameters

        const { results, total } = await strapi.services[
          "api::car-trim.car-trim"
        ].findWithPagination({
          filters,
          page,
          pageSize,
          sort,
        });

        // Format response
        const formattedResults = await Promise.all(
          results.map(async (entity) => {
            // Format each car trim entity as needed
            const trims = await strapi.entityService.findMany(
              "api::car-trim.car-trim",
              {
                filters: {
                  car_models: entity.car_models[0].id,
                  year: { $gte: new Date().getFullYear() },
                  price: { $gt: 0 },
                },
                fields: ["price"],
              }
            );

            const prices = trims
              .map((trim) => trim.price)
              .filter((price) => price != null);
            const minPrice = prices.length ? Math.min(...prices) : null;
            const maxPrice = prices.length ? Math.max(...prices) : null;

            return {
              id: entity.id,
              name: entity.name,
              slug: entity.slug,
              brand: entity.car_brands[0]
                ? {
                  name: entity.car_brands[0].name,
                  slug: entity.car_brands[0].slug,
                  logo: entity.car_brands[0].brandLogo
                    ? entity.car_brands[0].brandLogo.url
                    : null,
                }
                : null,
              model: entity.car_models[0]
                ? {
                  name: entity.car_models[0].name,
                  slug: entity.car_models[0].slug,
                  year: entity.car_models[0].year,
                }
                : null,
              featuredImage: entity.featuredImage
                ? entity.featuredImage?.formats?.thumbnail?.url
                : null,
              year: entity.year,
              price: entity.price,
              power: entity.power,
              displacement: entity.displacement,
              transmission: entity.transmission,
              cylinders: entity.cylinders,
              bodyType: entity.car_body_types[0].name,
              minPrice, // Include the calculated min price
              maxPrice, // Include the calculated max price
            };
          })
        );

        // Return response with pagination
        ctx.body = {
          code: 200,
          message: "Success",
          data: {
            list: formattedResults,
            pagination: {
              page,
              pageSize,
              pageCount: Math.ceil(total / pageSize),
              total,
            },
          },
        };
      } catch (error) {
        ctx.status = 500;
        ctx.body = {
          code: "500",
          message: "Internal Server Error",
          data: {},
        };
      }
    },

    async homeFilter(ctx) {
      try {
        const queryParams = extractQueryParams(ctx);

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

        const page = parseInt(ctx.query.page, 10) || 1;
        const pageSize = parseInt(ctx.query.pageSize, 10) || 10;

        const seatingCapacityMap = {
          isOneSeat: ["1 Seater"],
          isTwoSeat: ["2 Seater"],
          isTwoPlusTwo: ["2 + 2 Seater"],
          isThreeSeat: ["3 Seater"],
          isFourSeat: ["4 Seater"],
          isFiveSeat: ["5 Seater"],
          isSixSeat: ["6 Seater"],
          isSevenSeat: ["7 Seater"],
          isEightSeat: ["8 Seater"],
          isNineSeat: ["9 Seater"],
          isNinePlusSeat: [
            "11 Seater",
            "12 Seater",
            "13 Seater",
            "14 Seater",
            "15 Seater",
            "16 Seater",
          ],
        };

        let seatingCapacities = [];
        for (const [param, capacities] of Object.entries(seatingCapacityMap)) {
          if (ctx.query[param] === "1") {
            seatingCapacities = [
              ...new Set([...seatingCapacities, ...capacities]),
            ];
          }
        }

        // Building range filters
        const priceRangeFilter = queryParams.priceRanges.map((range) => ({
          price: { $gte: range.min, $lte: range.max },
        }));
        const displacementRangeFilter = queryParams.displacementRanges.map(
          (range) => ({
            displacement: { $gte: range.min, $lte: range.max },
          })
        );
        const powerRangeFilter = queryParams.powerRanges.map((range) => ({
          power: { $gte: range.min, $lte: range.max },
        }));

        let filters = {
          $and: [
            { year: { $gte: new Date().getFullYear() } }, // Default filter for year
            {
              $or: [
                { price: { $gt: 0 } }, // Include cars with price greater than 0
                { price: { $eq: null } }, // Include cars with null/undefined price (if needed)
              ],
            },
            { highTrim: true }, // Default filter for highTrim
            { publishedAt: { $ne: null } },
            ...(queryParams.brands.length > 0
              ? [{ car_brands: { slug: { $in: queryParams.brands } } }]
              : []),
            ...(queryParams.bodyTypes.length > 0
              ? [{ car_body_types: { slug: { $in: queryParams.bodyTypes } } }]
              : []),
            ...(queryParams.cylinders.length > 0
              ? [{ cylinders: { $in: queryParams.cylinders } }]
              : []),
            ...(queryParams.transmission.length > 0
              ? [{ transmission: { $in: queryParams.transmission } }]
              : []),
            ...(queryParams.fuelType.length > 0
              ? [{ fuelType: { $in: queryParams.fuelType } }]
              : []),
            ...(queryParams.drive.length > 0
              ? [{ drive: { $in: queryParams.drive } }]
              : []),
            ...(priceRangeFilter.length > 0 ? [{ $or: priceRangeFilter }] : []),
            ...(displacementRangeFilter.length > 0
              ? [{ $or: displacementRangeFilter }]
              : []),
            ...(powerRangeFilter.length > 0 ? [{ $or: powerRangeFilter }] : []),
            ...(queryParams.isPremiumLuxury ? [{ isPremiumLuxury: true }] : []),
            ...(queryParams.haveMusic ? [{ haveMusic: true }] : []),
            ...(queryParams.isLuxury ? [{ isLuxury: true }] : []),
            ...(queryParams.haveTechnology ? [{ haveTechnology: true }] : []),
            ...(queryParams.havePerformance ? [{ havePerformance: true }] : []),
            ...(queryParams.isSpacious ? [{ isSpacious: true }] : []),
            ...(queryParams.isElectric ? [{ isElectric: true }] : []),
            ...(queryParams.isFuelEfficient ? [{ isFuelEfficient: true }] : []),
            ...(queryParams.isManualTransmission
              ? [{ isManualTransmission: true }]
              : []),
            ...(queryParams.isAffordableLuxury
              ? [{ isAffordableLuxury: true }]
              : []),
            ...(queryParams.isDuneBashing ? [{ isDuneBashing: true }] : []),
            ...(queryParams.isSafety ? [{ isSafety: true }] : []),
            ...(queryParams.isOffRoad ? [{ isOffRoad: true }] : []),
            ...(seatingCapacities.length > 0
              ? [{ seatingCapacity: { $in: seatingCapacities } }]
              : []),
          ],
        };

        // Debugging information
        console.log("Filters:", filters);

        const allFilteredCars = await strapi.entityService.findMany(
          "api::car-trim.car-trim",
          {
            filters,
          }
        );

        const { results, total } = await strapi.services[
          "api::car-trim.car-trim"
        ].findhomeFilterWithPagination({
          filters,
          page,
          pageSize,
          sort,
        });

        console.log("Results:", results);

        const formattedResults = await Promise.all(
          results.map(async (entity) => {
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

            const trims = await strapi.entityService.findMany(
              "api::car-trim.car-trim",
              {
                filters: {
                  car_models: carModelId,
                  year: { $gte: new Date().getFullYear() },
                  price: { $gt: 0 },
                },
                fields: ["price"],
              }
            );

            const prices = trims
              .map((trim) => trim.price)
              .filter((price) => price != null);
            const minPrice = prices.length ? Math.min(...prices) : null;
            const maxPrice = prices.length ? Math.max(...prices) : null;

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
              minPrice,
              maxPrice,
              seatingCapacity: entity.seatingCapacity,
              engine: entity.engine,
              torque: entity.torque,
            };
          })
        );

        const validFormattedResults = formattedResults.filter(
          (result) => result !== null
        );

        ctx.body = {
          code: 200,
          message: "Success",
          data: {
            list: validFormattedResults,
            pagination: {
              page,
              pageSize,
              pageCount: Math.ceil(total / pageSize),
              total,
            },
            totalFilteredCars: allFilteredCars.length,
          },
        };
      } catch (error) {
        console.error("Error in homeFilter:", error);
        ctx.status = 500;
        ctx.body = {
          code: "500",
          message: "Internal Server Error",
          data: {},
        };
      }
    },
    // Sitemap ControllersF
    async listAllTrims(ctx) {
      try {
        const entities = await strapi.db
          .query("api::car-trim.car-trim")
          .findMany({
            populate: {
              car_models: true,
              car_brands: true,
            },
            limit: 10, // Limit the number of results to 10
          });

        console.log(entities, "entities");

        const trimsList = entities.map((entity) => {
          return {
            trimSlug: entity.slug,
            // Assuming the relationships might return more than one model or brand,
            // and to avoid errors when there are no models or brands linked,
            // it's safer to check for their existence and length before accessing.
            // Uncomment and modify these lines according to your data structure and needs.
            modelSlug:
              entity.car_models?.length > 0
                ? entity.car_models[0].slug
                : undefined,
            trimYear: entity.year,
            brandSlug:
              entity.car_brands?.length > 0
                ? entity.car_brands[0].slug
                : undefined,
          };
        });

        ctx.body = trimsList;
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    async generateSitemap(ctx) {
      try {
        // Helper function to escape XML characters
        const escapeXml = (unsafe) => {
          return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
        };

        // Fetch entities with necessary relations
        const entities = await strapi.db
          .query("api::car-trim.car-trim")
          .findMany({
            populate: {
              car_models: true,
              car_brands: true,
            },
          });

        // Generate sitemap for trims
        const trimsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${entities
            .map(
              (entity) => `
        <url>
          <loc>${escapeXml(
                `https://carprices.ae/brands/${entity.car_brands?.[0]?.slug}/${entity.year}/${entity.car_models?.[0]?.slug}/${entity.slug}`
              )}</loc>
          <lastmod>${new Date(
                entity.updatedAt || entity.createdAt
              ).toISOString()}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.8</priority>
        </url>`
            )
            .join("")}
    </urlset>`;
        require("fs").writeFileSync("public/trims-sitemap.xml", trimsSitemap);

        // Generate sitemap for models
        const modelsSet = new Set(
          entities.map(
            (entity) =>
              `https://carprices.ae/brands/${entity.car_brands?.[0]?.slug}/${entity.year}/${entity.car_models?.[0]?.slug}`
          )
        );
        const modelsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${[...modelsSet]
            .map(
              (loc) => `
        <url>
          <loc>${escapeXml(loc)}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.8</priority>
        </url>`
            )
            .join("")}
    </urlset>`;
        require("fs").writeFileSync("public/models-sitemap.xml", modelsSitemap);

        // Generate sitemap for brands
        const brandsSet = new Set(
          entities.map(
            (entity) =>
              `https://carprices.ae/brands/${entity.car_brands?.[0]?.slug}`
          )
        );
        const brandsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${[...brandsSet]
            .map(
              (loc) => `
        <url>
          <loc>${escapeXml(loc)}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.8</priority>
        </url>`
            )
            .join("")}
    </urlset>`;
        require("fs").writeFileSync("public/brands-sitemap.xml", brandsSitemap);

        ctx.body = "Sitemaps generated successfully.";
      } catch (error) {
        console.error("Error generating sitemaps:", error);
        ctx.body = "Error generating sitemaps.";
        ctx.status = 500;
      }
    },
    async compareCarTrims(ctx) {
      try {
        const { slug } = ctx.params;
        const slugs = slug.split("-vs-"); // Split slugs by '-vs-'

        console.log(slugs, "Parsed Slugs");

        // if (slugs.length < 2) {
        //   return ctx.badRequest(
        //     "At least two car trims must be provided for comparison."
        //   );
        // }

        // Fetch car trims by mainSlug instead of slug
        const carTrims = await strapi.db
          .query("api::car-trim.car-trim")
          .findMany({
            where: {
              mainSlug: { $in: slugs },
            },
            populate: {
              car_brands: true,
              car_models: true,
              car_body_types: true,
              featuredImage: true,
              gallery_images: true,
              seo: true,
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
            },
          });

        console.log(carTrims, "Fetched Car Trims");

        if (!carTrims || carTrims.length === 0) {
          return ctx.notFound("No car trims found for the given slugs.");
        }

        const comparisonData = carTrims.map((trim) => ({
          name: trim.name,
          slug: trim.slug,
          mainSlug: trim.mainSlug,
          description: trim.description,
          year: trim.year,
          price: trim.price,
          engine: trim.engine,
          displacement: trim.displacement,
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
          car_body_types: trim.car_body_types?.[0]?.name || null,
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
          featuredImage: trim.featuredImage ? trim.featuredImage.url : null,
          galleryImages: trim.gallery_images?.map((img) => img.url) || [],
          fuelTankSize: trim.fuelTankSize,
          cargoSpace: trim.cargoSpace,
          highTrim: trim.highTrim,
          key_features: trim.key_features || [],
          brand: trim.car_brands?.[0]?.name || null,
          model: trim.car_models?.[0]?.name || null,
        }));

        ctx.body = {
          status: "success",
          message: "Car trims compared successfully",
          data: comparisonData,
        };
      } catch (error) {
        console.error("Error comparing car trims:", error);
        ctx.throw(500, "Internal server error");
      }
    },
    async getAvailableYears(ctx) {
      try {
        const carTrims = await strapi.db.query('api::car-trim.car-trim').findMany({
          select: ['year'],
          groupBy: ['year'],
          where: {
            highTrim: true, // Only consider highTrim trims
            publishedAt: { $ne: null }, // Only fetch published items
            year: { $gte: 2024 }, // Only consider years greater than or equal to 2024
          },
        });

        const uniqueYears = carTrims.map((trim) => trim.year);
        ctx.body = uniqueYears.sort((a, b) => b - a); // Sorted descending by year
      } catch (error) {
        ctx.throw(500, 'Unable to fetch years');
      }
    },
    async getBrandsByYear(ctx) {
      console.log("getBrandsByYear function called with params:", ctx.params);
      const { year } = ctx.params;
      const slug = ctx.query.slug || null;

      // Set up pagination parameters
      const page = parseInt(ctx.query.page, 10) || 1;
      const pageSize = parseInt(ctx.query.pageSize, 10) || 50;

      try {
        // Apply case-insensitive filter if slug is provided
        const trims = await strapi.db.query('api::car-trim.car-trim').findMany({
          where: {
            year: parseFloat(year),
            highTrim: true,
            published_at: { $ne: null },
            ...(slug && {
              car_brands: {
                name: { $containsi: slug }, // Case-insensitive search
              },
            }),
          },
          populate: {
            car_brands: {
              fields: ['id', 'name', 'slug'],
              populate: {
                brandLogo: {
                  fields: ['url'],
                },
              },
            },
          },
        });

        // Create a Map to store unique brands by ID
        const uniqueBrandsMap = new Map();
        trims.forEach(trim => {
          if (trim.car_brands && trim.car_brands.length > 0) {
            const brand = trim.car_brands[0];
            if (!uniqueBrandsMap.has(brand.id)) {
              uniqueBrandsMap.set(brand.id, {
                name: brand.name,
                slug: brand.slug,
                brandLogo: brand?.brandLogo?.url || null,
              });
            }
          }
        });

        // Convert the Map to an array
        const uniqueBrands = Array.from(uniqueBrandsMap.values());
        const totalUniqueBrands = uniqueBrands.length;

        // Calculate total pages
        const totalPages = Math.ceil(totalUniqueBrands / pageSize);

        // Paginate the results manually
        const paginatedBrands = uniqueBrands.slice((page - 1) * pageSize, page * pageSize);

        ctx.body = {
          year,
          brands: paginatedBrands,
          pagination: {
            page,
            pageSize,
            totalBrands: totalUniqueBrands,
            totalPages,
          },
        };
      } catch (error) {
        console.error("Error in getBrandsByYear:", error);
        ctx.throw(500, 'Unable to fetch brands');
      }
    }
    ,
    async getModelsByYearAndBrand(ctx) {
      const { year, brandSlug } = ctx.params;
      const modelSlug = ctx.query.modelSlug; // Get modelSlug from query parameter
      const search = ctx.query.search || ""; // Get search term for model name from query parameter

      // Get pagination parameters from the query (default: page 1, pageSize 50)
      const page = parseInt(ctx.query.page, 10) || 1;
      const pageSize = parseInt(ctx.query.pageSize, 10) || 50;

      try {
        // Fetch the brand by slug
        const brand = await strapi.db.query('api::car-brand.car-brand').findOne({
          where: { slug: brandSlug, publishedAt: { $ne: null } },
        });

        console.log('Fetched Brand:', brand);

        if (!brand) {
          ctx.body = [];
          return;
        }

        // Base query for fetching trims based on year and brand ID
        const trimQuery = {
          where: {
            year,
            car_brands: brand.id,
            highTrim: true,
            publishedAt: { $ne: null },
            ...(search && {
              car_models: {
                name: { $containsi: search }, // Case-insensitive search on model name
              },
            }),
          },
          populate: {
            car_models: true,
            featuredImage: true, // Populate the featured image field for the trim
          },
          limit: pageSize,
          offset: (page - 1) * pageSize,
        };

        // If modelSlug is provided, add it to the query conditions
        if (modelSlug) {
          trimQuery.where.car_models = { slug: modelSlug };
        }

        // Fetch trims with the query, either all or filtered by modelSlug and search term
        const trims = await strapi.db.query('api::car-trim.car-trim').findMany(trimQuery);

        console.log('Fetched Trims:', trims);

        if (modelSlug) {
          // If modelSlug is provided, return only the specific model's data
          const specificModel = trims.flatMap(trim =>
            trim.car_models.filter(model => model.slug === modelSlug)
          )[0];

          if (specificModel) {
            ctx.body = {
              year,
              brand: {
                name: brand.name,
                slug: brand.slug,
              },
              model: {
                id: specificModel.id,
                name: specificModel.name,
                slug: specificModel.slug,
                featuredImage: trims[0].featuredImage?.formats?.thumbnail?.url,
              },
            };
          } else {
            ctx.body = { message: 'Model not found' };
          }
          return;
        }

        // Extract unique models from trims when modelSlug is not specified
        const uniqueModels = [
          ...new Map(
            trims
              .flatMap(trim => trim.car_models.map(model => ({
                id: model.id,
                name: model.name,
                slug: model.slug,
                featuredImage: trim.featuredImage?.formats?.thumbnail?.url,
              })))
              .filter(model => model && model.id)
              .map(model => [model.id, model])
          ).values(),
        ];

        console.log('Unique Models:', uniqueModels);

        // Get the total count of trims for the specified year, brand, and search term
        const totalTrims = await strapi.db.query('api::car-trim.car-trim').count({
          where: {
            year,
            car_brands: brand.id,
            highTrim: true,
            publishedAt: { $ne: null },
            ...(search && {
              car_models: {
                name: { $containsi: search }, // Case-insensitive search on model name
              },
            }),
          },
        });

        // Return models with pagination info, including brand name and slug
        ctx.body = {
          year,
          brand: {
            name: brand.name,
            slug: brand.slug,
          },
          models: uniqueModels,
          pagination: {
            page,
            pageSize,
            totalItems: totalTrims,
            totalPages: Math.ceil(totalTrims / pageSize),
          },
        };
      } catch (error) {
        console.error("Error fetching models by year and brand:", error);
        ctx.throw(500, 'Unable to fetch models');
      }
    },
    async getTrimsByYearBrandAndModel(ctx) {
      const { year, brandSlug, modelSlug } = ctx.params;

      // Get pagination parameters from the query (default: page 1, pageSize 50)
      const page = parseInt(ctx.query.page, 10) || 1;
      const pageSize = parseInt(ctx.query.pageSize, 10) || 50;

      try {
        // Fetch the brand by slug
        const brand = await strapi.db.query('api::car-brand.car-brand').findOne({
          where: { slug: brandSlug, publishedAt: { $ne: null } },
        });

        if (!brand) {
          ctx.body = []; // Return empty if brand not found
          return;
        }

        // Fetch the model by slug
        const model = await strapi.db.query('api::car-model.car-model').findOne({
          where: { slug: modelSlug, publishedAt: { $ne: null } },
        });

        if (!model) {
          ctx.body = []; // Return empty if model not found
          return;
        }

        // Fetch trims for the given year, brand, and model with pagination
        const trims = await strapi.db.query('api::car-trim.car-trim').findMany({
          where: {
            year,
            car_brands: brand.id,
            car_models: model.id,
            publishedAt: { $ne: null },
          },
          limit: pageSize,  // Limit the number of records per page
          offset: (page - 1) * pageSize,  // Calculate the offset for pagination
          select: ['name', 'slug', 'mainSlug', 'price'],  // Only fetch specific fields
          populate: {
            featuredImage: true,  // Populate the featuredImage relation
          },
        });

        // Get total number of trims for pagination
        const totalTrims = await strapi.db.query('api::car-trim.car-trim').count({
          where: {
            year,
            car_brands: brand.id,
            car_models: model.id,
            publishedAt: { $ne: null },
          },
        });

        // Return the custom trims along with pagination info
        ctx.body = {
          trims: trims.map(trim => ({
            name: trim.name,
            slug: trim.slug,
            mainSlug: trim.mainSlug || null, // Fallback to null if mainSlug is not available
            price: trim.price,
            featuredImage: trim.featuredImage ? trim.featuredImage?.formats?.thumbnail?.url : null,  // Populate the image URL
          })),
          pagination: {
            page,
            pageSize,
            totalItems: totalTrims,  // Total number of trims
            totalPages: Math.ceil(totalTrims / pageSize),  // Total pages
          },
        };
      } catch (error) {
        console.error("Error fetching trims by year, brand, and model:", error);
        ctx.throw(500, 'Unable to fetch trims');
      }
    },

    // Custom controller function in Strapi for calculating ownership cost
    async calculateOwnershipCost(ctx) {
      try {
        const {
          carId,
          year,
          annualMileage,
          ownershipDuration,
          currentFuelPrice,
          location,
          financingDetails,
          servicePlanIncluded,
          warrantyStatus,
        } = ctx.request.body;

        // Fetch the car details using the carId
        const carTrim = await strapi.db.query("api::car-trim.car-trim").findOne({
          where: { id: carId },
          populate: {
            car_brands: true,
            car_models: true,
          },
        });

        if (!carTrim) {
          return ctx.badRequest("Car not found.");
        }

        // Use the provided year or default to the car's most recent year
        const selectedYear = year || carTrim.year;

        // Get details from the carTrim object
        const { price, fuelType, engine, displacement, fuelConsumption } = carTrim;

        // Calculate annual fuel cost based on annual mileage and fuel consumption
        const fuelConsumptionPerKm = fuelConsumption / 100; // convert from L/100km to L/km
        const annualFuelCost = annualMileage * fuelConsumptionPerKm * (currentFuelPrice || 3.5);

        // Calculate financing cost if financing details are provided
        let totalFinancingCost = 0;
        if (financingDetails) {
          const { downPayment, interestRate, loanDuration } = financingDetails;
          const principal = price - downPayment;
          const monthlyInterestRate = interestRate / 100 / 12;
          const numberOfPayments = loanDuration * 12;

          // Monthly payment calculation using annuity formula
          const monthlyPayment =
            (principal * monthlyInterestRate) /
            (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
          totalFinancingCost = monthlyPayment * numberOfPayments;
        }

        // Additional costs estimation
        const insuranceCost = location === "Dubai" ? 0.02 * price : 0.025 * price; // Simplified insurance calculation
        const serviceCost = servicePlanIncluded ? 0 : 0.015 * price * ownershipDuration; // Service cost if not included in a plan

        // Service cost explanation based on whether a service plan is included
        const serviceCostExplanation = servicePlanIncluded
          ? "No service cost since a service plan is included."
          : `Estimated based on an average service cost of 1.5% of the car's price per year, considering a ${ownershipDuration}-year ownership period.`;


        const depreciationRate = 0.15; // Assuming a 15% annual depreciation rate
        const totalDepreciation = price * Math.pow(1 - depreciationRate, ownershipDuration);

        // Total ownership cost calculation
        const totalOwnershipCost =
          annualFuelCost * ownershipDuration +
          insuranceCost * ownershipDuration +
          serviceCost +
          (price - totalDepreciation) +
          totalFinancingCost;

        // Return the response
        ctx.body = {
          status: "success",
          message: "Ownership cost calculated successfully",
          data: {
            car: {
              name: carTrim.name,
              brand: carTrim.car_brands[0].name,
              model: carTrim.car_models[0].name,
              year: selectedYear,
              price: carTrim.price,
              fuelType,
              engine,
              displacement,
            },
            ownershipCostBreakdown: {
              annualFuelCost,
              "annualFuelCostExplanation": "Calculated based on an annual mileage of 15,000 km, a fuel consumption rate of 8 L/100 km, and a fuel price of 3.5 AED/L.",
              totalFinancingCost,
              "financingCostExplanation": "Calculated using an annuity formula with a loan duration of 5 years, a down payment of 25,000 AED, and an interest rate of 4%.",
              insuranceCost: insuranceCost * ownershipDuration,
              "insuranceCostExplanation": "Estimated based on the location (Dubai) and 2% of the car's price per year.",
              serviceCost,
              serviceCostExplanation,
              depreciationCost: price - totalDepreciation,
              "depreciationExplanation": "Calculated using a 15% annual depreciation rate over 5 years.",
            },
            totalOwnershipCost,
          },
        };
      } catch (error) {
        console.error("Error calculating ownership cost:", error);
        ctx.throw(500, "Internal server error");
      }
    },
    async getHighTrimsByYearAndBrand(ctx) {
      console.log("getHighTrimsByYearAndBrand function called with:", ctx.params);
      const { year, brand } = ctx.params;

      try {
        // Adjust brand case for a case-insensitive match
        const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();

        // Query trims with year, highTrim, and brand conditions
        const highTrims = await strapi.db.query('api::car-trim.car-trim').findMany({
          where: {
            year: parseFloat(year), // Match year as a float to avoid string-number mismatch
            highTrim: true,
            publishedAt: { $ne: null }, // Only fetch published trims
            car_brands: { name: formattedBrand }, // Use formatted brand name for case match
          },
          populate: {
            car_brands: {
              fields: ['name', 'slug'],
            },
          },
        });

        // Extract only name and slug from each high trim
        const filteredHighTrims = highTrims.map(trim => ({
          name: trim.name,
          slug: trim.slug,
        }));

        console.log("Filtered query results (name and slug only):", filteredHighTrims);

        // Return results or empty array
        ctx.body = {
          year,
          brand: formattedBrand,
          highTrims: filteredHighTrims,
        };
      } catch (error) {
        console.error("Error in getHighTrimsByYearAndBrand:", error);
        ctx.throw(500, 'Unable to fetch high trims');
      }
    }




  })
);
