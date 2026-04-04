'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Briefcase, MessageCircle, User, SlidersHorizontal, Handshake, X, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react';
import { storage } from '../../../lib/storage';
import { filterShops, calculateMatchScore } from '../../../lib/matching';
import { formatCurrency, categories, cities, getInitials } from '../../../lib/utils';
import Sidebar from '../../../components/Sidebar';

const C = {
    bg: '#F5F5DC',
    surface: '#FFFFFF',
    primary: '#397754',
    primaryLight: '#4B9B6E',
    secondary: '#EB6B40',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
};

const inputSel = { width: '100%', padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' };
const focusIn = e => e.target.style.borderColor = C.primary;
const focusOut = e => e.target.style.borderColor = C.border;

// ─── Profile Completion ───────────────────────────────────────────────────────

function calcProfileCompletion(inf) {
    if (!inf) return 0;
    const fields = [
        inf.profileImage,
        inf.bio,
        inf.instagram,
        inf.youtube,
        inf.category,
        inf.followers,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
}

// ─── Offer Status Helpers ─────────────────────────────────────────────────────

function getOfferBadge(offer) {
    if (!offer) return null;
    if (offer.status === 'accepted') return { label: 'Accepted', color: '#10B981', bg: 'rgba(16,185,129,0.1)', emoji: '🟢' };
    if (offer.status === 'rejected') return { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', emoji: '🔴' };
    if (offer.latestSenderRole === 'shop') return { label: 'Counter Received', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', emoji: '🔵' };
    return { label: 'Offer Sent', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', emoji: '🟡' };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InfluencerOpportunitiesPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [influencer, setInfluencer] = useState(null);
    const [allShops, setAllShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [offersMap, setOffersMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ city: 'all', category: 'all', minBudget: 0 });

    // Offer modal state
    const [offerModal, setOfferModal] = useState(null);
    const [offerForm, setOfferForm] = useState({ price: '', message: '' });
    const [offerSubmitting, setOfferSubmitting] = useState(false);
    const [offerSuccess, setOfferSuccess] = useState(false);

    useEffect(() => {
        const init = async () => {
            const user = await storage.getCurrentUser();
            if (!user || user.role !== 'influencer') { router.push('/login'); return; }
            setCurrentUser(user);
            const infProfile = await storage.getInfluencerByUserId(user.id);
            if (!infProfile) { router.push('/influencer/profile?setup=true'); return; }
            setInfluencer(infProfile);

            const [shops, map] = await Promise.all([
                storage.getShops(),
                storage.getOffersMapForInfluencer(infProfile.id),
            ]);
            setAllShops(shops);
            setOffersMap(map);
            applyFilters(shops, filters, infProfile);
            setLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const applyFilters = (shops, currentFilters, infProfile) => {
        let results = filterShops(shops, currentFilters);
        results = results.map(shop => {
            const matchData = calculateMatchScore(shop, infProfile);
            return { ...shop, matchScore: matchData.score };
        }).sort((a, b) => b.matchScore - a.matchScore);
        setFilteredShops(results);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(allShops, newFilters, influencer);
    };

    const openOfferModal = (shop) => {
        const existing = offersMap[shop.id];
        // Section 7 – Prevent duplicates: redirect if any offer already exists
        if (existing) {
            router.push('/influencer/offers');
            return;
        }
        setOfferForm({ price: '', message: '' });
        setOfferSuccess(false);
        setOfferModal({ shop });
    };

    const handleSubmitOffer = async () => {
        if (!offerForm.price || parseFloat(offerForm.price) <= 0) { alert('Please enter a valid price'); return; }
        setOfferSubmitting(true);
        try {
            await storage.createOffer({
                shopId: offerModal.shop.id,
                influencerId: influencer.id,
                initiatedBy: 'influencer',
                price: parseFloat(offerForm.price),
                message: offerForm.message || null,
            });
            // Update local map so card state refreshes immediately
            setOffersMap(prev => ({
                ...prev,
                [offerModal.shop.id]: { status: 'active', initiatedBy: 'influencer', latestSenderRole: 'influencer' }
            }));
            setOfferSuccess(true);
            setTimeout(() => setOfferModal(null), 2000);
        } catch (e) { alert('Failed to send offer: ' + e.message); }
        setOfferSubmitting(false);
    };

    const handleLogout = async () => { await storage.logout(); router.push('/'); };

    // Active offer count for badge
    const activeOfferCount = Object.values(offersMap).filter(o => o.status === 'active').length;

    const infNav = [
        { href: '/influencer/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
        { href: '/influencer/opportunities', icon: <Briefcase size={18} />, label: 'Opportunities' },
        { href: '/influencer/offers', icon: <Handshake size={18} />, label: 'Offers', badge: activeOfferCount },
        { href: '/influencer/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
        { href: '/influencer/profile', icon: <User size={18} />, label: 'Profile' },
    ];

    const sidebarUser = {
        name: influencer?.name || currentUser?.name || '…',
        subtitle: influencer?.city || '',
        initials: getInitials(influencer?.name || currentUser?.name || ''),
        profileImage: influencer?.profileImage || null,
        profileHref: '/influencer/profile',
    };

    const profilePct = calcProfileCompletion(influencer);
    const pctColor = profilePct >= 80 ? '#10B981' : profilePct >= 60 ? '#F59E0B' : '#EF4444';

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={infNav} user={sidebarUser} onLogout={handleLogout} />

            <main style={{ marginLeft: 280, padding: 40 }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    {loading ? (
                        <>
                            <div style={{ height: 36, width: 280, background: C.border, borderRadius: 8, marginBottom: 12, animation: 'pulse 2s infinite' }} />
                            <div style={{ height: 20, width: 160, background: C.border, borderRadius: 6, marginBottom: 32, animation: 'pulse 2s infinite' }} />
                            <div style={{ height: 160, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 32, animation: 'pulse 2s infinite' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                                {[...Array(6)].map((_, i) => <div key={i} style={{ height: 220, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />)}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Header row with Profile Completion widget */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                                <div>
                                    <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Opportunities</h1>
                                    <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>{filteredShops.length} business{filteredShops.length !== 1 ? 'es' : ''} found</p>
                                </div>

                                {/* Section 2 — Profile Completion Widget */}
                                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 18px', minWidth: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Profile</p>
                                        <span style={{ fontSize: 14, fontWeight: 900, color: pctColor }}>{profilePct}%</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div style={{ height: 6, background: C.border, borderRadius: 3, marginBottom: 10 }}>
                                        <div style={{ height: '100%', width: `${profilePct}%`, background: pctColor, borderRadius: 3, transition: 'width 0.5s' }} />
                                    </div>
                                    {profilePct < 100 && (
                                        <a href="/influencer/profile" style={{ fontSize: 12, fontWeight: 700, color: C.primary, textDecoration: 'none' }}>
                                            Complete Profile →
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <SlidersHorizontal size={18} color={C.primary} />
                                    <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Filters</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                                    {[
                                        { label: 'City', key: 'city', opts: [['all', 'All Cities'], ...cities.map(c => [c, c])] },
                                        { label: 'Category', key: 'category', opts: [['all', 'All Categories'], ...categories.map(c => [c, c])] },
                                    ].map(({ label, key, opts }) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>{label}</label>
                                            <select value={filters[key]} onChange={e => handleFilterChange(key, e.target.value)} style={inputSel} onFocus={focusIn} onBlur={focusOut}>
                                                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Min Budget (₹)</label>
                                        <input type="number" value={filters.minBudget} onChange={e => handleFilterChange('minBudget', parseInt(e.target.value) || 0)} style={inputSel} placeholder="0" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                </div>
                            </div>

                            {filteredShops.length === 0 ? (
                                <div className="card" style={{ padding: 64, textAlign: 'center' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <Briefcase size={32} color={C.primary} />
                                    </div>
                                    <h3 style={{ fontSize: 18, color: C.text, fontWeight: 800, margin: '0 0 8px' }}>No businesses match your filters</h3>
                                    <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>Try adjusting your filters</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                                    {filteredShops.map(shop => (
                                        <ShopCard
                                            key={shop.id}
                                            shop={shop}
                                            offer={offersMap[shop.id] || null}
                                            onMakeOffer={() => openOfferModal(shop)}
                                            onViewOffer={() => router.push('/influencer/offers')}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Make an Offer Modal */}
            {offerModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
                    <div style={{ background: C.surface, borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        {offerSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <span style={{ fontSize: 32 }}>🎉</span>
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>Offer Sent!</h3>
                                <p style={{ color: C.textMuted, margin: 0 }}>Your offer to <strong>{offerModal.shop.businessName}</strong> has been sent. Track it in Offers.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>Make an Offer</h3>
                                        <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>to {offerModal.shop.businessName}</p>
                                    </div>
                                    <button onClick={() => setOfferModal(null)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Section 4 — Budget context */}
                                <div style={{ background: 'rgba(57,119,84,0.06)', border: `1px solid rgba(57,119,84,0.15)`, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                                    <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 4px', fontWeight: 600 }}>Opportunity Budget</p>
                                    <p style={{ fontSize: 18, fontWeight: 900, color: C.primary, margin: '0 0 4px' }}>{formatCurrency(offerModal.shop.marketingBudget)}</p>
                                    <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
                                        Suggested range: {formatCurrency(Math.round(offerModal.shop.marketingBudget * 0.7))} – {formatCurrency(offerModal.shop.marketingBudget)}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Your Price (₹) *</label>
                                        <div style={{ position: 'relative' }}>
                                            <DollarSign size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input
                                                type="number"
                                                value={offerForm.price}
                                                onChange={e => setOfferForm(p => ({ ...p, price: e.target.value }))}
                                                placeholder="e.g. 5000"
                                                style={{ width: '100%', padding: '12px 14px 12px 40px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: C.text }}
                                                onFocus={focusIn} onBlur={focusOut}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Message (optional)</label>
                                        <textarea
                                            value={offerForm.message}
                                            onChange={e => setOfferForm(p => ({ ...p, message: e.target.value }))}
                                            rows={3}
                                            placeholder="Tell the business what you'll deliver..."
                                            style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: C.text, fontFamily: 'inherit' }}
                                            onFocus={focusIn} onBlur={focusOut}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                                        <button onClick={handleSubmitOffer} disabled={offerSubmitting || !offerForm.price} className="btn-primary" style={{ flex: 1, opacity: offerSubmitting || !offerForm.price ? 0.7 : 1 }}>
                                            <Handshake size={16} />
                                            {offerSubmitting ? 'Sending...' : 'Send Offer'}
                                        </button>
                                        <button onClick={() => setOfferModal(null)} className="btn-outline" style={{ padding: '12px 20px' }}>Cancel</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`input::placeholder, textarea::placeholder { color: #94A3B8; } select option { background: #fff; }`}</style>
        </div>
    );
}

// ─── Shop Card ────────────────────────────────────────────────────────────────

function ShopCard({ shop, offer, onMakeOffer, onViewOffer }) {
    const initials = getInitials(shop.businessName || '');
    const score = shop.matchScore;
    const matchColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#64748B';
    const matchBg = score >= 80 ? 'rgba(16,185,129,0.1)' : score >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)';
    const badge = getOfferBadge(offer);

    // Section 3.1 — Button state logic
    let actionBtn;
    if (!offer) {
        actionBtn = (
            <button onClick={onMakeOffer} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                <Handshake size={14} /> Make an Offer
            </button>
        );
    } else if (offer.status === 'accepted') {
        actionBtn = (
            <button disabled style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} /> Deal Accepted
            </button>
        );
    } else if (offer.status === 'rejected') {
        actionBtn = (
            <button disabled style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={14} /> Offer Rejected
            </button>
        );
    } else {
        // active offer
        actionBtn = (
            <button onClick={onViewOffer} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: 'rgba(57,119,84,0.08)', color: C.primary, border: `1px solid rgba(57,119,84,0.3)`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={14} /> View Offer
            </button>
        );
    }

    return (
        <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(57,119,84,0.1)', border: `1px solid rgba(57,119,84,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{initials}</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{shop.businessName}</p>
                        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{shop.city}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    {score > 0 && <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: matchBg, color: matchColor }}>{score}% match</span>}
                    {/* Section 3.2 — Negotiation status badge */}
                    {badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                            {badge.emoji} {badge.label}
                        </span>
                    )}
                </div>
            </div>

            <span style={{ display: 'inline-block', padding: '4px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 16 }}>{shop.category}</span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <div>
                    <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Budget</p>
                    <p style={{ fontSize: 15, fontWeight: 900, color: C.text, margin: 0 }}>{formatCurrency(shop.marketingBudget)}</p>
                </div>
                {actionBtn}
            </div>
        </div>
    );
}
