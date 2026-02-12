"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/articletags/list",
      handler: "article-tag.listAllTags",
      config: {
        auth: false, // Set according to your needs
      },
    },
  ],
};
