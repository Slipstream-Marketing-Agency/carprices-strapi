"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/articles/list",
      handler: "article.articleList",
      config: {
        auth: false, // Set according to your needs
      },
    },
    {
      method: "GET",
      path: "/articles/listlasttwoweeks",
      handler: "article.articleListLastTwoWeeks",
      config: {
        auth: false, // Set according to your needs
      },
    },
    {
      method: "GET",
      path: "/articles/home",
      handler: "article.articleListHome",
      config: {
        auth: false, // Set according to your needs
      },
    },
    {
      method: "GET",
      path: "/articles/findone/:articleSlug/:articleTypeSlug",
      handler: "article.findOneBySlug",
      config: {
        auth: false, // Set according to your needs
      },
    },
    {
      method: "GET",
      path: "/articles/updateArticleEngagementSession",
      handler: "article.updateArticleEngagementSession",
      config: {
        auth: false, // Set according to your needs
      },
    },
    {
      method: "GET",
      path: "/articles/listArticlesByEngagement",
      handler: "article.listArticlesByEngagement",
      config: {
        auth: false, // Set according to your needs
      },
    },
    {
      method: "GET",
      path: "/articles/generateSitemap",
      handler: "article.generateSitemap",
      config: {
        auth: false, // Set according to your needs
      },
    },

    // New Routes

    {
      "method": "GET",
      "path": "/articles/type/:typeSlug",
      "handler": "article.listArticlesByType",
      "config": {
        "policies": [],
        auth: false,
      }
    },

    {
      method: 'GET',
      path: '/articles/related',
      handler: 'article.findRelated',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: "GET",
      path: "/articles/:type/:slug",
      handler: "article.findOneByTypeAndSlug",
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
    {
      method: "GET",
      path: "/relations/:slug",
      handler: "article.findArticleBrandModelVideoRelationsBySlug",
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
    {
      method: 'GET',
      path: '/articles/search/:type/tags-categories',
      handler: 'article.findTagsAndCategoriesByType',
      config: {
        auth: false, // Set to true if you need authentication
      },
    },
    {
      "method": "GET",
      "path": "/articles/popular-categories-tags",
      "handler": "article.findPopularCategoriesAndTags",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/articles/this-week',
      handler: 'article.findArticlesThisWeek',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/articles/last-two-weeks',
      handler: 'article.findArticlesLastTwoWeeks',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
