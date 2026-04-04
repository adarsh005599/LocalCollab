// Supabase-backed storage layer
import { supabase } from './supabase';

export const storage = {

    // ─── AUTH ────────────────────────────────────────────────────────────────

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return profile ? { ...user, role: profile.role, name: profile.name } : null;
    },

    logout: async () => {
        await supabase.auth.signOut();
    },

    // ─── INFLUENCERS ─────────────────────────────────────────────────────────

    getInfluencers: async () => {
        const { data } = await supabase
            .from('influencers')
            .select('*')
            .order('created_at', { ascending: false });
        return (data || []).map(mapInfluencer);
    },

    getInfluencerByUserId: async (userId) => {
        const { data } = await supabase
            .from('influencers')
            .select('*')
            .eq('user_id', userId)
            .single();
        return data ? mapInfluencer(data) : null;
    },

    addInfluencer: async (influencer) => {
        const { data, error } = await supabase
            .from('influencers')
            .insert([{
                user_id: influencer.userId,
                name: influencer.name,
                email: influencer.email,
                city: influencer.city,
                area: influencer.area,
                category: influencer.category,
                followers: influencer.followers,
                avg_likes: influencer.avgLikes,
                engagement_rate: influencer.engagementRate,
                price_per_post: influencer.pricePerPost,
                verified: influencer.verified || false,
                bio: influencer.bio,
                profile_image: influencer.profileImage || null,
                instagram: influencer.instagram || null,
                youtube: influencer.youtube || null,
            }])
            .select()
            .single();
        if (error) throw error;
        return mapInfluencer(data);
    },

    updateInfluencer: async (id, updates) => {
        const { error } = await supabase
            .from('influencers')
            .update({
                name: updates.name,
                city: updates.city,
                area: updates.area,
                category: updates.category,
                followers: updates.followers,
                avg_likes: updates.avgLikes,
                engagement_rate: updates.engagementRate,
                price_per_post: updates.pricePerPost,
                bio: updates.bio,
                profile_image: updates.profileImage || null,
                instagram: updates.instagram || null,
                youtube: updates.youtube || null,
            })
            .eq('id', id);
        if (error) throw error;
    },

    // Convert image to compressed base64 data URL (stored directly in DB - no Storage RLS issues)
    uploadProfileImage: async (file, userId) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Resize to max 300x300 to keep DB size small
                    const MAX = 300;
                    const scale = Math.min(MAX / img.width, MAX / img.height, 1);
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(img.width * scale);
                    canvas.height = Math.round(img.height * scale);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    // Compress as JPEG at 80% quality
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // ─── SHOPS ───────────────────────────────────────────────────────────────

    getShops: async () => {
        const { data } = await supabase
            .from('shops')
            .select('*')
            .order('created_at', { ascending: false });
        return (data || []).map(mapShop);
    },

    getShopByUserId: async (userId) => {
        const { data } = await supabase
            .from('shops')
            .select('*')
            .eq('user_id', userId)
            .single();
        return data ? mapShop(data) : null;
    },

    addShop: async (shop) => {
        const { data, error } = await supabase
            .from('shops')
            .insert([{
                user_id: shop.userId,
                business_name: shop.businessName,
                email: shop.email,
                city: shop.city,
                area: shop.area,
                category: shop.category,
                marketing_budget: shop.marketingBudget,
                subscription_status: shop.subscriptionStatus || false,
                description: shop.description,
            }])
            .select()
            .single();
        if (error) throw error;
        return mapShop(data);
    },

    updateShop: async (id, updates) => {
        const { error } = await supabase
            .from('shops')
            .update({
                business_name: updates.businessName,
                city: updates.city,
                area: updates.area,
                category: updates.category,
                marketing_budget: updates.marketingBudget,
                description: updates.description,
            })
            .eq('id', id);
        if (error) throw error;
    },

    // ─── COLLABORATIONS ──────────────────────────────────────────────────────

    getCollaborations: async () => {
        const { data } = await supabase
            .from('collaborations')
            .select('*')
            .order('created_at', { ascending: false });
        return data || [];
    },

    addCollaboration: async (collab) => {
        const { error } = await supabase
            .from('collaborations')
            .insert([{
                shop_id: collab.shopId,
                influencer_id: collab.influencerId,
                status: collab.status || 'pending',
            }]);
        if (error) throw error;
    },

    // ─── MESSAGES ────────────────────────────────────────────────────────────

    getMessages: async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });
        return (data || []).map(mapMessage);
    },

    addMessage: async (message) => {
        const { error } = await supabase
            .from('messages')
            .insert([{
                sender_id: message.senderId,
                receiver_id: message.receiverId,
                text: message.text,
            }]);
        if (error) throw error;
    },

    getConversation: async (userId1, userId2) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order('created_at', { ascending: true });
        return (data || []).map(mapMessage);
    },

    // ─── OFFERS ──────────────────────────────────────────────────────────────

    // Create a new negotiation thread + first offer_message in one go
    createOffer: async ({ shopId, influencerId, initiatedBy, price, message }) => {
        // 1. Create the thread
        const { data: offer, error: offerErr } = await supabase
            .from('offers')
            .insert([{
                shop_id: shopId,
                influencer_id: influencerId,
                initiated_by: initiatedBy,
                status: 'active',
            }])
            .select()
            .single();
        if (offerErr) throw offerErr;

        // 2. Record the first price message
        const { error: msgErr } = await supabase
            .from('offer_messages')
            .insert([{
                offer_id: offer.id,
                sender_role: initiatedBy,
                price: price,
                message: message || null,
            }]);
        if (msgErr) throw msgErr;

        return mapOffer(offer);
    },

    // Get all offers where caller is the shop
    getOffersForShop: async (shopId) => {
        const { data, error } = await supabase
            .from('offers')
            .select(`
                *,
                offer_messages ( id, sender_role, price, message, created_at ),
                influencers ( id, user_id, name, city, category, profile_image )
            `)
            .eq('shop_id', shopId)
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapOfferWithDetails);
    },

    // Get all offers where caller is the influencer
    getOffersForInfluencer: async (influencerId) => {
        const { data, error } = await supabase
            .from('offers')
            .select(`
                *,
                offer_messages ( id, sender_role, price, message, created_at ),
                shops ( id, user_id, business_name, city, category )
            `)
            .eq('influencer_id', influencerId)
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapOfferWithDetails);
    },

    // Returns { [shopId]: { id, status, initiatedBy, latestSenderRole } } for fast per-card lookups
    getOffersMapForInfluencer: async (influencerId) => {
        const { data, error } = await supabase
            .from('offers')
            .select('id, shop_id, status, initiated_by, offer_messages ( sender_role, created_at )')
            .eq('influencer_id', influencerId);
        if (error) throw error;
        const map = {};
        for (const row of data || []) {
            const messages = (row.offer_messages || []).sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
            const latest = messages[messages.length - 1] || null;
            map[row.shop_id] = {
                id: row.id,
                status: row.status,
                initiatedBy: row.initiated_by,
                latestSenderRole: latest?.sender_role || null,
            };
        }
        return map;
    },

    // Get a single offer with full message history (for detail view)
    getOfferById: async (offerId) => {
        const { data, error } = await supabase
            .from('offers')
            .select(`
                *,
                offer_messages ( id, sender_role, price, message, created_at ),
                shops ( id, user_id, business_name, city, category ),
                influencers ( id, user_id, name, city, category, profile_image )
            `)
            .eq('id', offerId)
            .single();
        if (error) throw error;
        return mapOfferWithDetails(data);
    },

    // Get all messages for an offer thread
    getOfferMessages: async (offerId) => {
        const { data, error } = await supabase
            .from('offer_messages')
            .select('*')
            .eq('offer_id', offerId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Add a counter-offer message — RLS blocks if offer not active
    addOfferMessage: async (offerId, senderRole, price, message) => {
        // Front-end guard: fetch current status first
        const { data: offer, error: fetchErr } = await supabase
            .from('offers')
            .select('status')
            .eq('id', offerId)
            .single();
        if (fetchErr) throw fetchErr;
        if (offer.status !== 'active') {
            throw new Error('This negotiation is already closed and cannot accept new offers.');
        }

        const { error } = await supabase
            .from('offer_messages')
            .insert([{
                offer_id: offerId,
                sender_role: senderRole,
                price: price,
                message: message || null,
            }]);
        if (error) throw error;

        // Touch updated_at on the parent offer so ordering stays correct
        const { error: touchErr } = await supabase
            .from('offers')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', offerId);
        // Non-fatal: don't block the caller if the touch fails (e.g. RLS race)
        if (touchErr) console.warn('offer updated_at touch failed:', touchErr.message);
    },

    // Accept or reject an offer — guards against re-closing
    updateOfferStatus: async (offerId, status) => {
        if (!['accepted', 'rejected'].includes(status)) {
            throw new Error('Invalid status. Must be accepted or rejected.');
        }
        // Front-end guard
        const { data: offer, error: fetchErr } = await supabase
            .from('offers')
            .select('status')
            .eq('id', offerId)
            .single();
        if (fetchErr) throw fetchErr;
        if (offer.status !== 'active') {
            throw new Error('This offer is already closed.');
        }

        const { error } = await supabase
            .from('offers')
            .update({ status })
            .eq('id', offerId);
        if (error) throw error;
    },

    // Legacy compat (no-op)
    initializeMockData: () => { },
};

// ─── MAPPERS (snake_case DB → camelCase app) ─────────────────────────────────

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
        profileImage: row.profile_image || null,
        instagram: row.instagram || null,
        youtube: row.youtube || null,
    };
}

