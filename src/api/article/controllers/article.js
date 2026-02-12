"use strict";

const { fetchPageViews } = require("../../../../config/functions/ga4Analytics");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::article.article", ({ strapi }) => ({
  async articleList(ctx) {
    try {
      const { type, tag, category, car_brand, car_model, page = 1, pageSize = 10 } = ctx.query;

      let filters = "WHERE articles.published_at IS NOT NULL";
      let params = [];

      // Filter by article type if provided
      if (type) {
        const articleType = await strapi.db
          .query("api::article-type.article-type")
          .findOne({
            where: { slug: type },
            select: ["id"],
          });

        if (!articleType) return ctx.notFound("Article type not found"); // Return 404 if not found
        filters += " AND articles_article_type_links.article_type_id = ?";
        params.push(articleType.id);
      }

      // Filter by article tag if provided
      if (tag) {
        const articleTag = await strapi.db
          .query("api::article-tag.article-tag")
          .findOne({
            where: { slug: tag },
            select: ["id"],
          });

        if (!articleTag) return ctx.notFound("Article tag not found"); // Return 404 if not found
        filters += " AND articles_tags_links.article_tag_id = ?";
        params.push(articleTag.id);
      }

      // Filter by article category if provided
      if (category) {
        const articleCategory = await strapi.db
          .query("api::article-category.article-category")
          .findOne({
            where: { slug: category },
            select: ["id"],
          });

        if (!articleCategory) return ctx.notFound("Article category not found"); // Return 404 if not found
        filters += " AND articles_categories_links.article_category_id = ?";
        params.push(articleCategory.id);
      }

      // Filter by car brand if provided
      if (car_brand) {
        const carBrand = await strapi.db
          .query("api::car-brand.car-brand")
          .findOne({
            where: { slug: car_brand },
            select: ["id"],
          });

        if (!carBrand) return ctx.notFound("Car brand not found"); // Return 404 if not found
        filters += " AND car_brands_articles_links.car_brand_id = ?";
        params.push(carBrand.id);
      }

      // Filter by car model if provided
      if (car_model) {
        const carModel = await strapi.db
          .query("api::car-model.car-model")
          .findOne({
            where: { slug: car_model },
            select: ["id"],
          });

        if (!carModel) return ctx.notFound("Car model not found"); // Return 404 if not found
        filters += " AND car_models_articles_links.car_model_id = ?";
        params.push(carModel.id);
      }

      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Construct raw SQL query with DISTINCT to avoid duplicates
      const rawQuery = `
        SELECT DISTINCT
          articles.id,
          articles.title,
          articles.slug,
          articles.published_at as "publishedAt",
          articles.summary,
          article_types.slug as "articleType",
          authors.name as "author",
          files.formats -> 'small' ->> 'url' as "coverImage"
        FROM articles
        LEFT JOIN articles_article_type_links ON articles.id = articles_article_type_links.article_id
        LEFT JOIN article_types ON articles_article_type_links.article_type_id = article_types.id
        LEFT JOIN articles_author_links ON articles.id = articles_author_links.article_id
        LEFT JOIN authors ON articles_author_links.author_id = authors.id
        LEFT JOIN files_related_morphs ON articles.id = files_related_morphs.related_id
          AND files_related_morphs.field = 'coverImage'
        LEFT JOIN files ON files_related_morphs.file_id = files.id
        LEFT JOIN article_tags_articles_links AS articles_tags_links ON articles.id = articles_tags_links.article_id
        LEFT JOIN article_categories_articles_links AS articles_categories_links ON articles.id = articles_categories_links.article_id
        LEFT JOIN car_brands_articles_links AS car_brands_articles_links ON articles.id = car_brands_articles_links.article_id
        LEFT JOIN car_models_articles_links AS car_models_articles_links ON articles.id = car_models_articles_links.article_id
        ${filters}
        ORDER BY articles.id DESC
        LIMIT ? OFFSET ?;
      `;

      const result = await strapi.db.connection.raw(rawQuery, [...params, pageSize, offset]);

      // Structure response to match pagination format expected by Strapi
      const totalQuery = await strapi.db.connection.raw(`
        SELECT COUNT(DISTINCT articles.id) FROM articles
        LEFT JOIN articles_article_type_links ON articles.id = articles_article_type_links.article_id
        LEFT JOIN article_tags_articles_links AS articles_tags_links ON articles.id = articles_tags_links.article_id
        LEFT JOIN article_categories_articles_links AS articles_categories_links ON articles.id = articles_categories_links.article_id
        LEFT JOIN car_brands_articles_links AS car_brands_articles_links ON articles.id = car_brands_articles_links.article_id
        LEFT JOIN car_models_articles_links AS car_models_articles_links ON articles.id = car_models_articles_links.article_id
        ${filters};
      `, params);

      const total = parseInt(totalQuery.rows[0].count, 10);
      const pageCount = Math.ceil(total / pageSize);

      return {
        data: result.rows,
        pagination: {
          page: parseInt(page, 10),
          pageSize: parseInt(pageSize, 10),
          pageCount,
          total
        }
      };
    } catch (err) {
      ctx.body = { status: "error", message: err.message };
      ctx.status = 500;
    }
  },

  async findOneByTypeAndSlug(ctx) {
    try {
      const { type, slug } = ctx.params;

      if (!type || !slug) {
        return ctx.badRequest("Type or slug is missing");
      }

      const articleQuery = `
            SELECT 
                a.id, a.title, a.meta_title AS "metaTitle", a.slug, a.summary, 
                a.content, a.locale, a.view_count AS "viewCount", 
                a.engaged_sessions AS "engagedSessions", a.featured, 
                a.helpful_yes AS "helpfulYes", a.helpful_no AS "helpfulNo",
                a.created_at AS "createdAt", a.updated_at AS "updatedAt", a.published_at AS "publishedAt",
                json_build_object(
                    'url', c.url,
                    'formats', c.formats
                ) AS "coverImage", -- Cover Image with url and formats
                json_agg(DISTINCT at.*) AS "articleTypes", -- Array of article_types objects
                json_agg(DISTINCT ac.*) AS "articleCategories",
                json_agg(DISTINCT atg.*) AS "articleTags",
                json_build_object(
                    'id', au.id,
                    'name', au.name,
                    'email', au.email,
                    'author_description', au.author_description,
                    'date_of_birth', au.date_of_birth,
                    'location', au.location,
                    'position', au.position,
                    'instagram', au.instagram,
                    'twitter', au.twitter,
                    'linkedin', au.linkedin,
                    'total_articles_written', au.total_articles_written,
                    'avatar', json_build_object(
                        'url', af.url,
                        'formats', af.formats
                    )
                ) AS "author"
            FROM articles a
            LEFT JOIN articles_article_types_links atl ON atl.article_id = a.id
            LEFT JOIN article_types at ON at.id = atl.article_type_id
            LEFT JOIN article_categories_articles_links aca ON aca.article_id = a.id
            LEFT JOIN article_categories ac ON ac.id = aca.article_category_id
            LEFT JOIN article_tags_articles_links ata ON ata.article_id = a.id
            LEFT JOIN article_tags atg ON atg.id = ata.article_tag_id
            LEFT JOIN files_related_morphs fr ON fr.related_id = a.id AND fr.related_type = 'api::article.article'
            LEFT JOIN files c ON c.id = fr.file_id -- Cover Image file
            LEFT JOIN articles_author_links aal ON aal.article_id = a.id
            LEFT JOIN authors au ON au.id = aal.author_id
            LEFT JOIN files_related_morphs frm ON frm.related_id = au.id AND frm.related_type = 'api::author.author' -- Link to avatar
            LEFT JOIN files af ON af.id = frm.file_id -- Avatar file
            WHERE a.slug = ? AND a.published_at IS NOT NULL
            GROUP BY a.id, c.url, c.formats, au.id, af.url, af.formats
            LIMIT 1;
        `;

      // Execute the raw query with slug as a bound parameter
      const result = await strapi.db.connection.raw(articleQuery, [slug]);

      const articleData = result.rows ? result.rows[0] : result[0];

      if (!articleData) {
        return ctx.notFound("Article not found");
      }

      ctx.body = {
        data: articleData,
      };
    } catch (error) {
      console.error("Error fetching article:", error);
      ctx.status = 500;
      ctx.body = {
        status: "error",
        message: "An error occurred while fetching the article.",
      };
    }
  },

  async findArticleBrandModelVideoRelationsBySlug(ctx) {
    try {
      const { slug } = ctx.params;
  
      if (!slug) {
        return ctx.badRequest("Slug is missing");
      }
  
      // Fetch the article by slug, populating only the necessary fields and nested media
      const article = await strapi.db.query("api::article.article").findOne({
        where: { slug },
        populate: {
          car_brands: {
            populate: {
              brandLogo: true, // Populate the brand logo for car brands
            },
          },
          car_models: {
            populate: {
              car_trims: {
                populate: {
                  featuredImage: true,
                  car_brands: true,
                },
              },
            },
            car_brands: true, // Populate car brand for each car model
          },
          select_related_videos: {
            populate: {
              thumbnail: true, // Populate the thumbnail for related videos
            },
          },
        },
      });
  
      if (!article) {
        return ctx.notFound("Article not found");
      }
  
      // Process only the highTrim from car_trims for each car_model
      const carModelsWithHighTrim = article.car_models.map(model => {
        const highTrim = model.car_trims.find(trim => trim.highTrim === true); // Find the highTrim
        return {
          id: model.id,
          name: model.name,
          slug: model.slug,
          year: highTrim ? highTrim.year : null,
          highTrim: highTrim ? highTrim.featuredImage?.formats?.thumbnail.url : null,
          brandSlug: highTrim ? highTrim.car_brands[0].slug :null // Include brand slug for each model
        };
      });
  
      // Send only the required data in the response
      ctx.body = {
        data: {
          car_brands: article.car_brands,
          car_models: carModelsWithHighTrim,
          select_related_videos: article.select_related_videos,
        },
      };
    } catch (error) {
      console.error("Error fetching article relations:", error);
      ctx.status = 500;
      ctx.body = {
        status: "error",
        message: "An error occurred while fetching the article relations.",
      };
    }
  },  


  async articleListHome(ctx) {
    try {
      const articleTypeSlugs = ["news", "review"];
      const articleTypes = await strapi.db
        .query("api::article-type.article-type")
        .findMany({
          where: { slug: { $in: articleTypeSlugs } },
          select: ["id", "slug"],
        });

      const articleTypeIdMap = articleTypes.reduce((acc, type) => {
        acc[type.slug] = type.id;
        return acc;
      }, {});

      const customizeArticle = (article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        coverImage: article.coverImage ? article.coverImage?.formats?.small?.url : null,
        articleType: article.article_type.slug,
        author: article.author ? article.author.name : "Unknown",
        publishedAt: article.publishedAt,
        summary: article.summary,
      });

      const fetchAndCustomizeArticlesByType = async (typeSlug) => {
        const articles = await strapi.entityService.findMany(
          "api::article.article",
          {
            filters: {
              article_type: articleTypeIdMap[typeSlug],
              publishedAt: { $notNull: true },
            },
            sort: { id: "desc" },
            limit: 6,
            populate: ["coverImage", "article_type", "author"],
          }
        );
        return articles.map(customizeArticle);
      };

      const newsArticles = await fetchAndCustomizeArticlesByType("news");
      const reviewArticles = await fetchAndCustomizeArticlesByType("review");

      return {
        data: {
          news: newsArticles,
          reviews: reviewArticles,
        },
        message: "Articles filtered by type and customized in response",
      };
    } catch (err) {
      ctx.body = { status: "error", message: err.message };
      ctx.status = 500;
    }
  },

  async findOneBySlug(ctx) {
    try {
      const { articleSlug, articleTypeSlug } = ctx.params; // Assuming slugs are passed as query parameters

      if (!articleSlug || !articleTypeSlug) {
        return ctx.badRequest(
          "Both articleSlug and articleTypeSlug are required"
        );
      }

      // Find the article_type by its slug
      const articleType = await strapi.db
        .query("api::article-type.article-type")
        .findOne({
          where: { slug: articleTypeSlug },
        });

      if (!articleType) {
        return ctx.notFound("Article type not found");
      }

      // Find the current article by slug and ensure it belongs to the correct article_type
      const article = await strapi.db.query("api::article.article").findOne({
        where: {
          slug: articleSlug,
          article_type: articleType.id,
        },
        populate: {
          coverImage: true,
          author: true,
          categories: true,
          article_type: true,
        },
      });

      console.log("Current Article ID:", article.id);

      console.log("Article Type ID:", articleType.id);
      console.log(
        "Querying Previous Article with ID less than",
        article.id,
        "and Article Type ID",
        articleType.id
      );

      if (!article) {
        return ctx.notFound("Article not found");
      }

      // Fetch the previous article within the same article_type
      const prevArticle = await strapi.db
        .query("api::article.article")
        .findMany({
          where: {
            id: { $lt: article.id },
            article_type: articleType.id,
          },
          sort: { id: "desc" },
          limit: 1,
        });

      // Fetch the next article within the same article_type
      const nextArticle = await strapi.db
        .query("api::article.article")
        .findMany({
          where: {
            id: { $gt: article.id },
            article_type: articleType.id,
          },
          sort: { id: "asc" },
          limit: 1,
        });

      // Preparing the response with current, previous, and next article details
      const response = {
        current: {
          id: article.id,
          title: article.title,
          summary: article.summary,
          metaTitle: article.metaTitle,
          slug: article.slug,
          content: article.content,
          coverImage: article.coverImage ? article.coverImage.url : null,
          author: article.author ? article.author.name : "Unknown",
          publishedAt: article.publishedAt,
          article_type: articleType.slug,
        },
        previous:
          prevArticle.length > 0
            ? {
              id: prevArticle[0].id,
              title: prevArticle[0].title,
              slug: prevArticle[0].slug,
            }
            : null,
        next:
          nextArticle.length > 0
            ? {
              id: nextArticle[0].id,
              title: nextArticle[0].title,
              slug: nextArticle[0].slug,
            }
            : null,
      };

      return response;
    } catch (err) {
      ctx.body = { status: "error", message: err.message };
      ctx.status = 500;
    }
  },

  async articleListLastTwoWeeks(ctx) {
    try {
      const { slug, page = 1, pageSize = 10 } = ctx.query;

      // Calculate the date for two weeks ago
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      let filters = {
        publishedAt: { $gte: twoWeeksAgo }, // Ensure only articles published in the last two weeks are listed
      };

      if (slug) {
        const articleType = await strapi.db
          .query("api::article-type.article-type")
          .findOne({
            where: { slug },
            select: ["id"],
          });

        if (!articleType) return ctx.notFound("Article type not found");
        filters.article_type = articleType.id;
      }

      const { results, pagination } = await strapi.entityService.findPage(
        "api::article.article",
        {
          filters,
          sort: { id: "desc" },
          page,
          pageSize,
          populate: ["coverImage", "article_type", "author"],
        }
      );

      const customizedResults = results.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        coverImage: article.coverImage ? article.coverImage.url : null,
        articleType: article.article_type.slug,
        author: article.author.name,
        publishedAt: article.publishedAt,
        summary: article.summary,
      }));

      return { data: customizedResults, pagination };
    } catch (err) {
      ctx.body = { status: "error", message: err.message };
      ctx.status = 500;
    }
  },
  async updateArticleEngagementSession(ctx) {
    try {
      const viewsData = await fetchPageViews();
      const filteredViewsData = viewsData.filter(
        (item) =>
          item.path.startsWith("/news/") &&
          !item.path.includes("/tag/") &&
          !item.path.includes("/brand/")
      );

      const slugToViewsMap = filteredViewsData.reduce(
        (acc, { path, engagedSessions }) => {
          const slug = path.replace("/news/", "").split("/")[0]; // Adjust based on your URL structure
          acc[slug] = engagedSessions;
          return acc;
        },
        {}
      );

      const slugs = Object.keys(slugToViewsMap);
      console.log(
        `Updating ${slugs.length} articles with new engagement data.`
      );

      for (let i = 0; i < slugs.length; i++) {
        const slug = slugs[i];
        const engagedSessions = slugToViewsMap[slug];
        // Update articles based on slug
        const articlesToUpdate = await strapi.entityService.findMany(
          "api::article.article",
          { filters: { slug: slug } }
        );

        if (articlesToUpdate.length > 0) {
          await Promise.all(
            articlesToUpdate.map(async (article) => {
              await strapi.entityService.update(
                "api::article.article",
                article.id,
                {
                  data: { engagedSessions: engagedSessions },
                }
              );
            })
          );
          console.log(
            `Updated article ${i + 1}/${slugs.length
            }: ${slug} with ${engagedSessions} engagements.`
          );
        } else {
          console.log(`No article found for slug ${slug}.`);
        }
      }

      return (ctx.body = { message: "Articles updated successfully." });
    } catch (error) {
      console.error("Error updating articles by popularity:", error);
      return ctx.badRequest("Error updating articles by popularity");
    }
  },

  async listArticlesByEngagement(ctx) {
    try {
      // Pagination parameters
      const page = parseInt(ctx.query.page, 10) || 1; // Default to first page
      const pageSize = parseInt(ctx.query.pageSize, 10) || 10; // Default page size

      // Adjust startIndex for pagination
      const start = (page - 1) * pageSize;

      // Fetch articles with engagedSessions greater than 0 and published
      const articlesData = await strapi.entityService.findMany(
        "api::article.article",
        {
          filters: {
            engagedSessions: { $gt: 0 },
            publishedAt: { $notNull: true }, // Exclude unpublished articles
          },
          sort: { engagedSessions: "desc" },
          populate: ["coverImage", "author"],
          start, // Starting index for pagination
          limit: pageSize, // Number of items to fetch for pagination
        }
      );

      // Filter out articles without a coverImage post-fetch
      const filteredArticles = articlesData.filter(
        (article) => article.coverImage
      );

      // Format articles for the response
      const result = filteredArticles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        author: article.author,
        publishedAt: article.publishedAt,
        coverImage: article.coverImage.url,
        engagedSessions: article.engagedSessions,
      }));

      // Optionally, fetch total count for pagination metadata (if needed)
      const totalCount = await strapi.entityService.count(
        "api::article.article",
        {
          filters: {
            engagedSessions: { $gt: 0 },
            publishedAt: { $notNull: true },
          },
        }
      );

      // Structure the response with pagination metadata
      ctx.body = {
        data: result,
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(totalCount / pageSize),
          total: totalCount,
        },
      };
    } catch (error) {
      console.error("Error listing articles by engagement:", error);
      ctx.badRequest("Error listing articles by engagement");
    }
  },

  async findTagsAndCategoriesByType(ctx) {
    const { type } = ctx.params;
    const { query, page = 1, pageSize = 10 } = ctx.request.query;

    try {
      // Step 1: Find the article type ID based on the `type` parameter
      const articleType = await strapi.entityService.findMany('api::article-type.article-type', {
        filters: { slug: { $containsi: type } },
        fields: ['id'],
      });

      if (!articleType || articleType.length === 0) {
        return ctx.notFound('Article type not found');
      }

      const typeId = articleType[0].id;

      // Step 2: Query categories directly for this article type with the search query
      const categories = await strapi.entityService.findMany('api::article-category.article-category', {
        filters: {
          articles: { article_types: { id: typeId } },
          ...(query && { name: { $containsi: query } }), // Case-insensitive filter on `name` for categories
        },
        fields: ['name', 'slug'], // Only retrieve `name` and `slug` for categories
        limit: pageSize,
        start: (page - 1) * pageSize,
      });

      // Step 3: Query tags directly for this article type with the search query
      const tags = await strapi.entityService.findMany('api::article-tag.article-tag', {
        filters: {
          articles: { article_types: { id: typeId } },
          ...(query && { title: { $containsi: query } }), // Case-insensitive filter on `title` for tags
        },
        fields: ['title', 'slug'], // Only retrieve `title` and `slug` for tags
        limit: pageSize,
        start: (page - 1) * pageSize,
      });

      // Step 4: Format tags to use `name` instead of `title` in the response for consistency
      const formattedTags = tags.map(tag => ({
        name: tag.title, // Renaming `title` to `name` for response consistency
        slug: tag.slug,
      }));

      // Step 5: Send response with categories and tags along with pagination info
      ctx.send({
        categories,
        tags: formattedTags,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          totalCategories: categories.length,
          totalTags: formattedTags.length,
        },
      });
    } catch (error) {
      console.error('Error fetching tags and categories:', error);
      ctx.throw(500, 'Internal server error');
    }
  },

  async generateSitemap(ctx) {
    try {
      const entities = await strapi.db.query("api::article.article").findMany({
        populate: { article_type: true },
      });

      // Generate sitemap for trims
      const articleSitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${entities
          .map(
            (entity) => `
        <url>
          <loc>https://carprices.ae/${entity.article_type && entity.article_type.type === "News"
                ? "news"
                : "reviews"
              }/${entity.slug}</loc>
          <lastmod>${new Date(
                entity.updatedAt || entity.createdAt
              ).toISOString()}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.8</priority>
        </url>`
          )
          .join("")}
    </urlset>`;
      require("fs").writeFileSync(
        "public/articles-sitemap.xml",
        articleSitemap
      );

      ctx.body = "Sitemaps generated successfully.";
    } catch (error) {
      console.error("Error generating sitemaps:", error);
      ctx.body = "Error generating sitemaps.";
      ctx.status = 500;
    }
  },



  // NEW APIS

  async listArticlesByType(ctx) {
    try {
      const { typeSlug } = ctx.params;
      const { page = 1, pageSize = 10, sortBy = 'publishedAt:desc', category, tag } = ctx.query;

      // Validate page and pageSize
      const pageNum = Math.max(1, parseInt(page, 10));
      const pageLimit = Math.max(1, Math.min(100, parseInt(pageSize, 10)));

      // Find the type by slug to ensure it exists
      const articleType = await strapi.entityService.findMany('api::article-type.article-type', {
        filters: { slug: typeSlug },
        fields: ['id', 'type'],
      });

      if (!articleType || articleType.length === 0) {
        return ctx.throw(404, 'Article type not found');
      }

      const typeId = articleType[0].id;

      // Construct filters
      const filters = {
        article_types: { id: typeId },
        publishedAt: { $ne: null },
      };

      // Add category filter if provided
      if (category) {
        filters.article_categories = { slug: category };
      }

      // Add tag filter if provided
      if (tag) {
        filters.article_tags = { slug: tag };
      }

      // Fetch articles with pagination and sorting
      const start = (pageNum - 1) * pageLimit;

      const articles = await strapi.entityService.findMany('api::article.article', {
        filters,
        fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary'],
        populate: {
          coverImage: true,
          author: {
            populate: {
              avatar: true,  // Populate brandLogo within car_brands
            },
          },
          article_types: true,
          article_categories: true,
          article_tags: true,
          car_brands: {
            populate: {
              brandLogo: true,  // Populate brandLogo within car_brands
            },
          },
          car_models: true,
        },
        sort: sortBy.split(','),
        start,
        limit: pageLimit,
      });

      // Calculate total items for pagination
      const totalCount = await strapi.entityService.count('api::article.article', { filters });
      const pageCount = Math.ceil(totalCount / pageLimit);

      // Format and return the paginated response
      ctx.send({
        type: articleType[0].type,
        data: articles.map(article => ({
          publishedAt: article.publishedAt,
          id: article.id,
          title: article.title,
          slug: article.slug,
          updatedAt: article.updatedAt,
          summary: article.summary,
          coverImage: article.coverImage?.formats?.small?.url || null,
          author: article.author ? { name: article.author.name, avatar: article.author.avatar?.formats?.thumbnail?.url || null } : null,
          types: article.article_types?.map(type => ({
            id: type.id,
            name: type.type,
            slug: type.slug,
          })) || [],
          categories: article.article_categories?.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          })) || [],
          tags: article.article_tags?.map(tag => ({
            id: tag.id,
            name: tag.title,
            slug: tag.slug,
          })) || [],
          carBrands: article.car_brands?.map(brand => ({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            brandLogo: brand.brandLogo?.formats?.thumbnail?.url || null,  // Include brandLogo URL
          })) || [],
          carModels: article.car_models?.map(model => ({
            id: model.id,
            name: model.name,
            slug: model.slug,
          })) || [],
        })),
        pagination: {
          page: pageNum,
          pageCount,
          total: totalCount,
          pageSize: pageLimit,
        },
      });
    } catch (error) {
      console.error("Error in listArticlesByType controller:", error);
      ctx.throw(500, error);
    }
  },

  async findRelated(ctx) {
    const { slug, brand, model } = ctx.query;
    let relatedArticles = [];
    let fallbackType = ''; // Initialize the fallback type

    if (slug) {
      // Case 1: Single Article Page
      const articles = await strapi.entityService.findMany('api::article.article', {
        filters: { slug, publishedAt: { $ne: null } },
        populate: ['article_categories', 'article_tags', 'coverImage', 'article_types'], // Populate article_types
        fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary']
      });

      if (!articles || articles.length === 0) {
        console.warn(`Article not found or unpublished for slug: ${slug}. Proceeding with fallback articles.`);
      } else {
        const currentArticle = articles[0];

        // Primary: Related articles by category
        relatedArticles = await strapi.entityService.findMany('api::article.article', {
          filters: {
            article_categories: { id: currentArticle.article_categories?.map(c => c.id) },
            publishedAt: { $ne: null },
            id: { $ne: currentArticle.id }
          },
          fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary'],
          populate: ['coverImage', 'author', 'article_types'], // Populate article_types
          limit: 5,
          sort: 'publishedAt:desc'
        });
        fallbackType = 'category';

        // Secondary: Related articles by tags if fewer than 5 found
        if (relatedArticles.length < 5) {
          const additionalArticles = await strapi.entityService.findMany('api::article.article', {
            filters: {
              article_tags: { id: currentArticle.article_tags?.map(t => t.id) },
              publishedAt: { $ne: null },
              id: { $ne: currentArticle.id },
              article_categories: { id: currentArticle.article_categories?.map(c => c.id) }
            },
            fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary'],
            populate: ['coverImage', 'author', 'article_types'], // Populate article_types
            limit: 5 - relatedArticles.length,
            sort: 'publishedAt:desc'
          });

          relatedArticles = [...relatedArticles, ...additionalArticles];
          fallbackType = 'tags';
        }
      }
    } else if (brand) {
      // Case 2: Brand Detail Page
      const brandData = await strapi.entityService.findMany('api::car-brand.car-brand', {
        filters: { slug: brand },
        populate: ['articles'],
        fields: ['id']
      });

      if (!brandData || brandData.length === 0) {
        console.warn(`Brand not found for slug: ${brand}. Proceeding with fallback articles.`);
      } else {
        const brandId = brandData[0].id;

        relatedArticles = await strapi.entityService.findMany('api::article.article', {
          filters: {
            car_brands: { id: brandId },
            publishedAt: { $ne: null }
          },
          fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary'],
          populate: ['coverImage', 'author', 'article_types'], // Populate article_types
          limit: 5,
          sort: 'publishedAt:desc'
        });
        fallbackType = 'brand';
      }
    } else if (model) {
      // Case 3: Model Detail Page
      const modelData = await strapi.entityService.findMany('api::car-model.car-model', {
        filters: { slug: model },
        populate: ['articles', 'car_brand'],
        fields: ['id']
      });

      if (!modelData || modelData.length === 0) {
        console.warn(`Model not found for slug: ${model}. Proceeding with fallback articles.`);
      } else {
        const modelId = modelData[0].id;
        const brandId = modelData[0].car_brand?.id;

        // Primary: Related articles by model
        relatedArticles = await strapi.entityService.findMany('api::article.article', {
          filters: {
            car_models: { id: modelId },
            publishedAt: { $ne: null }
          },
          fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary'],
          populate: ['coverImage', 'author', 'article_types'], // Populate article_types
          limit: 5,
          sort: 'publishedAt:desc'
        });
        fallbackType = 'model';

        // Secondary: Fallback to brand-related articles if no model articles
        if (relatedArticles.length === 0 && brandId) {
          relatedArticles = await strapi.entityService.findMany('api::article.article', {
            filters: {
              car_brands: { id: brandId },
              publishedAt: { $ne: null }
            },
            fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary'],
            populate: ['coverImage', 'author', 'article_types'], // Populate article_types
            limit: 5,
            sort: 'publishedAt:desc'
          });
          fallbackType = 'brand';
        }
      }
    }

    // Final Fallback for all cases: Show popular or recent articles if no related articles found
    if (relatedArticles.length === 0) {
      console.log('No related articles by primary or secondary criteria. Fetching popular or recent articles.');

      // Fetch recent or popular articles
      relatedArticles = await strapi.entityService.findMany('api::article.article', {
        filters: { publishedAt: { $ne: null } },
        fields: ['publishedAt', 'id', 'title', 'slug', 'updatedAt', 'summary'],
        populate: ['coverImage', 'author', 'article_types'], // Populate article_types
        limit: 5,
        sort: 'publishedAt:desc' // Use 'viewCount:desc' if popularity is tracked
      });
      fallbackType = 'recent';
    }

    // Format the related articles and include the fallbackType
    return {
      fallbackType, // Include the fallback type in the response metadata
      articles: relatedArticles.map(article => ({
        publishedAt: article.publishedAt,
        id: article.id,
        title: article.title,
        slug: article.slug,
        updatedAt: article.updatedAt,
        summary: article.summary,
        coverImage: article.coverImage?.formats?.small?.url || null,
        author: article.author ? { name: article.author.name, avatar: article.author.avatar?.url || null } : null,
        types: article.article_types?.map(type => ({
          id: type.id,
          name: type.name,
          slug: type.slug
        })) || [] // Map and include article types
      }))
    };
  },
  async findPopularCategoriesAndTags(ctx) {
    const { type } = ctx.query;

    try {
      // Fetch popular categories based on the provided article type
      const categories = await strapi.db.query('api::article-category.article-category').findMany({
        where: {
          popular: true, // Boolean field in categories to mark as popular
          articles: {
            article_type: { slug: type }, // Filter by article type slug
          },
        },
        select: ['name', 'slug'], // Only fetch name and slug
      });

      // Fetch popular tags based on the provided article type
      const tags = await strapi.db.query('api::article-tag.article-tag').findMany({
        where: {
          popular: true, // Boolean field in tags to mark as popular
          articles: {
            article_type: { slug: type }, // Filter by article type slug
          },
        },
        select: ['title', 'slug'], // Only fetch title and slug
      });

      // Return popular categories and tags
      ctx.body = {
        categories,
        tags,
      };
    } catch (error) {
      console.error('Error fetching popular categories and tags:', error);
      ctx.throw(500, 'Unable to fetch popular categories and tags');
    }
  },
  async findArticlesThisWeek(ctx) {
    try {
      const { type } = ctx.query;

      // Calculate the start and end of the current week using JavaScript's Date object
      const now = new Date();
      const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

      // Calculate the start and end of the week (assuming week starts on Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0); // Set to start of the day

      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (6 - dayOfWeek));
      endOfWeek.setHours(23, 59, 59, 999); // Set to end of the day

      // Set up filters for articles published this week
      const filters = {
        publishedAt: {
          $gte: startOfWeek.toISOString(),
          $lte: endOfWeek.toISOString(),
        },
      };

      // Add article type filter if provided
      if (type) {
        filters.article_types = { slug: type };
      }

      // Fetch articles with the filters applied
      const articles = await strapi.entityService.findMany('api::article.article', {
        filters,
        fields: ['id', 'title', 'slug', 'publishedAt', 'summary'],
        populate: ['coverImage', 'author', 'article_types'],
        sort: { publishedAt: 'desc' },
      });

      // Format and send response
      ctx.send({
        data: articles.map(article => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          publishedAt: article.publishedAt,
          summary: article.summary,
          coverImage: article.coverImage?.formats?.small?.url || null,
          author: article.author ? article.author.name : 'Unknown Author',
          types: article.article_types.map(type => type.slug),
        })),
      });
    } catch (error) {
      console.error('Error fetching weekly articles:', error);
      ctx.throw(500, 'Unable to fetch articles');
    }
  },

  async findArticlesLastTwoWeeks(ctx) {
    try {
      const { type } = ctx.query;

      // Calculate the start of two weeks ago and the end as today
      const now = new Date();
      const startOfTwoWeeksAgo = new Date(now);
      startOfTwoWeeksAgo.setDate(now.getDate() - 14); // 14 days ago
      startOfTwoWeeksAgo.setHours(0, 0, 0, 0); // Set to start of the day

      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999); // Set to end of the day

      // Set up filters for articles published in the last two weeks
      const filters = {
        publishedAt: {
          $gte: startOfTwoWeeksAgo.toISOString(),
          $lte: endOfToday.toISOString(),
        },
      };

      // Add article type filter if provided
      if (type) {
        filters.article_types = { slug: type };
      }

      // Fetch articles with the filters applied
      const articles = await strapi.entityService.findMany('api::article.article', {
        filters,
        fields: ['id', 'title', 'slug', 'publishedAt', 'summary'],
        populate: ['coverImage', 'author', 'article_types'],
        sort: { publishedAt: 'desc' },
      });

      // Format and send response
      ctx.send({
        data: articles.map(article => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          publishedAt: article.publishedAt,
          summary: article.summary,
          coverImage: article.coverImage?.formats?.small?.url || null,
          author: article.author ? article.author.name : 'Unknown Author',
          types: article.article_types.map(type => type.slug),
        })),
      });
    } catch (error) {
      console.error('Error fetching last two weeks articles:', error);
      ctx.throw(500, 'Unable to fetch articles');
    }
  },


}));
