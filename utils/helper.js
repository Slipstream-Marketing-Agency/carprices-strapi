module.exports = {
    async getLatestYear() {
      try {
        const latestTrim = await strapi.db.query('api::car-trim.car-trim').findOne({
          select: ['year'],
          where: { publishedAt: { $ne: null } },
          orderBy: { year: 'desc' },
          limit: 1,
        });
        return latestTrim?.year || null;
      } catch (error) {
        console.error("Error fetching latest year:", error);
        throw new Error('Unable to fetch latest year');
      }
    },
  };