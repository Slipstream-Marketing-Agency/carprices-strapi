'use strict';

/**
 * web-story service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::web-story.web-story');
