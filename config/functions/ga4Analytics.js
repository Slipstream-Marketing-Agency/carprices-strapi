require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// Initialize the GA4 Data API client with credentials from environment variables
let analyticsDataClient = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
        analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
        });
    } catch (error) {
        console.warn('Failed to initialize GA4 Analytics client:', error.message);
    }
} else {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS_JSON not found in environment variables. GA4 analytics will be disabled.');
}

const propertyId = process.env.GA4_PROPERTY_ID; // Your GA4 Property ID, e.g., '123456789'

// Utility function to calculate the date 3 months ago in 'YYYY-MM-DD' format
function threeMonthsAgo() {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // Correcting to subtract 3 months from the current date
    return date.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD' format
}

async function fetchPageViews() {
    if (!analyticsDataClient) {
        console.warn('GA4 Analytics client not initialized. Returning empty page views.');
        return [];
    }

    const startDate = threeMonthsAgo();
    const endDate = new Date().toISOString().split('T')[0]; // Today's date in 'YYYY-MM-DD' format

    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }], // Adjust if necessary for your GA4 setup
        metrics: [{ name: 'engagedSessions' }], // Changed to fetch engaged sessions
    });

    return response.rows.map(row => ({
        path: row.dimensionValues[0].value,
        engagedSessions: parseInt(row.metricValues[0].value, 10),
    }));
}

module.exports = { fetchPageViews };
