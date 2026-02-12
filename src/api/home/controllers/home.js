"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::home.home", ({ strapi }) => ({
  async customMethod(ctx) {
    try {
      // Update the service call to populate the relationships
      // Note: The structure and names of the populate object depend on your specific Strapi version and setup
      const populateOptions = {
        populate: {
          banner_image: true, // Assuming `banner_image` is a media field and you want to populate it entirely
          car_brands: { populate: { brandLogo: true } },
          car_body_types: { populate: { image: true } }, // Populate the entire `car_body_types` relation
        },
      };

      const data = await strapi.service("api::home.home").find(populateOptions);

      const brands = data.car_brands.map((brand) => ({
        name: brand.name,
        slug: brand.slug,
        logo: brand.brandLogo ? brand.brandLogo.url : null, // Check for existence of brandLogo
      }));

      const bodyTypes = data.car_body_types.map((body) => ({
        name: body.name,
        slug: body.slug,
        image: body.image ? body.image.url : null, // Check for existence of brandLogo
      }));

      // Custom response logic remains the same
      const customResponse = {
        data: {
          bannerText: data.banner_text,
          bannerImage: data.banner_image ? data.banner_image.url : null,
          brand: brands,
          bodyTypes: bodyTypes,
        },
        message:
          "Custom response with populated fields for the Home single type",
      };

      ctx.body = customResponse;
    } catch (err) {
      ctx.body = err;
    }
  },
}));
