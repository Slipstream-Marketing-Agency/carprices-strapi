"use strict";

const parseQueryParam = (param, parser = JSON.parse) => {
  if (typeof param === "string") {
    try {
      return parser(param);
    } catch {
      return null;
    }
  }
  return param || null;
};

const parseArrayQueryParams = (ctx, params) => {
  const parsedParams = {};
  params.forEach((param) => {
    parsedParams[param] = parseQueryParam(ctx.query[param]);
  });
  return parsedParams;
};

const buildFilters = (queryParams) => {
  const filters = {
    car_brands: queryParams.brand ? { id: queryParams.brand } : undefined,
    minPrice: queryParams.minPrice ? parseFloat(queryParams.minPrice) : undefined,
    maxPrice: queryParams.maxPrice ? parseFloat(queryParams.maxPrice) : undefined,
    power: queryParams.power ? parseFloat(queryParams.power) : undefined,
    displacement: queryParams.displacement ? parseFloat(queryParams.displacement) : undefined,
    transmission: queryParams.transmission,
    cylinders: queryParams.cylinders ? parseInt(queryParams.cylinders, 10) : undefined,
    drive: queryParams.drive,
  };
  return Object.keys(filters).reduce((acc, key) => {
    if (filters[key] !== undefined) acc[key] = filters[key];
    return acc;
  }, {});
};

const buildAdditionalParams = (ctx) => ({
  haveMusic: ctx.query.haveMusic,
  isLuxury: ctx.query.isLuxury,
  isPremiumLuxury: ctx.query.isPremiumLuxury,
  haveTechnology: ctx.query.haveTechnology,
  havePerformance: ctx.query.havePerformance,
  isSpacious: ctx.query.isSpacious,
  isElectric: ctx.query.isElectric,
  isFuelEfficient: ctx.query.isFuelEfficient,
  isOffRoad: ctx.query.isOffRoad,
  isManualTransmission: ctx.query.isManualTransmission,
  isAffordableLuxury: ctx.query.isAffordableLuxury,
  isDuneBashing: ctx.query.isDuneBashing,
  isSafety: ctx.query.isSafety,
  isOneSeat: ctx.query.isOneSeat === "1",
  isTwoSeat: ctx.query.isTwoSeat === "1",
  isTwoPlusTwo: ctx.query.isTwoPlusTwo === "1",
  isThreeSeat: ctx.query.isThreeSeat === "1",
  isFourSeat: ctx.query.isFourSeat === "1",
  isFiveSeat: ctx.query.isFiveSeat === "1",
  isSixSeat: ctx.query.isSixSeat === "1",
  isSevenSeat: ctx.query.isSevenSeat === "1",
  isEightSeat: ctx.query.isEightSeat === "1",
  isNineSeat: ctx.query.isNineSeat === "1",
  isNinePlusSeat: ctx.query.isNinePlusSeat === "1",
});

const errorHandler = (ctx, error) => {
  console.error(error);
  ctx.throw(500, "Internal Server Error");
};

module.exports = {
  parseQueryParam,
  parseArrayQueryParams,
  buildFilters,
  buildAdditionalParams,
  errorHandler,
};
