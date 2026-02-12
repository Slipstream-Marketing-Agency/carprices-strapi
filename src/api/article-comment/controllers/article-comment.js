'use strict';

/**
 * article-comment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article-comment.article-comment', ({ strapi }) => ({

    async find(ctx) {
        try {
            const { slug } = ctx.query;
    
            // Fetch the article by slug
            const article = await strapi.db.query('api::article.article').findOne({
                where: { slug },
            });
    
            if (!article) {
                return ctx.notFound('Article not found');
            }
    
            // Fetch top-level comments for the article, with nested replies if available
            const comments = await strapi.db.query('api::article-comment.article-comment').findMany({
                where: {
                    article: article.id,
                    article_comment: null, // Fetch only top-level comments
                },
                populate: {
                    users_permissions_user: true,
                    article_comments: {
                        populate: {
                            users_permissions_user: true,
                            article_comments: {
                                populate: {
                                    users_permissions_user: true,
                                    article_comments: {
                                        populate: {
                                            users_permissions_user: true,
                                            article_comments: {
                                                populate: {
                                                    users_permissions_user: true,
                                                    article_comments: true, // Continue nesting as deeply as required
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' } // Use camelCase for createdAt
            });
    
            ctx.body = comments;
        } catch (error) {
            console.error("Error fetching comments:", error);
            ctx.throw(500, 'An error occurred while fetching comments');
        }
    },
     
    async create(ctx) {
        const { slug, title, opinion, article_comment } = ctx.request.body;
    
        // Retrieve user ID from authenticated token
        const userId = ctx.state.user?.id;
    
        if (!userId) {
            return ctx.unauthorized('User must be logged in to comment');
        }
    
        // Find the article by slug
        const article = await strapi.db.query('api::article.article').findOne({
            where: { slug },
        });
    
        if (!article) {
            return ctx.notFound('Article not found');
        }
    
        try {
            // Create the comment with a reference to the article and authenticated user
            const newComment = await strapi.db.query('api::article-comment.article-comment').create({
                data: {
                    article: article.id,
                    users_permissions_user: userId,  // Use user ID from the token
                    title,
                    opinion,
                    article_comment, // The parent comment (if this is a reply)
                },
            });
            return newComment;
        } catch (error) {
            console.error('Error creating comment:', error); // Add logging for troubleshooting
            ctx.throw(500, 'An error occurred while creating the comment');
        }
    }    
}));
