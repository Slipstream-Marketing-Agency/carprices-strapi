"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

// ========== STANDALONE HELPERS (no `this` binding needed) ==========

function buildSeatingConditions(params) {
  const conditions = [];
  if (params.isOneSeat) conditions.push("1 Seater");
  if (params.isTwoSeat) conditions.push("2 Seater");
  if (params.isTwoPlusTwo) conditions.push("4 Seater");
  if (params.isThreeSeat) conditions.push("3 Seater");
  if (params.isFourSeat) conditions.push("4 Seater");
  if (params.isFiveSeat) conditions.push("5 Seater");
  if (params.isSixSeat) conditions.push("6 Seater");
  if (params.isSevenSeat) conditions.push("7 Seater");
  if (params.isEightSeat) conditions.push("8 Seater");
  if (params.isNineSeat) conditions.push("9 Seater");
  if (params.isNinePlusSeat) {
    conditions.push("11 Seater", "12 Seater", "13 Seater", "14 Seater", "15 Seater", "16 Seater");
  }
  return [...new Set(conditions)];
}

function buildFilteredIdQuery(strapi, params) {
  const knex = strapi.db.connection;
  let query = knex('car_trims')
    .select('car_trims.id')
    .where('car_trims.year', '>=', new Date().getFullYear() - 1)
    .where('car_trims.price', '>', 0)
    .where('car_trims.high_trim', true)
    .whereNotNull('car_trims.published_at');

  // Brand filter via subquery
  if (params.brands && Array.isArray(params.brands) && params.brands.length > 0) {
    query = query.whereIn('car_trims.id', function () {
      this.select('car_trim_id')
        .from('car_trims_car_brands_links')
        .join('car_brands', 'car_trims_car_brands_links.car_brand_id', 'car_brands.id')
        .whereIn('car_brands.slug', params.brands);
    });
  }

  // Body type filter via subquery
  if (params.bodyTypes && Array.isArray(params.bodyTypes) && params.bodyTypes.length > 0) {
    query = query.whereIn('car_trims.id', function () {
      this.select('car_trim_id')
        .from('car_trims_car_body_types_links')
        .join('car_body_types', 'car_trims_car_body_types_links.car_body_type_id', 'car_body_types.id')
        .whereIn('car_body_types.slug', params.bodyTypes);
    });
  }

  // Simple column filters
  if (params.cylinders && Array.isArray(params.cylinders) && params.cylinders.length > 0) {
    query = query.whereIn('car_trims.cylinders', params.cylinders);
  }
  if (params.fuelType && Array.isArray(params.fuelType) && params.fuelType.length > 0) {
    query = query.whereIn('car_trims.fuel_type', params.fuelType);
  }
  if (params.transmission && Array.isArray(params.transmission) && params.transmission.length > 0) {
    query = query.whereIn('car_trims.transmission', params.transmission);
  }
  if (params.drive && Array.isArray(params.drive) && params.drive.length > 0) {
    query = query.whereIn('car_trims.drive', params.drive);
  }

  // Price ranges (OR groups wrapped in AND)
  if (params.priceRanges && Array.isArray(params.priceRanges) && params.priceRanges.length > 0) {
    query = query.where(function () {
      params.priceRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          this.orWhereBetween('car_trims.price', [range.min, range.max]);
        }
      });
    });
  }

  // Displacement ranges
  if (params.displacementRanges && Array.isArray(params.displacementRanges) && params.displacementRanges.length > 0) {
    query = query.where(function () {
      params.displacementRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          this.orWhereBetween('car_trims.displacement', [range.min, range.max]);
        }
      });
    });
  }

  // Power ranges
  if (params.powerRanges && Array.isArray(params.powerRanges) && params.powerRanges.length > 0) {
    query = query.where(function () {
      params.powerRanges.forEach((range) => {
        if (range.min !== undefined && range.max !== undefined) {
          this.orWhereBetween('car_trims.power', [range.min, range.max]);
        }
      });
    });
  }

  // Boolean filters
  if (params.haveMusic) query = query.where('car_trims.have_music', true);
  if (params.isLuxury) query = query.where('car_trims.is_luxury', true);
  if (params.isPremiumLuxury) query = query.where('car_trims.is_premium_luxury', true);
  if (params.haveTechnology) query = query.where('car_trims.have_technology', true);
  if (params.havePerformance) query = query.where('car_trims.have_performance', true);
  if (params.isSpacious) query = query.where('car_trims.is_spacious', true);
  if (params.isElectric) query = query.where('car_trims.is_electric', true);
  if (params.isFuelEfficient) query = query.where('car_trims.is_fuel_efficient', true);
  if (params.isOffRoad) query = query.where('car_trims.is_off_road', true);
  if (params.isManualTransmission) query = query.where('car_trims.is_manual_transmission', true);
  if (params.isAffordableLuxury) query = query.where('car_trims.is_affordable_luxury', true);
  if (params.isDuneBashing) query = query.where('car_trims.is_dune_bashing', true);
  if (params.isSafety) query = query.where('car_trims.is_safety', true);

  // Seating capacity
  const seatingConditions = buildSeatingConditions(params);
  if (seatingConditions.length > 0) {
    query = query.whereIn('car_trims.seating_capacity', seatingConditions);
  }

  return query;
}

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
      year: { $gte: new Date().getFullYear() - 1 },
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

  // ========== OPTIMIZED FILTER FUNCTIONS (using SQL aggregation) ==========

  async getFuelLists(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const results = await knex('car_trims')
      .distinct('fuel_type')
      .whereIn('id', filteredIds)
      .whereNotNull('fuel_type')
      .whereNot('fuel_type', '');
    return { fuelTypes: results.map(r => r.fuel_type) };
  },

  async getBrandList(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    // Get distinct brand IDs from filtered car trims
    const brandIds = await knex('car_trims_car_brands_links')
      .distinct('car_brand_id')
      .whereIn('car_trim_id', filteredIds);

    if (brandIds.length === 0) return { brands: [] };

    const filteredBrands = await strapi.entityService.findMany(
      'api::car-brand.car-brand',
      {
        filters: { id: { $in: brandIds.map(b => b.car_brand_id) } },
        sort: { name: 'asc' },
        fields: ['id', 'name', 'slug'],
      }
    );
    return { brands: filteredBrands };
  },

  async getBodyLists(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    // Get distinct body type IDs from filtered car trims
    const bodyTypeIds = await knex('car_trims_car_body_types_links')
      .distinct('car_body_type_id')
      .whereIn('car_trim_id', filteredIds);

    if (bodyTypeIds.length === 0) return { bodyTypes: [] };

    const filteredBodyTypes = await strapi.entityService.findMany(
      'api::car-body-type.car-body-type',
      {
        filters: { id: { $in: bodyTypeIds.map(b => b.car_body_type_id) } },
        sort: { name: 'asc' },
        fields: ['id', 'name', 'slug'],
        populate: { image: true },
      }
    );
    return { bodyTypes: filteredBodyTypes };
  },

  async getCylinderList(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const results = await knex('car_trims')
      .distinct('cylinders')
      .whereIn('id', filteredIds)
      .whereNotNull('cylinders')
      .where('cylinders', '>', 0)
      .orderBy('cylinders', 'asc');
    return { cylinders: results.map(r => r.cylinders) };
  },

  async getDriveLists(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const results = await knex('car_trims')
      .distinct('drive')
      .whereIn('id', filteredIds)
      .whereNotNull('drive')
      .whereNot('drive', '');
    return { drive: results.map(r => r.drive) };
  },

  async getTransmissionList(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const results = await knex('car_trims')
      .distinct('transmission')
      .whereIn('id', filteredIds)
      .whereNotNull('transmission')
      .whereNot('transmission', '');
    return { transmission: results.map(r => r.transmission) };
  },

  async getPriceRange(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const result = await knex('car_trims')
      .min('price as min')
      .max('price as max')
      .whereIn('id', filteredIds)
      .where('price', '>', 0)
      .first();
    return { price: { min: result?.min || null, max: result?.max || null } };
  },

  async getPowerRange(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const result = await knex('car_trims')
      .min('power as min')
      .max('power as max')
      .whereIn('id', filteredIds)
      .where('power', '>', 0)
      .first();
    return { power: { min: result?.min || null, max: result?.max || null } };
  },

  async getDisplacementRange(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const result = await knex('car_trims')
      .min('displacement as min')
      .max('displacement as max')
      .whereIn('id', filteredIds)
      .where('displacement', '>', 0)
      .first();
    return { displacement: { min: result?.min || null, max: result?.max || null } };
  },

  async getSeatList(params) {
    const filteredIds = buildFilteredIdQuery(strapi, params);
    const knex = strapi.db.connection;
    const results = await knex('car_trims')
      .distinct('seating_capacity')
      .whereIn('id', filteredIds)
      .whereNotNull('seating_capacity')
      .whereNot('seating_capacity', '');
    return { seats: results.map(r => r.seating_capacity) };
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


