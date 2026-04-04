import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateMatchScore } from '@/lib/matching';

export async function POST(request) {
    try {
        const { shopProfile, filters } = await request.json();

        if (!shopProfile) {
            return NextResponse.json({ error: 'Shop profile missing' }, { status: 400 });
        }

        // 1. Build the Supabase query with filters at the database level!
        let query = supabase.from('influencers').select('*');

        // Apply filters directly to DB (saves massive networking/memory overhead)
        if (filters.city && filters.city !== 'all') {
            query = query.eq('city', filters.city);
        }
        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }
        if (filters.verifiedOnly) {
            query = query.eq('verified', true);
        }

        // 2. Execute query
        const { data: influencers, error } = await query;
        if (error) throw error;

        // 3. Post-process: Filter by Budget and Engagement
        let filteredInfls = influencers.filter(inf => {
            const infMapped = mapInfluencer(inf);
            if (filters.maxBudget && infMapped.pricePerPost > filters.maxBudget) return false;
            if (filters.minBudget && infMapped.pricePerPost < filters.minBudget) return false;
            if (filters.minEngagement && infMapped.engagementRate < filters.minEngagement) return false;
            return true;
        });

        // 4. Run AI Matcher on the server-side
        const results = filteredInfls.map(inf => {
            const infMapped = mapInfluencer(inf);
            const matchData = calculateMatchScore(shopProfile, infMapped);
            return {
                ...infMapped,
                matchScore: matchData.score,
                matchBreakdown: matchData.breakdown
            };
        }).sort((a, b) => b.matchScore - a.matchScore);

        // 5. Paginate/Limit the final network payload
        const limit = filters.limit || 20;
        const page = filters.page || 1;
        const start = (page - 1) * limit;
        const pagedResults = results.slice(start, start + limit);

        return NextResponse.json({ 
            data: pagedResults, 
            total: results.length,
            page,
            hasMore: start + limit < results.length
        });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Keep the mapper isolated 
function mapInfluencer(row) {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        city: row.city,
        area: row.area,
        category: row.category,
        followers: row.followers,
        avgLikes: row.avg_likes,
        engagementRate: parseFloat(row.engagement_rate),
        pricePerPost: row.price_per_post,
        verified: row.verified,
        bio: row.bio,
    };
}
