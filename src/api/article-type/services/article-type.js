'use strict';

/**
 * article-type service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::article-type.article-type');
