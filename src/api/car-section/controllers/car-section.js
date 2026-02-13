"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

// ─── In-memory cache (5-minute TTL) ────────────────────────────────
const sectionCache = {};
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = sectionCache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key, data) {
  sectionCache[key] = { data, ts: Date.now() };
}

// Map query-param flag → section name stored in DB
const SECTION_MAP = {
  suvs: "SUVs",
  performance: "Performance",
  electric: "Popular Electric Cars",
  featured: "Featured Cars",
  popular: "Popular Cars",
};

module.exports = createCoreController(
  "api::car-section.car-section",
  ({ strapi }) => ({
    async findAll(ctx) {
      try {
        // Determine which section was requested
        let sectionName = null;
        for (const [param, name] of Object.entries(SECTION_MAP)) {
          if (ctx.query[param] === "1") {
            sectionName = name;
            break;
          }
        }
        if (!sectionName) return [];

        // Return cached result if available
        const cacheKey = `car-section:${sectionName}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        // Single SQL query — replaces deep Strapi populate + JS post-processing
        const knex = strapi.db.connection;
        const { rows } = await knex.raw(
          `
          SELECT
            cs.id          AS section_id,
            cs.name        AS section_name,
            cm.id          AS model_id,
            cm.name        AS model_name,
            cm.slug        AS model_slug,
            cb.name        AS brand_name,
            cb.slug        AS brand_slug,
            latest.latest_year,
            prices.min_price,
            prices.max_price,
            ht.power,
            ht.displacement,
            ht.transmission,
            ht.torque,
            ht.engine,
            ht.year        AS high_trim_year,
            f.formats      AS image_formats
          FROM car_sections cs
          JOIN car_sections_car_models_links csml
            ON csml.car_section_id = cs.id
          JOIN car_models cm
            ON cm.id = csml.car_model_id
           AND cm.published_at IS NOT NULL
          /* Latest year per model */
          CROSS JOIN LATERAL (
            SELECT MAX(ct.year) AS latest_year
            FROM car_trims ct
            JOIN car_trims_car_models_links ctml ON ctml.car_trim_id = ct.id
            WHERE ctml.car_model_id = cm.id
              AND ct.published_at IS NOT NULL
          ) latest
          /* Min / max price for that year */
          LEFT JOIN LATERAL (
            SELECT MIN(ct.price) AS min_price, MAX(ct.price) AS max_price
            FROM car_trims ct
            JOIN car_trims_car_models_links ctml ON ctml.car_trim_id = ct.id
            WHERE ctml.car_model_id = cm.id
              AND ct.year = latest.latest_year
              AND ct.price > 0
              AND ct.published_at IS NOT NULL
          ) prices ON true
          /* Highest-priced trim of that year (for specs + image) */
          LEFT JOIN LATERAL (
            SELECT ct.id AS trim_id, ct.power, ct.displacement,
                   ct.transmission, ct.torque, ct.engine, ct.year
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
          WHERE cs.name = ? AND cs.published_at IS NOT NULL
          ORDER BY cs.id, cm.id
          `,
          [sectionName]
        );

        // Group flat rows → nested { id, name, carModels[] }
        const sectionsMap = {};
        for (const r of rows) {
          if (!sectionsMap[r.section_id]) {
            sectionsMap[r.section_id] = {
              id: r.section_id,
              name: r.section_name,
              carModels: [],
            };
          }

          // Parse thumbnail from JSONB formats column
          let featuredImage = "";
          if (r.image_formats) {
            const formats =
              typeof r.image_formats === "string"
                ? JSON.parse(r.image_formats)
                : r.image_formats;
            const thumb = formats?.thumbnail;
            if (thumb) {
              featuredImage = {
                url: thumb.url,
                ext: thumb.ext,
                mime: thumb.mime,
                size: thumb.size,
                width: thumb.width,
                height: thumb.height,
              };
            }
          }

          sectionsMap[r.section_id].carModels.push({
            id: r.model_id,
            model: { name: r.model_name, slug: r.model_slug },
            brand: r.brand_name
              ? { name: r.brand_name, slug: r.brand_slug }
              : null,
            featuredImage,
            power: r.power,
            displacement: r.displacement,
            transmission: r.transmission,
            torque: r.torque,
            engine: r.engine,
            year: r.high_trim_year,
            minPrice: r.min_price != null ? Number(r.min_price) : null,
            maxPrice: r.max_price != null ? Number(r.max_price) : null,
          });
        }

        const result = Object.values(sectionsMap).sort((a, b) => a.id - b.id);

        setCache(cacheKey, result);
        return result;
      } catch (err) {
        ctx.throw(500, err);
      }
    },
  })
);