function mapShop(row) {
    return {
        id: row.id,
        userId: row.user_id,
        businessName: row.business_name,
        email: row.email,
        city: row.city,
        area: row.area,
        category: row.category,
        marketingBudget: row.marketing_budget,
        subscriptionStatus: row.subscription_status,
        description: row.description,
    };
}

function mapMessage(row) {
    return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        text: row.text,
        timestamp: row.created_at,
    };
}

function mapOffer(row) {
    return {
        id: row.id,
        shopId: row.shop_id,
        influencerId: row.influencer_id,
        status: row.status,
        initiatedBy: row.initiated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapOfferWithDetails(row) {
    const messages = (row.offer_messages || []).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    const latest = messages[messages.length - 1] || null;
    return {
        ...mapOffer(row),
        messages,
        latestPrice: latest ? parseFloat(latest.price) : 0,
        latestSenderRole: latest?.sender_role || null,
        // Joined influencer info (when fetched from shop's perspective)
        influencerName: row.influencers?.name || null,
        influencerCity: row.influencers?.city || null,
        influencerCategory: row.influencers?.category || null,
        influencerImage: row.influencers?.profile_image || null,
        influencerDbId: row.influencers?.id || null,
        influencerUserId: row.influencers?.user_id || null,
        // Joined shop info (when fetched from influencer's perspective)
        shopName: row.shops?.business_name || null,
        shopCity: row.shops?.city || null,
        shopCategory: row.shops?.category || null,
        shopDbId: row.shops?.id || null,
        shopUserId: row.shops?.user_id || null,
    };
}

export const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2);
