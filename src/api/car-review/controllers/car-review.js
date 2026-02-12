'use strict';

/**
 * car-review controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::car-review.car-review', ({ strapi }) => ({

    // 1. Create a new car review using model slug
    async create(ctx) {
        try {
            const { title, opinion, rating, car_model_slug } = ctx.request.body; // Use slug instead of ID
            const userId = ctx.state.user?.id;

            if (!userId) {
                console.log('ctx.state:', ctx.state); // Log the full context to troubleshoot
                return ctx.badRequest('User ID not found in context');
            }

            // Find the car model by slug
            const carModel = await strapi.db.query('api::car-model.car-model').findOne({
                where: { slug: car_model_slug },
            });

            if (!carModel) {
                return ctx.notFound('Car model not found');
            }

            // Create the review with a reference to the car model and user
            const newReview = await strapi.db.query('api::car-review.car-review').create({
                data: {
                    title,
                    opinion,
                    rating,
                    car_model: carModel.id,  // Use the car model's ID from the slug lookup
                    users_permissions_user: userId,
                    helpfulYes: 0,
                    helpfulNo: 0,
                },
            });

            return newReview;
        } catch (error) {
            console.error('Error creating review:', error);
            ctx.throw(500, 'An error occurred while creating the review');
        }
    },

    // 2. List all reviews for a specific car model by slug
    async find(ctx) {
        try {
            const { carModelSlug } = ctx.query; // Use slug instead of ID

            // Find the car model by slug
            const carModel = await strapi.db.query('api::car-model.car-model').findOne({
                where: { slug: carModelSlug },
            });

            if (!carModel) {
                return ctx.notFound('Car model not found');
            }

            // Find all reviews for the specified car model by ID
            const reviews = await strapi.db.query('api::car-review.car-review').findMany({
                where: { car_model: carModel.id },
                populate: {
                    users_permissions_user: true, // Populate user info if needed
                    car_model: true,
                },
            });

            return reviews;
        } catch (error) {
            ctx.throw(500, 'An error occurred while fetching reviews');
        }
    },

    // 3. Update helpfulYes or helpfulNo count
    async updateHelpful(ctx) {
        try {
            const { id } = ctx.params; // Review ID
            const { type } = ctx.request.body; // 'yes' or 'no' indicating vote type

            // Fetch the existing review
            const review = await strapi.db.query('api::car-review.car-review').findOne({ where: { id } });

            if (!review) {
                return ctx.notFound('Review not found');
            }

            // Increment the appropriate helpful count
            let updatedData = {};
            if (type === 'yes') {
                updatedData.helpfulYes = review.helpfulYes + 1;
            } else if (type === 'no') {
                updatedData.helpfulNo = review.helpfulNo + 1;
            } else {
                return ctx.badRequest('Invalid vote type');
            }

            // Update the review with new helpful count
            const updatedReview = await strapi.db.query('api::car-review.car-review').update({
                where: { id },
                data: updatedData,
            });

            return updatedReview;
        } catch (error) {
            ctx.throw(500, 'An error occurred while updating the helpful vote');
        }
    },
}));
