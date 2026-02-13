"use strict";

/**
 * compare-car controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

// ─── In-memory cache (5-minute TTL) ────────────────────────────────
let compareCache = null;
let compareCacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000;

module.exports = createCoreController(
  "api::compare-car.compare-car",
  ({ strapi }) => ({
    async findCompareCar(ctx) {
      try {
        // Return cached result if fresh
        if (compareCache && Date.now() - compareCacheTs < CACHE_TTL) {
          return compareCache;
        }

        const knex = strapi.db.connection;
        const { rows } = await knex.raw(`
          SELECT
            cc.id          AS comparison_id,
            cc.comparison  AS comparison_name,
            cm.id          AS model_id,
            cm.name        AS model_name,
            cm.slug        AS model_slug,
            cb.name        AS brand_name,
            cb.slug        AS brand_slug,
            latest.latest_year,
            prices.min_price,
            prices.max_price,
            ht.year        AS high_trim_year,
            ht.main_slug   AS main_slug,
            f.formats      AS image_formats
          FROM compare_cars cc
          JOIN car_models_compare_car_links mccl
            ON mccl.compare_car_id = cc.id
          JOIN car_models cm
            ON cm.id = mccl.car_model_id
           AND cm.published_at IS NOT NULL
          /* Latest year per model */
          CROSS JOIN LATERAL (
            SELECT MAX(ct.year) AS latest_year
            FROM car_trims ct
            JOIN car_trims_car_models_links ctml ON ctml.car_trim_id = ct.id
            WHERE ctml.car_model_id = cm.id
              AND ct.published_at IS NOT NULL
          ) latest
          /* Min / max price for latest year */
          LEFT JOIN LATERAL (
            SELECT MIN(ct.price) AS min_price, MAX(ct.price) AS max_price
            FROM car_trims ct
            JOIN car_trims_car_models_links ctml ON ctml.car_trim_id = ct.id
            WHERE ctml.car_model_id = cm.id
              AND ct.year = latest.latest_year
              AND ct.price > 0
              AND ct.published_at IS NOT NULL
          ) prices ON true
          /* Highest-priced trim of latest year (for image + slug) */
          LEFT JOIN LATERAL (
            SELECT ct.id AS trim_id, ct.year, ct.main_slug
            FROM car_trims ct
            JOIN car_trims_car_models_links ctml ON ctml.car_trim_id = ct.id
            WHERE ctml.car_model_id = cm.id
              AND ct.year = latest.latest_year
              AND ct.published_at IS NOT NULL
            ORDER BY ct.price DESC NULLS LAST
            LIMIT 1
          ) ht ON true
          /* Brand */
          LEFT JOIN car_models_car_brands_links cmbl
            ON cmbl.car_model_id = cm.id
          LEFT JOIN car_brands cb
            ON cb.id = cmbl.car_brand_id
          /* Featured image of the high trim */
          LEFT JOIN files_related_morphs frm
            ON frm.related_id = ht.trim_id
           AND frm.related_type = 'api::car-trim.car-trim'
           AND frm.field = 'featuredImage'
          LEFT JOIN files f
            ON f.id = frm.file_id
          WHERE cc.published_at IS NOT NULL
          ORDER BY cc.id, cm.id
        `);

        // Group flat rows → nested { id, name, carModels[] }
        const comparisonsMap = {};
        for (const r of rows) {
          if (!comparisonsMap[r.comparison_id]) {
            comparisonsMap[r.comparison_id] = {
              id: r.comparison_id,
              name: r.comparison_name,
              carModels: [],
            };
          }

          // Extract thumbnail URL from JSONB formats column
          let featuredImageUrl = null;
          if (r.image_formats) {
            const formats =
              typeof r.image_formats === "string"
                ? JSON.parse(r.image_formats)
                : r.image_formats;
            featuredImageUrl = formats?.thumbnail?.url || null;
          }

          const hasTrims =
            r.latest_year != null &&
            r.min_price != null &&
            r.high_trim_year != null;

          comparisonsMap[r.comparison_id].carModels.push({
            id: r.model_id,
            name: r.model_name,
            slug: r.model_slug,
            brand: r.brand_name
              ? { name: r.brand_name, slug: r.brand_slug }
              : null,
            highTrim: hasTrims
              ? {
                  year: r.high_trim_year,
                  featuredImage: featuredImageUrl,
                  mainSlug: r.main_slug,
                }
              : null,
            minPrice: r.min_price != null ? Number(r.min_price) : null,
            maxPrice: r.max_price != null ? Number(r.max_price) : null,
          });
        }

        const result = Object.values(comparisonsMap);

        // Cache result
        compareCache = result;
        compareCacheTs = Date.now();

        return result;
      } catch (err) {
        ctx.throw(500, err.message || "An unexpected error occurred");
      }
    },
  })
);
