// AI Matching Algorithm for LocalCollab

/**
 * Calculate match score between a shop and an influencer
 * @param {Object} shop - Shop profile
 * @param {Object} influencer - Influencer profile
 * @returns {Object} - Match score and breakdown
 */
export function calculateMatchScore(shop, influencer) {
    let totalScore = 0;
    const breakdown = {};

    // 1. Location Match (30%)
    let locationScore = 0;
    if (shop.city === influencer.city) {
        if (shop.area === influencer.area) {
            locationScore = 30; // Same area - perfect match
        } else {
            locationScore = 20; // Same city  - good match
        }
    } else {
        locationScore = 5; // Different city - but still possible
    }
    breakdown.location = locationScore;
    totalScore += locationScore;

    // 2. Budget Compatibility (30%)
    let budgetScore = 0;
    const priceDiff = Math.abs(influencer.pricePerPost - shop.marketingBudget / 3); // Assume 3 posts budget
    const priceRatio = priceDiff / (shop.marketingBudget / 3);

    if (influencer.pricePerPost <= shop.marketingBudget / 3) {
        if (priceRatio < 0.1) {
            budgetScore = 30; // Perfect price match
        } else if (priceRatio < 0.3) {
            budgetScore = 25; // Close to budget
        } else {
            budgetScore = 20; // Within budget
        }
    } else if (priceRatio < 0.2) {
        budgetScore = 15; // Slightly over budget
    } else {
        budgetScore = 5; // Over budget but negotiable
    }
    breakdown.budget = budgetScore;
    totalScore += budgetScore;

    // 3. Category Match (20%)
    let categoryScore = 0;
    if (shop.category === influencer.category) {
        categoryScore = 20; // Exact category match
    } else {
        // Related categories (simple logic for demo)
        const relatedCategories = {
            'Food': ['Lifestyle', 'Travel'],
            'Fitness': ['Lifestyle', 'Health'],
            'Fashion': ['Beauty', 'Lifestyle'],
            'Beauty': ['Fashion', 'Lifestyle'],
            'Technology': ['Lifestyle'],
            'Lifestyle': ['Food', 'Fashion', 'Beauty', 'Fitness'],
        };

        if (relatedCategories[shop.category]?.includes(influencer.category) ||
            relatedCategories[influencer.category]?.includes(shop.category)) {
            categoryScore = 10; // Related category
        } else {
            categoryScore = 2; // Unrelated but still possible
        }
    }
    breakdown.category = categoryScore;
    totalScore += categoryScore;

    // 4. Engagement Rate (20%)
    let engagementScore = 0;
    if (influencer.engagementRate >= 7) {
        engagementScore = 20; // Excellent engagement
    } else if (influencer.engagementRate >= 5) {
        engagementScore = 15; // Good engagement
    } else if (influencer.engagementRate >= 3) {
        engagementScore = 10; // Average engagement
    } else {
        engagementScore = 5; // Low engagement
    }
    breakdown.engagement = engagementScore;
    totalScore += engagementScore;

    // 5. Verification Bonus (up to 5%)
    if (influencer.verified) {
        totalScore += 5;
        breakdown.verified = 5;
    } else {
        breakdown.verified = 0;
    }

    // Normalize to 100% (max possible is 105)
    const normalizedScore = Math.min(Math.round((totalScore / 105) * 100), 100);

    return {
        score: normalizedScore,
        breakdown: {
            location: Math.round((breakdown.location / 30) * 100),
            budget: Math.round((breakdown.budget / 30) * 100),
            category: Math.round((breakdown.category / 20) * 100),
            engagement: Math.round((breakdown.engagement / 20) * 100),
            verified: breakdown.verified > 0,
        },
        rawBreakdown: breakdown,
    };
}

/**
 * Get recommended influencers for a shop
 * @param {Object} shop - Shop profile
 * @param {Array} allInfluencers - All available influencers
 * @param {number} limit - Maximum number of recommendations
 * @returns {Array} - Sorted list of influencers with match scores
 */
export function getRecommendedInfluencers(shop, allInfluencers, limit = 10) {
    const recommendations = allInfluencers.map(influencer => {
        const matchData = calculateMatchScore(shop, influencer);
        return {
            ...influencer,
            matchScore: matchData.score,
            matchBreakdown: matchData.breakdown,
            rawBreakdown: matchData.rawBreakdown,
        };
    });

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations.slice(0, limit);
}

/**
 * Get recommended shops for an influencer
 * @param {Object} influencer - Influencer profile
 * @param {Array} allShops - All available shops
 * @param {number} limit - Maximum number of recommendations
 * @returns {Array} - Sorted list of shops with match scores
 */
export function getRecommendedShops(influencer, allShops, limit = 10) {
    const recommendations = allShops.map(shop => {
        const matchData = calculateMatchScore(shop, influencer);
        return {
            ...shop,
            matchScore: matchData.score,
            matchBreakdown: matchData.breakdown,
            rawBreakdown: matchData.rawBreakdown,
        };
    });

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations.slice(0, limit);
}

/**
 * Filter influencers based on shop criteria
 * @param {Array} influencers - All influencers
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered influencers
 */
export function filterInfluencers(influencers, filters) {
    return influencers.filter(inf => {
        // City filter
        if (filters.city && filters.city !== 'all' && inf.city !== filters.city) {
            return false;
        }

        // Category filter
        if (filters.category && filters.category !== 'all' && inf.category !== filters.category) {
            return false;
        }

        // Budget filter (price per post should be within budget)
        if (filters.maxBudget && inf.pricePerPost > filters.maxBudget) {
            return false;
        }

        if (filters.minBudget && inf.pricePerPost < filters.minBudget) {
            return false;
        }

        // Min engagement rate filter
        if (filters.minEngagement && inf.engagementRate < filters.minEngagement) {
            return false;
        }

        // Verified only filter
        if (filters.verifiedOnly && !inf.verified) {
            return false;
        }

        return true;
    });
}

/**
 * Filter shops based on influencer criteria
 * @param {Array} shops - All shops
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered shops
 */
export function filterShops(shops, filters) {
    return shops.filter(shop => {
        // City filter
        if (filters.city && filters.city !== 'all' && shop.city !== filters.city) {
            return false;
        }

        // Category filter
        if (filters.category && filters.category !== 'all' && shop.category !== filters.category) {
            return false;
        }

        // Min budget filter (shop should have minimum budget)
        if (filters.minBudget && shop.marketingBudget < filters.minBudget) {
            return false;
        }

        return true;
    });
}

/**
 * Get match score color based on percentage
 * @param {number} score - Match score (0-100)
 * @returns {string} - Color class
 */
export function getScoreColor(score) {
    if (score >= 80) return 'text-success-600'; // Green
    if (score >= 60) return 'text-amber-600'; // Yellow
    return 'text-red-600'; // Red
}

/**
 * Get match score background color
 * @param {number} score - Match score (0-100)
 * @returns {string} - Background color class
 */
export function getScoreBgColor(score) {
    if (score >= 80) return 'bg-success-100'; // Light green
    if (score >= 60) return 'bg-amber-100'; // Light yellow
    return 'bg-red-100'; // Light red
}
