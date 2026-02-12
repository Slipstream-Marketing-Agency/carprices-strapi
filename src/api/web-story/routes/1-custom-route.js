module.exports = {
  routes: [
    {
      method: "GET",
      path: "/web-stories",
      handler: "web-story.find",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/web-stories/:slug",
      handler: "web-story.findOneBySlug",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/web-stories/category/:slug",
      handler: "web-story.findByCategory",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/web-stories/tag/:slug",
      handler: "web-story.findByTag",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/web-story-categories",
      handler: "web-story.findCategories",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/web-story-tags",
      handler: "web-story.findTagsForWebStories",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/popular-tags",
      handler: "web-story.findPopularTags",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
