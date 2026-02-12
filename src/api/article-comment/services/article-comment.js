'use strict';

/**
 * article-comment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::article-comment.article-comment');
