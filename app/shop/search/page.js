'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Search, MessageCircle, User, SlidersHorizontal, Handshake, X, DollarSign } from 'lucide-react';
import { storage } from '../../../lib/storage';
import { filterInfluencers, calculateMatchScore } from '../../../lib/matching';
import { formatCurrency, formatNumber, categories, cities, getInitials } from '../../../lib/utils';
import Sidebar from '../../../components/Sidebar';


const C = {
    bg: '#F5F5DC', // Soft Cream
    surface: '#FFFFFF', // White cards
    primary: '#397754', // Emerald Green 
    primaryLight: '#4B9B6E',
    primaryHover: '#2B5A3F',
    secondary: '#EB6B40', // Vibrant Orange
    secondaryHover: '#C1522D',
    secondaryDim: 'rgba(235, 107, 64, 0.1)',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
};

const inputSel = { width: '100%', padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' };

const focusIn = e => e.target.style.borderColor = C.primary;
const focusOut = e => e.target.style.borderColor = C.border;

const shopNav = [
    { href: '/shop/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
    { href: '/shop/search', icon: <Search size={18} />, label: 'Find Influencers' },
    { href: '/shop/offers', icon: <Handshake size={18} />, label: 'Offers' },
    { href: '/shop/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
    { href: '/shop/profile', icon: <User size={18} />, label: 'Profile' },
];


export default function ShopSearchPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [shop, setShop] = useState(null);
    const [allInfluencers, setAllInfluencers] = useState([]);
    const [filteredInfluencers, setFilteredInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ city: 'all', category: 'all', minBudget: 0, maxBudget: 50000, minEngagement: 0, verifiedOnly: false });
    // Offer modal
    const [offerModal, setOfferModal] = useState(null);
    const [offerForm, setOfferForm] = useState({ price: '', message: '' });
    const [offerSubmitting, setOfferSubmitting] = useState(false);
    const [offerSuccess, setOfferSuccess] = useState(false);


    useEffect(() => {
        const init = async () => {
            const user = await storage.getCurrentUser();
            if (!user || user.role !== 'shop') { router.push('/login'); return; }
            setCurrentUser(user);
            const shopProfile = await storage.getShopByUserId(user.id);
            if (!shopProfile) { router.push('/shop/profile?setup=true'); return; }
            setShop(shopProfile);

            // First load using the API
            fetchMatches(shopProfile, filters);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const fetchMatches = async (shopProfile, currentFilters) => {
        setLoading(true);
        try {
            const response = await fetch('/api/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopProfile, filters: currentFilters })
            });
            const result = await response.json();

            if (response.ok) {
                setFilteredInfluencers(result.data || []);
            } else {
                console.error('Match API Error:', result.error);
                setFilteredInfluencers([]);
            }
        } catch (err) {
            console.error('Failed to fetch matches', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (shop) {
            fetchMatches(shop, newFilters);
        }
    };

    const handleLogout = async () => { await storage.logout(); router.push('/'); };

    const openOfferModal = (influencer) => {
        setOfferForm({ price: '', message: '' });
        setOfferSuccess(false);
        setOfferModal({ influencer });
    };

    const handleSubmitOffer = async () => {
        if (!offerForm.price || parseFloat(offerForm.price) <= 0) { alert('Please enter a valid price'); return; }
        setOfferSubmitting(true);
        try {
            await storage.createOffer({
                shopId: shop.id,
                influencerId: offerModal.influencer.id,
                initiatedBy: 'shop',
                price: parseFloat(offerForm.price),
                message: offerForm.message || null,
            });
            setOfferSuccess(true);
            setTimeout(() => setOfferModal(null), 2000);
        } catch (e) { alert('Failed to send offer: ' + e.message); }
        setOfferSubmitting(false);
    };


    const sidebarUser = {
        name: shop?.businessName || '…',
        subtitle: shop?.city || '',
        initials: getInitials(shop?.businessName || currentUser?.name || 'U'),
        profileHref: '/shop/profile',
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={shopNav} user={sidebarUser} onLogout={handleLogout} />

            <main style={{ marginLeft: 280, padding: 40 }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                    {loading ? (
                        <>
                            <div style={{ height: 36, width: 280, background: C.border, borderRadius: 8, marginBottom: 12, animation: 'pulse 2s infinite' }} />
                            <div style={{ height: 20, width: 160, background: C.border, borderRadius: 6, marginBottom: 32, animation: 'pulse 2s infinite' }} />
                            <div style={{ height: 160, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 32, animation: 'pulse 2s infinite' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                                {[...Array(6)].map((_, i) => <div key={i} style={{ height: 280, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />)}
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: 32 }}>
                                <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Find Influencers</h1>
                                <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>{filteredInfluencers.length} creator{filteredInfluencers.length !== 1 ? 's' : ''} found</p>
                            </div>

                            {/* Filters */}
                            <div className="card" style={{ padding: 24, marginBottom: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <SlidersHorizontal size={18} color={C.primary} />
                                    <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Advanced Filters</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
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
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Max Budget (₹)</label>
                                        <input type="number" value={filters.maxBudget} onChange={e => handleFilterChange('maxBudget', parseInt(e.target.value) || 0)} style={inputSel} placeholder="50000" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Min Engagement %</label>
                                        <input type="number" value={filters.minEngagement} onChange={e => handleFilterChange('minEngagement', parseFloat(e.target.value) || 0)} step="0.1" style={inputSel} placeholder="0" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 24, width: 'fit-content' }}>
                                    <input type="checkbox" checked={filters.verifiedOnly} onChange={e => handleFilterChange('verifiedOnly', e.target.checked)} style={{ width: 16, height: 16, accentColor: C.primary }} />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>Verified creators only</span>
                                </label>
                            </div>

                            {filteredInfluencers.length === 0 ? (
                                <div className="card" style={{ padding: 64, textAlign: 'center' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Search size={32} color={C.primary} /></div>
                                    <h3 style={{ fontSize: 18, color: C.text, fontWeight: 800, margin: '0 0 8px' }}>No influencers match your filters</h3>
                                    <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>Try adjusting your search criteria</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                                    {filteredInfluencers.map(inf => (
                                        <InfluencerCard key={inf.id} influencer={inf} onMakeOffer={() => openOfferModal(inf)} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <style>{`input::placeholder { color: #94A3B8; } select option { background: #fff; }`}</style>

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
                                <p style={{ color: C.textMuted, margin: 0 }}>Your offer to <strong>{offerModal.influencer.name}</strong> has been sent. Track it in Offers.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <div>
                                        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>Make an Offer</h3>
                                        <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>to {offerModal.influencer.name}</p>
                                    </div>
                                    <button onClick={() => setOfferModal(null)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted }}><X size={20} /></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Your Offer Price (₹) *</label>
                                        <div style={{ position: 'relative' }}>
                                            <DollarSign size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input type="number" value={offerForm.price} onChange={e => setOfferForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 5000"
                                                style={{ width: '100%', padding: '12px 14px 12px 40px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: C.text }}
                                                onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Message (optional)</label>
                                        <textarea value={offerForm.message} onChange={e => setOfferForm(p => ({ ...p, message: e.target.value }))} rows={3}
                                            placeholder="Describe what you expect from this collaboration..."
                                            style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: C.text, fontFamily: 'inherit' }}
                                            onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                                        <button onClick={handleSubmitOffer} disabled={offerSubmitting || !offerForm.price} className="btn-primary" style={{ flex: 1, opacity: offerSubmitting || !offerForm.price ? 0.7 : 1 }}>
                                            <Handshake size={16} /> {offerSubmitting ? 'Sending...' : 'Send Offer'}
                                        </button>
                                        <button onClick={() => setOfferModal(null)} className="btn-outline" style={{ padding: '12px 20px' }}>Cancel</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfluencerCard({ influencer, onMakeOffer }) {

    const initials = getInitials(influencer.name || '');
    const score = influencer.matchScore;
    const matchColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : C.textMuted;
    const matchBg = score >= 80 ? 'rgba(16,185,129,0.1)' : score >= 60 ? 'rgba(245,158,11,0.1)' : C.bg;

    return (
        <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(57,119,84,0.1)', border: `1px solid rgba(57,119,84,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{initials}</span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>{influencer.name}</p>
                            {influencer.verified && <span style={{ width: 14, height: 14, background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 800 }}>✓</span>}
                        </div>
                        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{influencer.city}</p>
                    </div>
                </div>
                {score > 0 && <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: matchBg, color: matchColor }}>{score}% match</span>}
            </div>

            <span style={{ display: 'inline-block', padding: '4px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 20 }}>{influencer.category}</span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 24 }}>
                {[['Followers', formatNumber(influencer.followers)], ['Engagement', `${influencer.engagementRate}%`], ['Per Post', formatCurrency(influencer.pricePerPost)]].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>{l}</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>{v}</p>
                    </div>
                ))}
            </div>

            <button onClick={onMakeOffer} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                <Handshake size={18} /> Make an Offer
            </button>
        </div>
    );
}
