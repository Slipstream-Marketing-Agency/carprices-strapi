'use strict';

/**
 * car-review service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::car-review.car-review');
