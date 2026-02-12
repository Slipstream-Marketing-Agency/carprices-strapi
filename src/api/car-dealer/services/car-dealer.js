'use strict';

/**
 * car-dealer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::car-dealer.car-dealer');
