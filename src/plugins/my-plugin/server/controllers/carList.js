const getList = async (ctx) => {
    try {
      // Fetch all car brands, models, and trims with the necessary relationships
      const brands = await strapi.entityService.findMany('api::car-brand.car-brand', {
        populate: {
          car_models: {
            populate: {
              highTrim: true,
            },
          },
        },
      });
  
      // Map the data to the desired structure
      const result = brands.map((brand) => {
        return brand.car_models
          .filter((model) => model.highTrim) // Only include models with a highTrim
          .map((model) => ({
            brand: brand.name,
            year: model.highTrim.year, // Assuming the highTrim has a `year` attribute
            modelName: model.name,
            highTrimName: model.highTrim.name,
          }));
      }).flat();
  
      ctx.send(result);
    } catch (error) {
      ctx.throw(500, error);
    }
  };
  
  module.exports = {
    getList,
  };
  