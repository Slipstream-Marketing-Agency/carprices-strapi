"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::car-trim.car-trim", ({ strapi }) => ({
  // async customSearch(searchTerm) {
  //   // Implement your custom search logic here
  //   // For example, using a custom SQL query or complex filtering
  //   const result = await strapi.entityService.findMany('api::car-trim.car-trim', {
  //     filters: { name: { $contains: searchTerm } },
  //     // Add other search conditions or custom logic here
  //   });
  //   return result;
  // },

  async getFuelTypes() {
    try {
      // Use the correct column name 'fuel_type'
      const result = await strapi.db.connection
        .table("car_trims")
        .select("fuel_type")
        .distinctOn("fuel_type");

      // Extract just the fuel types from the query results
      return result.map((item) => item.fuel_type);
    } catch (error) {
      // Handle or log the error appropriately
      console.error("Error fetching distinct fuel types:", error);
      throw error;
    }
  },

  async getFuelTypesByBrand(brandId) {
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters: { car_brands: { id: brandId } },
        fields: ["fuelType"],
      }
    );

    // Extract unique fuel types
    const fuelTypes = [...new Set(carTrims.map((trim) => trim.fuelType))];
    return fuelTypes;
  },

  async getFilteredFuelTypes(filters) {
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      filters.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
      delete filters.minPrice;
      delete filters.maxPrice;
    }

    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters: filters,
        fields: ["fuelType"],
      }
    );

    const fuelTypes = [...new Set(carTrims.map((trim) => trim.fuelType))];
    return fuelTypes;
  },

  async getFilterLists(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];
  
    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() },
      price: { $gt: 0 },
      highTrim: true,
      publishedAt: { $ne: null },
    };
  
    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }
  
    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }
  
    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }
  
    // Apply transmission type filter
    if (transmission && Array.isArray(transmission) && transmission.length > 0) {
      filters.transmission = { $in: transmission };
    }
  
    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }
  
    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
  
    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }
  
    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
  
    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }
  
    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }
  
    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }
  
    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }
  
    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }
  
    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    ); // Process the fetched car trims
  
    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();
  
    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });
  
    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_body_types && Array.isArray(trim.car_body_types)) {
        trim.car_body_types.forEach((bodyType) => {
          if (bodyType && bodyType.slug) {
            uniqueBodyTypeSlugs.add(bodyType.slug);
          }
        });
      }
    });
  
    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"],
      }
    );
  
    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"],
        populate: { image: true },
      }
    );
  
    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (typeof trim.fuelType === "string" && trim.fuelType.trim().length > 0) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }
  
      if (typeof trim.transmission === "string" && trim.transmission.trim().length > 0) {
        uniqueTransmission.add(trim.transmission);
      }
    });
  
    // Prepare and return the response
    const response = {
      price: {
        min: allPrices.length === 0 ? null : Math.min(...allPrices),
        max: allPrices.length === 0 ? null : Math.max(...allPrices),
      },
      displacement: {
        min: allDisplacements.length === 0 ? null : Math.min(...allDisplacements),
        max: allDisplacements.length === 0 ? null : Math.max(...allDisplacements),
      },
      power: {
        min: allPowers.length === 0 ? null : Math.min(...allPowers),
        max: allPowers.length === 0 ? null : Math.max(...allPowers),
      },
      cylinders: Array.from(uniqueCylinders).sort((a, b) => a - b),
      fuelTypes: Array.from(uniqueFuelTypes),
      drive: Array.from(uniqueDrive),
      transmission: Array.from(uniqueTransmission),
      brands: filteredBrands,
      bodyTypes: filteredBodyTypes,
    };
  
    return response;
  },  

  async getFuelLists(
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
  ) {
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];

    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };

    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }

    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }

    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }

    // Apply transmission type filter
    if (
      transmission &&
      Array.isArray(transmission) &&
      transmission.length > 0
    ) {
      filters.transmission = { $in: transmission };
    }

    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }

    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }

    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }

    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }

    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }

    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }

    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }

    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    ); // Process the fetched car trims

    let uniqueFuelTypes = new Set();

    carTrims.forEach((trim) => {
      if (
        typeof trim.fuelType === "string" &&
        trim.fuelType.trim().length > 0
      ) {
        uniqueFuelTypes.add(trim.fuelType);
      }
    });

    // Prepare and return the response
    const response = {
      fuelTypes: Array.from(uniqueFuelTypes),
    };

    return response;
  },

  async getBrandList(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];

    console.log(priceRanges,"priceRangespriceRangesss")

    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };

    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }

    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }

    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }

    // Apply transmission type filter
    if (transmission && Array.isArray(transmission) && transmission.length > 0) {
      filters.transmission = { $in: transmission };
    }

    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }

    // Apply price ranges filter
    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }

    // Apply displacement ranges filter
    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the displacement range filter if it's not empty
    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }

    // Apply power ranges filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the power range filter if it's not empty
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }

    // Apply other filters
    if (haveMusic === "1") filters.haveMusic = true;
    if (isLuxury === "1") filters.isLuxury = true;
    if (isPremiumLuxury === "1") filters.isPremiumLuxury = true;
    if (haveTechnology === "1") filters.haveTechnology = true;
    if (havePerformance === "1") filters.havePerformance = true;
    if (isSpacious === "1") filters.isSpacious = true;
    if (isElectric === "1") filters.isElectric = true;
    if (isFuelEfficient === "1") filters.isFuelEfficient = true;
    if (isOffRoad === "1") filters.isOffRoad = true;
    if (isManualTransmission === "1") filters.isManualTransmission = true;
    if (isAffordableLuxury === "1") filters.isAffordableLuxury = true;
    if (isDuneBashing === "1") filters.isDuneBashing = true;
    if (isSafety === "1") filters.isSafety = true;

    // Apply seating capacity filters
    let seatingConditions = [];
    if (isOneSeat === "1") seatingConditions.push("1 Seater");
    if (isTwoSeat === "1") seatingConditions.push("2 Seater");
    if (isTwoPlusTwo === "1") seatingConditions.push("4 Seater");
    if (isThreeSeat === "1") seatingConditions.push("3 Seater");
    if (isFourSeat === "1") seatingConditions.push("4 Seater");
    if (isFiveSeat === "1") seatingConditions.push("5 Seater");
    if (isSixSeat === "1") seatingConditions.push("6 Seater");
    if (isSevenSeat === "1") seatingConditions.push("7 Seater");
    if (isEightSeat === "1") seatingConditions.push("8 Seater");
    if (isNineSeat === "1") seatingConditions.push("9 Seater");
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }

    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }

    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany("api::car-trim.car-trim", {
      filters,
      fields: [
        "price",
        "displacement",
        "power",
        "cylinders",
        "fuelType",
        "drive",
        "transmission",
      ],
      populate: {
        car_brands: true,
        car_body_types: true,
      },
    });

    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });

    const filteredBrands = await strapi.entityService.findMany("api::car-brand.car-brand", {
      filters: {
        slug: { $in: Array.from(uniqueBrandSlugs) },
      },
      sort: { name: "asc" },
      fields: ["id", "name", "slug"],
    });

    // Prepare and return the response
    const response = {
      brands: filteredBrands,
    };

    return response;
  },

  async getBodyLists(
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
  ) {
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];
  
    let filters = {
      year: { $gte: new Date().getFullYear() },
      price: { $gt: 0 },
      highTrim: true,
      publishedAt: { $ne: null },
    };
  
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }
    if (
      transmission &&
      Array.isArray(transmission) &&
      transmission.length > 0
    ) {
      filters.transmission = { $in: transmission };
    }
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }
    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }
    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }
  
    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }
  
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }
  
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    );
  
    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();
  
    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });
  
    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_body_types && Array.isArray(trim.car_body_types)) {
        trim.car_body_types.forEach((bodyType) => {
          if (bodyType && bodyType.slug) {
            uniqueBodyTypeSlugs.add(bodyType.slug);
          }
        });
      }
    });
  
    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"],
      }
    );
  
    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"],
        populate: { image: true },
      }
    );
  
    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (typeof trim.fuelType === "string" && trim.fuelType.trim().length > 0) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }
      if (typeof trim.transmission === "string" && trim.transmission.trim().length > 0) {
        uniqueTransmission.add(trim.transmission);
      }
    });
  
    const response = {
      price: {
        min: allPrices.length === 0 ? null : Math.min(...allPrices),
        max: allPrices.length === 0 ? null : Math.max(...allPrices),
      },
      displacement: {
        min: allDisplacements.length === 0 ? null : Math.min(...allDisplacements),
        max: allDisplacements.length === 0 ? null : Math.max(...allDisplacements),
      },
      power: {
        min: allPowers.length === 0 ? null : Math.min(...allPowers),
        max: allPowers.length === 0 ? null : Math.max(...allPowers),
      },
      cylinders: Array.from(uniqueCylinders).sort((a, b) => a - b),
      fuelTypes: Array.from(uniqueFuelTypes),
      drive: Array.from(uniqueDrive),
      transmission: Array.from(uniqueTransmission),
      brands: filteredBrands,
      bodyTypes: filteredBodyTypes,
    };
  
    return response;
  },
  

  async getCylinderList(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];

    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };

    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }

    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }

    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }

    // Apply transmission type filter
    if (
      transmission &&
      Array.isArray(transmission) &&
      transmission.length > 0
    ) {
      filters.transmission = { $in: transmission };
    }

    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }

    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }

    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }

    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }

    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }

    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }

    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }

    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    ); // Process the fetched car trims

    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();

    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });

    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      // Assuming car_body_types is an array. Adjust if the data structure is different.
      trim.car_body_types.forEach((bodyType) => {
        if (bodyType && bodyType.slug) {
          uniqueBodyTypeSlugs.add(bodyType.slug);
        }
      });
    });

    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (
        typeof trim.fuelType === "string" &&
        trim.fuelType.trim().length > 0
      ) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }

      if (
        typeof trim.transmission === "string" &&
        trim.transmission.trim().length > 0
      ) {
        uniqueTransmission.add(trim.transmission);
      }
    });

    // Prepare and return the response
    const response = {
      cylinders: Array.from(uniqueCylinders).sort((a, b) => a - b),
    };

    return response;
  },

  async getDriveLists(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];

    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };

    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }

    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }

    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }

    // Apply transmission type filter
    if (
      transmission &&
      Array.isArray(transmission) &&
      transmission.length > 0
    ) {
      filters.transmission = { $in: transmission };
    }

    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }

    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }

    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }

    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }

    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }

    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }

    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }

    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    ); // Process the fetched car trims

    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();

    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });

    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      // Assuming car_body_types is an array. Adjust if the data structure is different.
      trim.car_body_types.forEach((bodyType) => {
        if (bodyType && bodyType.slug) {
          uniqueBodyTypeSlugs.add(bodyType.slug);
        }
      });
    });

    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (
        typeof trim.fuelType === "string" &&
        trim.fuelType.trim().length > 0
      ) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }

      if (
        typeof trim.transmission === "string" &&
        trim.transmission.trim().length > 0
      ) {
        uniqueTransmission.add(trim.transmission);
      }
    });

    // Prepare and return the response
    const response = {
      drive: Array.from(uniqueDrive),
    };

    return response;
  },

  async getTransmissionList(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];

    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };

    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }

    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }

    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }

    // Apply transmission type filter
    if (
      transmission &&
      Array.isArray(transmission) &&
      transmission.length > 0
    ) {
      filters.transmission = { $in: transmission };
    }

    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }

    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }

    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }

    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }

    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }

    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }

    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }

    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    ); // Process the fetched car trims

    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();

    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });

    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      // Assuming car_body_types is an array. Adjust if the data structure is different.
      trim.car_body_types.forEach((bodyType) => {
        if (bodyType && bodyType.slug) {
          uniqueBodyTypeSlugs.add(bodyType.slug);
        }
      });
    });

    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (
        typeof trim.fuelType === "string" &&
        trim.fuelType.trim().length > 0
      ) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }

      if (
        typeof trim.transmission === "string" &&
        trim.transmission.trim().length > 0
      ) {
        uniqueTransmission.add(trim.transmission);
      }
    });

    // Prepare and return the response
    const response = {
      transmission: Array.from(uniqueTransmission),
    };

    return response;
  },

  async getPriceRange(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];
  
    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };
  
    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }
  
    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }
  
    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }
  
    // Apply transmission type filter
    if (transmission && Array.isArray(transmission) && transmission.length > 0) {
      filters.transmission = { $in: transmission };
    }
  
    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }
  
    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
  
    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }
  
    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
  
    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }
  
    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }
  
    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }
  
    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }
  
    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }
  
    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    );
  
    // Process the fetched car trims
    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();
  
    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });
  
    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_body_types && Array.isArray(trim.car_body_types)) {
        trim.car_body_types.forEach((bodyType) => {
          if (bodyType && bodyType.slug) {
            uniqueBodyTypeSlugs.add(bodyType.slug);
          }
        });
      }
    });
  
    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"],
      }
    );
  
    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"],
        populate: { image: true },
      }
    );
  
    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (typeof trim.fuelType === "string" && trim.fuelType.trim().length > 0) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }
      if (typeof trim.transmission === "string" && trim.transmission.trim().length > 0) {
        uniqueTransmission.add(trim.transmission);
      }
    });
  
    // Prepare and return the response
    const response = {
      price: {
        min: allPrices.length === 0 ? null : Math.min(...allPrices),
        max: allPrices.length === 0 ? null : Math.max(...allPrices),
      },
      displacement: {
        min: allDisplacements.length === 0 ? null : Math.min(...allDisplacements),
        max: allDisplacements.length === 0 ? null : Math.max(...allDisplacements),
      },
      power: {
        min: allPowers.length === 0 ? null : Math.min(...allPowers),
        max: allPowers.length === 0 ? null : Math.max(...allPowers),
      },
      cylinders: Array.from(uniqueCylinders).sort((a, b) => a - b),
      fuelTypes: Array.from(uniqueFuelTypes),
      drives: Array.from(uniqueDrive),
      transmissions: Array.from(uniqueTransmission),
      brands: filteredBrands,
      bodyTypes: filteredBodyTypes,
    };
  
    return response;
  },  

  async getPowerRange(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];

    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };

    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }

    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }

    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }

    // Apply transmission type filter
    if (
      transmission &&
      Array.isArray(transmission) &&
      transmission.length > 0
    ) {
      filters.transmission = { $in: transmission };
    }

    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }

    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }

    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }

    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }

    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }

    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }

    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }

    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    ); // Process the fetched car trims

    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();

    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });

    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      // Assuming car_body_types is an array. Adjust if the data structure is different.
      trim.car_body_types.forEach((bodyType) => {
        if (bodyType && bodyType.slug) {
          uniqueBodyTypeSlugs.add(bodyType.slug);
        }
      });
    });

    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (
        typeof trim.fuelType === "string" &&
        trim.fuelType.trim().length > 0
      ) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }

      if (
        typeof trim.transmission === "string" &&
        trim.transmission.trim().length > 0
      ) {
        uniqueTransmission.add(trim.transmission);
      }
    });

    // Prepare and return the response
    const response = {
      power: {
        min: allPowers.length === 0 ? null : Math.min(...allPowers),
        max: allPowers.length === 0 ? null : Math.max(...allPowers),
      },
    };

    return response;
  },

  async getDisplacementRange(
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
  ) {
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];

    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() }, // Filter for year 2023 and above
      price: { $gt: 0 }, // Ensure price is greater than 0
      highTrim: true,
      publishedAt: { $ne: null },
    };

    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }

    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }

    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }

    // Apply transmission type filter
    if (
      transmission &&
      Array.isArray(transmission) &&
      transmission.length > 0
    ) {
      filters.transmission = { $in: transmission };
    }

    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }

    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    // Only add the price range filter if it's not empty
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }

    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }

    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }

    // Power range filter
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }

    if (haveMusic === "1") {
      filters.haveMusic = true;
    }
    if (isLuxury === "1") {
      filters.isLuxury = true;
    }
    if (isPremiumLuxury === "1") {
      filters.isPremiumLuxury = true;
    }
    if (haveTechnology === "1") {
      filters.haveTechnology = true;
    }
    if (havePerformance === "1") {
      filters.havePerformance = true;
    }
    if (isSpacious === "1") {
      filters.isSpacious = true;
    }
    if (isElectric === "1") {
      filters.isElectric = true;
    }
    if (isFuelEfficient === "1") {
      filters.isFuelEfficient = true;
    }
    if (isOffRoad === "1") {
      filters.isOffRoad = true;
    }
    if (isManualTransmission === "1") {
      filters.isManualTransmission = true;
    }
    if (isAffordableLuxury === "1") {
      filters.isAffordableLuxury = true;
    }
    if (isDuneBashing === "1") {
      filters.isDuneBashing = true;
    }
    if (isSafety === "1") {
      filters.isSafety = true;
    }

    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") {
      seatingConditions.push("1 Seater");
    }
    if (isTwoSeat === "1") {
      seatingConditions.push("2 Seater");
    }
    if (isTwoPlusTwo === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isThreeSeat === "1") {
      seatingConditions.push("3 Seater");
    }
    if (isFourSeat === "1") {
      seatingConditions.push("4 Seater");
    }
    if (isFiveSeat === "1") {
      seatingConditions.push("5 Seater");
    }
    if (isSixSeat === "1") {
      seatingConditions.push("6 Seater");
    }
    if (isSevenSeat === "1") {
      seatingConditions.push("7 Seater");
    }
    if (isEightSeat === "1") {
      seatingConditions.push("8 Seater");
    }
    if (isNineSeat === "1") {
      seatingConditions.push("9 Seater");
    }
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }

    // If seating conditions are specified, add them to filters
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }

    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    ); // Process the fetched car trims

    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();

    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });

    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      // Assuming car_body_types is an array. Adjust if the data structure is different.
      trim.car_body_types.forEach((bodyType) => {
        if (bodyType && bodyType.slug) {
          uniqueBodyTypeSlugs.add(bodyType.slug);
        }
      });
    });

    const filteredBrands = await strapi.entityService.findMany(
      "api::car-brand.car-brand",
      {
        filters: {
          slug: { $in: Array.from(uniqueBrandSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    const filteredBodyTypes = await strapi.entityService.findMany(
      "api::car-body-type.car-body-type",
      {
        filters: {
          slug: { $in: Array.from(uniqueBodyTypeSlugs) },
        },
        sort: { name: "asc" },
        fields: ["id", "name", "slug"], // include other fields as needed
      }
    );

    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (
        typeof trim.fuelType === "string" &&
        trim.fuelType.trim().length > 0
      ) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }

      if (
        typeof trim.transmission === "string" &&
        trim.transmission.trim().length > 0
      ) {
        uniqueTransmission.add(trim.transmission);
      }
    });

    // Prepare and return the response
    const response = {
      displacement: {
        min:
          allDisplacements.length === 0 ? null : Math.min(...allDisplacements),
        max:
          allDisplacements.length === 0 ? null : Math.max(...allDisplacements),
      },
    };

    return response;
  },

  async getSeatList(
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
  ) {
    console.log(isDuneBashing, "isDuneBashing");
  
    // Initialize variables
    let allPrices = [];
    let allDisplacements = [];
    let allPowers = [];
    let priceRangeFilter = [];
    let displacementRangeFilter = [];
    let powerRangeFilter = [];
  
    // Build the base filter with the year and price criteria
    let filters = {
      year: { $gte: new Date().getFullYear() },
      price: { $gt: 0 },
      highTrim: true,
      publishedAt: { $ne: null },
    };
  
    // Apply brand and body type filters
    if (brands && Array.isArray(brands) && brands.length > 0) {
      filters.car_brands = { slug: { $in: brands } };
    }
    if (bodyTypes && Array.isArray(bodyTypes) && bodyTypes.length > 0) {
      filters.car_body_types = { slug: { $in: bodyTypes } };
    }
  
    // Apply cylinder filter
    if (cylinders && Array.isArray(cylinders) && cylinders.length > 0) {
      filters.cylinders = { $in: cylinders };
    }
  
    // Apply fuel type filter
    if (fuelType && Array.isArray(fuelType) && fuelType.length > 0) {
      filters.fuelType = { $in: fuelType };
    }
  
    // Apply transmission type filter
    if (transmission && Array.isArray(transmission) && transmission.length > 0) {
      filters.transmission = { $in: transmission };
    }
  
    // Apply drive filter
    if (drive && Array.isArray(drive) && drive.length > 0) {
      filters.drive = { $in: drive };
    }
  
    if (priceRanges && Array.isArray(priceRanges)) {
      priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          priceRangeFilter.push({
            price: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
  
    if (priceRangeFilter.length > 0) {
      filters.$or = priceRangeFilter;
    }
  
    if (displacementRanges && Array.isArray(displacementRanges)) {
      displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          displacementRangeFilter.push({
            displacement: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
  
    if (displacementRangeFilter.length > 0) {
      if (!filters.$and) {
        filters.$and = [];
      }
      filters.$and.push({ $or: displacementRangeFilter });
    }
  
    if (powerRanges && Array.isArray(powerRanges)) {
      powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          powerRangeFilter.push({
            power: { $gte: range.min, $lte: range.max },
          });
        }
      });
    }
  
    if (powerRangeFilter.length > 0) {
      filters.$or = powerRangeFilter;
    }
  
    // Apply boolean filters
    if (haveMusic === "1") filters.haveMusic = true;
    if (isLuxury === "1") filters.isLuxury = true;
    if (isPremiumLuxury === "1") filters.isPremiumLuxury = true;
    if (haveTechnology === "1") filters.haveTechnology = true;
    if (havePerformance === "1") filters.havePerformance = true;
    if (isSpacious === "1") filters.isSpacious = true;
    if (isElectric === "1") filters.isElectric = true;
    if (isFuelEfficient === "1") filters.isFuelEfficient = true;
    if (isOffRoad === "1") filters.isOffRoad = true;
    if (isManualTransmission === "1") filters.isManualTransmission = true;
    if (isAffordableLuxury === "1") filters.isAffordableLuxury = true;
    if (isDuneBashing === "1") filters.isDuneBashing = true;
    if (isSafety === "1") filters.isSafety = true;
  
    // Seating capacity conditions
    let seatingConditions = [];
    if (isOneSeat === "1") seatingConditions.push("1 Seater");
    if (isTwoSeat === "1") seatingConditions.push("2 Seater");
    if (isTwoPlusTwo === "1") seatingConditions.push("4 Seater");
    if (isThreeSeat === "1") seatingConditions.push("3 Seater");
    if (isFourSeat === "1") seatingConditions.push("4 Seater");
    if (isFiveSeat === "1") seatingConditions.push("5 Seater");
    if (isSixSeat === "1") seatingConditions.push("6 Seater");
    if (isSevenSeat === "1") seatingConditions.push("7 Seater");
    if (isEightSeat === "1") seatingConditions.push("8 Seater");
    if (isNineSeat === "1") seatingConditions.push("9 Seater");
    if (isNinePlusSeat === "1") {
      seatingConditions.push(
        "11 Seater",
        "12 Seater",
        "13 Seater",
        "14 Seater",
        "15 Seater",
        "16 Seater"
      );
    }
  
    if (seatingConditions.length > 0) {
      filters.seatingCapacity = { $in: seatingConditions };
    }
  
    // Fetch car trims based on all filters
    const carTrims = await strapi.entityService.findMany(
      "api::car-trim.car-trim",
      {
        filters,
        fields: [
          "price",
          "displacement",
          "power",
          "cylinders",
          "fuelType",
          "drive",
          "transmission",
          "seatingCapacity",
        ],
        populate: {
          car_brands: true,
          car_body_types: true,
        },
      }
    );
  
    // Process the fetched car trims
    let uniqueCylinders = new Set();
    let uniqueFuelTypes = new Set();
    let uniqueDrive = new Set();
    let uniqueTransmission = new Set();
  
    const uniqueBrandSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_brands && trim.car_brands.length > 0 && trim.car_brands[0].slug) {
        uniqueBrandSlugs.add(trim.car_brands[0].slug);
      }
    });
  
    const uniqueBodyTypeSlugs = new Set();
    carTrims.forEach((trim) => {
      if (trim.car_body_types && Array.isArray(trim.car_body_types)) {
        trim.car_body_types.forEach((bodyType) => {
          if (bodyType && bodyType.slug) {
            uniqueBodyTypeSlugs.add(bodyType.slug);
          }
        });
      }
    });
  
    const uniqueSeats = new Set(carTrims.map((trim) => trim.seatingCapacity));
  
    carTrims.forEach((trim) => {
      if (trim.price > 0) {
        allPrices.push(trim.price);
      }
      if (trim.displacement > 0) {
        allDisplacements.push(trim.displacement);
      }
      if (trim.power > 0) {
        allPowers.push(trim.power);
      }
      if (trim.cylinders > 0) {
        uniqueCylinders.add(trim.cylinders);
      }
      if (typeof trim.fuelType === "string" && trim.fuelType.trim().length > 0) {
        uniqueFuelTypes.add(trim.fuelType);
      }
      if (typeof trim.drive === "string" && trim.drive.trim().length > 0) {
        uniqueDrive.add(trim.drive);
      }
      if (typeof trim.transmission === "string" && trim.transmission.trim().length > 0) {
        uniqueTransmission.add(trim.transmission);
      }
    });
  
    // Prepare and return the response
    const response = {
      seats: Array.from(uniqueSeats),
    };
  
    return response;
  },  

  async findWithPagination({ filters, page, pageSize, sort }) {
    const start = (page - 1) * pageSize;
    const [results, total] = await Promise.all([
      strapi.entityService.findMany("api::car-trim.car-trim", {
        filters,
        populate: [
          "car_brands.brandLogo",
          "car_brands.coverImage",
          "car_models",
          "featuredImage",
          "car_body_types",
        ],
        start,
        limit: pageSize,
        sort,
      }),
      strapi.entityService.count("api::car-trim.car-trim", { filters }),
    ]);

    return { results, total };
  },

  async findhomeFilterWithPagination({ filters, page, pageSize, sort }) {
    const start = (page - 1) * pageSize;
    const [results, total] = await Promise.all([
      strapi.entityService.findMany("api::car-trim.car-trim", {
        filters,
        populate: [
          "car_brands.brandLogo",
          "car_brands.coverImage",
          "car_models",
          "featuredImage",
          "car_body_types",
        ],
        start,
        limit: pageSize,
        sort,
      }),
      strapi.entityService.count("api::car-trim.car-trim", { filters }),
    ]);

    return { results, total };
  },
}));


