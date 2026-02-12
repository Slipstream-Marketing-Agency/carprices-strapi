'use strict';

/**
 * car-video controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::car-video.car-video', ({ strapi }) => ({
    async findByTrendingOrSort(ctx) {
        try {
            const { trending, sort } = ctx.query;
            const page = parseInt(ctx.query.page, 10) || 1;
            const pageSize = parseInt(ctx.query.pageSize, 10) || 10;
            const sortField = sort || 'createdAt';
            const order = ctx.query.order || 'DESC';

            // Build the query conditions based on the presence of 'trending' parameter
            const queryConditions = {};

            if (trending === 'true') {
                // Filter for trending videos
                queryConditions.trending = true;
            }

            // Fetch car videos based on the combined query conditions, pagination, and sorting
            const carVideos = await strapi.db.query('api::car-video.car-video').findMany({
                where: queryConditions,
                populate: {
                    thumbnail: true,
                },
                limit: pageSize,
                offset: (page - 1) * pageSize,
                orderBy: {
                    [sortField]: order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
                },
            });

            // Get the total number of car videos for pagination
            const totalCarVideos = await strapi.db.query('api::car-video.car-video').count({
                where: queryConditions,
            });

            // Construct a custom response with only the required fields
            const customResponse = carVideos.map(video => ({
                title: video.title,
                slug: video.slug,
                thumbnail: video?.thumbnail?.url,
                description: video.description,
            }));

            // Return the car videos along with pagination info
            ctx.body = {
                videos: customResponse,
                pagination: {
                    page,
                    pageSize,
                    totalItems: totalCarVideos,
                    totalPages: Math.ceil(totalCarVideos / pageSize),
                },
            };
        } catch (err) {
            strapi.log.error('Error fetching car videos by trending or sorting:', err);
            return ctx.internalServerError('An error occurred');
        }
    },
    async findByBrandsAndModels(ctx) {
        try {
            const { brands, models } = ctx.query;
            const brandSlugs = brands ? brands.split(',') : [];
            const modelSlugs = models ? models.split(',') : [];
            const page = parseInt(ctx.query.page, 10) || 1;
            const pageSize = parseInt(ctx.query.pageSize, 10) || 10;
    
            // Fetch brand IDs based on brand slugs
            let brandIds = [];
            if (brandSlugs.length > 0) {
                const brandEntities = await strapi.db.query('api::car-brand.car-brand').findMany({
                    where: { slug: { $in: brandSlugs } },
                    select: ['id']
                });
                brandIds = brandEntities.map(brand => brand.id);
            }
    
            // Fetch model IDs based on model slugs
            let modelIds = [];
            if (modelSlugs.length > 0) {
                const modelEntities = await strapi.db.query('api::car-model.car-model').findMany({
                    where: { slug: { $in: modelSlugs } },
                    select: ['id']
                });
                modelIds = modelEntities.map(model => model.id);
            }
    
            const queryConditions = {};
    
            // Add brand filter condition if brand IDs are available
            if (brandIds.length > 0) {
                queryConditions.select_related_brands = { id: { $in: brandIds } };
            }
    
            // Add model filter condition if model IDs are available
            if (modelIds.length > 0) {
                queryConditions.select_related_models = { id: { $in: modelIds } };
            }
    
            // Fetch car videos based on the combined query conditions and pagination
            const carVideos = await strapi.db.query('api::car-video.car-video').findMany({
                where: queryConditions,
                populate: {
                    thumbnail: true,
                    select_related_brands: true,
                    select_related_models: true,
                },
                limit: pageSize,
                offset: (page - 1) * pageSize,
            });
    
            const totalCarVideos = await strapi.db.query('api::car-video.car-video').count({
                where: queryConditions,
            });
    
            // Construct a custom response with only the required fields
            const customResponse = carVideos.map(video => ({
                id: video.id,
                title: video.title,
                slug: video.slug,
                thumbnail: video.thumbnail?.url,
                description: video.description,
                brands: video.select_related_brands.map(brand => brand.name),
                models: video.select_related_models.map(model => model.name),
            }));
    
            ctx.body = {
                videos: customResponse,
                pagination: {
                    page,
                    pageSize,
                    totalItems: totalCarVideos,
                    totalPages: Math.ceil(totalCarVideos / pageSize),
                },
            };
        } catch (err) {
            strapi.log.error('Error fetching car videos by brand and model slugs:', err);
            return ctx.internalServerError('An error occurred');
        }
    },      
    async findOne(ctx) {
        try {
            const { slug } = ctx.params;

            const entity = await strapi.db.query("api::car-video.car-video").findOne({
                where: { slug },
                populate: {
                    thumbnail: true,
                    hostedVideo: true,
                    select_related_articles: true,
                    select_related_models: true,
                    select_related_brands: true,
                },
            });

            if (!entity) {
                return ctx.notFound("Video not found");
            }

            const data = {
                id: entity.id,
                title: entity.title,
                description: entity.description,
                slug: entity.slug,
                thumbnail: entity.thumbnail?.url || null,
                hostedVideo: entity.hostedVideo?.url || null,
                youtube_url: entity.youtube_url || null,
            };

            ctx.body = data;
        } catch (error) {
            ctx.throw(500, `Failed to fetch video by slug: ${error.message}`);
        }
    },
}));
