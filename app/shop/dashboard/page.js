'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TrendingUp, Search, MessageCircle, User, Users, Zap, Handshake, X, DollarSign } from 'lucide-react';
import { storage } from '../../../lib/storage';
import { getRecommendedInfluencers } from '../../../lib/matching';
import { formatCurrency, formatNumber, getInitials } from '../../../lib/utils';
import Sidebar from '../../../components/Sidebar';
import Link from 'next/link';

const C = {
    bg: '#F5F5DC',
    surface: '#FFFFFF',
    primary: '#397754',
    primaryLight: '#4B9B6E',
    primaryHover: '#2B5A3F',
    secondary: '#EB6B40',
    secondaryHover: '#C1522D',
    secondaryDim: 'rgba(235, 107, 64, 0.1)',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
};

const cardStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const focusIn = e => e.target.style.borderColor = C.primary;
const focusOut = e => e.target.style.borderColor = C.border;

const shopNav = [
    { href: '/shop/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
    { href: '/shop/search', icon: <Search size={18} />, label: 'Find Influencers' },
    { href: '/shop/offers', icon: <Handshake size={18} />, label: 'Offers' },
    { href: '/shop/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
    { href: '/shop/profile', icon: <User size={18} />, label: 'Profile' },
];

export default function ShopDashboardPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [shop, setShop] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [stats, setStats] = useState({ collaborations: 0, active: 0 });
    const [loading, setLoading] = useState(true);
    // Offer modal
    const [offerModal, setOfferModal] = useState(null); // { influencer }
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
            const [allInfluencers, collabs] = await Promise.all([storage.getInfluencers(), storage.getCollaborations()]);
            setRecommendations(getRecommendedInfluencers(shopProfile, allInfluencers, 6));
            const myCollabs = collabs.filter(c => c.shop_id === shopProfile.id);
            setStats({ collaborations: myCollabs.length, active: myCollabs.filter(c => c.status === 'accepted').length });
            setLoading(false);
        };
        init();
    }, [router]);

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

    const handleLogout = async () => { await storage.logout(); router.push('/'); };

    const sidebarUser = {
        name: shop?.businessName || currentUser?.name || '…',
        subtitle: shop?.city || '',
        initials: getInitials(shop?.businessName || currentUser?.name || 'U'),
        profileHref: '/shop/profile',
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={shopNav} user={sidebarUser} onLogout={handleLogout} />

            <main style={{ marginLeft: 280, padding: 40 }}>
                {loading ? (
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <div style={{ height: 36, width: 300, background: C.border, borderRadius: 8, marginBottom: 12, animation: 'pulse 2s infinite' }} />
                        <div style={{ height: 20, width: 240, background: C.border, borderRadius: 6, marginBottom: 40, animation: 'pulse 2s infinite' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 40 }}>
                            {[...Array(3)].map((_, i) => <div key={i} style={{ height: 120, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />)}
                        </div>
                        <div style={{ height: 280, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />
                    </div>
                ) : (
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <div style={{ marginBottom: 40 }}>
                            <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Welcome back, {shop?.businessName}! 👋</h1>
                            <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>Here&apos;s what&apos;s happening with your campaigns</p>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 40 }}>
                            {[
                                { label: 'Total Collaborations', value: stats.collaborations, icon: <Users size={20} color={C.primary} />, bg: 'rgba(57,119,84,0.1)' },
                                { label: 'Active Campaigns', value: stats.active, icon: <Zap size={20} color={C.secondary} />, bg: 'rgba(235,107,64,0.1)' },
                                { label: 'Marketing Budget', value: formatCurrency(shop?.marketingBudget || 0), icon: <TrendingUp size={20} color="#3B82F6" />, bg: 'rgba(59,130,246,0.1)' },
                            ].map(s => (
                                <div key={s.label} style={cardStyle} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <p style={{ fontSize: 14, color: C.textMuted, fontWeight: 700, margin: 0 }}>{s.label}</p>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                                    </div>
                                    <p style={{ fontSize: 36, fontWeight: 900, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>Best Matches For You</h2>
                                <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>AI-powered recommendations based on your profile</p>
                            </div>
                            <Link href="/shop/search" style={{ fontSize: 14, color: C.primary, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All →</Link>
                        </div>

                        {recommendations.length === 0 ? (
                            <div style={{ ...cardStyle, textAlign: 'center', padding: 64 }}>
                                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Users size={32} color={C.primary} /></div>
                                <h3 style={{ fontSize: 18, color: C.text, fontWeight: 800, margin: '0 0 8px' }}>No influencers available yet</h3>
                                <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>Check back soon as new creators join the platform.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                                {recommendations.map(inf => (
                                    <InfluencerCard key={inf.id} influencer={inf} onMakeOffer={() => openOfferModal(inf)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
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
                                <p style={{ color: C.textMuted, margin: 0 }}>Your offer to <strong>{offerModal.influencer.name}</strong> has been sent. Track it in Offers.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <div>
                                        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>Make an Offer</h3>
                                        <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>to {offerModal.influencer.name}</p>
                                    </div>
                                    <button onClick={() => setOfferModal(null)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted }}>
                                        <X size={20} />
                                    </button>
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
                                            placeholder="Describe what the creator will do for your business..."
                                            style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: C.text, fontFamily: 'inherit' }}
                                            onFocus={focusIn} onBlur={focusOut} />
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
        </div>
    );
}

function InfluencerCard({ influencer, onMakeOffer }) {
    const initials = influencer.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(57,119,84,0.1)', border: `1px solid rgba(57,119,84,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {influencer.profileImage
                        ? <Image src={influencer.profileImage} alt={influencer.name} width={52} height={52} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                        : <span style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{initials}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{influencer.name}</p>
                    <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{influencer.city}</p>
                </div>
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
