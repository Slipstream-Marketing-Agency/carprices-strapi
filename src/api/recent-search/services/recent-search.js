'use strict';

/**
 * recent-search service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::recent-search.recent-search');
