/**
 * Usage Service
 * Records and queries API usage for billing and analytics.
 */
const ApiUsageLog = require('../models/ApiUsageLog');

/**
 * Get usage summary for a key in a given month.
 */
async function getUsageSummary(apiKeyId, periodMonth) {
    const pipeline = [
        { $match: { apiKeyId, periodMonth, routeKey: { $ne: '_rate_limit' } } },
        {
            $group: {
                _id: { routeKey: '$routeKey', statusClass: '$statusClass' },
                totalRequests: { $sum: '$requestCount' },
            },
        },
        {
            $group: {
                _id: '$_id.routeKey',
                byStatus: {
                    $push: {
                        statusClass: '$_id.statusClass',
                        count: '$totalRequests',
                    },
                },
                total: { $sum: '$totalRequests' },
            },
        },
        { $sort: { total: -1 } },
    ];

    const routeBreakdown = await ApiUsageLog.aggregate(pipeline);

    // Total requests across all routes
    const totalPipeline = [
        { $match: { apiKeyId, periodMonth, routeKey: { $ne: '_rate_limit' } } },
        { $group: { _id: null, total: { $sum: '$requestCount' } } },
    ];
    const totalResult = await ApiUsageLog.aggregate(totalPipeline);
    const totalRequests = totalResult.length > 0 ? totalResult[0].total : 0;

    return {
        periodMonth,
        totalRequests,
        routes: routeBreakdown.map(r => ({
            route: r._id,
            total: r.total,
            byStatus: r.byStatus,
        })),
    };
}

/**
 * Get all usage summaries (admin endpoint).
 */
async function getAllUsageSummary(periodMonth, { limit = 50, skip = 0 } = {}) {
    const pipeline = [
        { $match: { periodMonth, routeKey: { $ne: '_rate_limit' } } },
        {
            $group: {
                _id: '$apiKeyId',
                totalRequests: { $sum: '$requestCount' },
                planCode: { $first: '$planCode' },
            },
        },
        { $sort: { totalRequests: -1 } },
        { $skip: skip },
        { $limit: limit },
    ];

    return await ApiUsageLog.aggregate(pipeline);
}

module.exports = {
    getUsageSummary,
    getAllUsageSummary,
};
