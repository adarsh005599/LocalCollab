'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Briefcase, MessageCircle, User, Zap, DollarSign, Users, Handshake } from 'lucide-react';
import { storage } from '@/lib/storage';
import { getRecommendedShops } from '@/lib/matching';
import { formatCurrency, getInitials } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

const C = {
    bg: '#F5F5DC', // Soft Cream
    surface: '#FFFFFF', // White cards
    primary: '#397754', // Emerald Green 
    primaryLight: '#4B9B6E',
    secondary: '#EB6B40', // Vibrant Orange
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
};

const cardStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };

const infNav = [
    { href: '/influencer/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
    { href: '/influencer/opportunities', icon: <Briefcase size={18} />, label: 'Opportunities' },
    { href: '/influencer/offers', icon: <Handshake size={18} />, label: 'Offers' },
    { href: '/influencer/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
    { href: '/influencer/profile', icon: <User size={18} />, label: 'Profile' },
];

export default function InfluencerDashboard() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [influencer, setInfluencer] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [stats, setStats] = useState({ collaborations: 0, pending: 0, earnings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const user = await storage.getCurrentUser();
            if (!user || user.role !== 'influencer') { router.push('/login'); return; }
            setCurrentUser(user);
            const infProfile = await storage.getInfluencerByUserId(user.id);
            if (!infProfile) { router.push('/influencer/profile?setup=true'); return; }
            setInfluencer(infProfile);
            const [allShops, collabs] = await Promise.all([storage.getShops(), storage.getCollaborations()]);
            setRecommendations(getRecommendedShops(infProfile, allShops, 6));
            const myCollabs = collabs.filter(c => c.influencer_id === infProfile.id);
            setStats({ collaborations: myCollabs.length, pending: myCollabs.filter(c => c.status === 'pending').length, earnings: myCollabs.filter(c => c.status === 'accepted').length * (infProfile.pricePerPost || 0) });
            setLoading(false);
        };
        init();
    }, [router]);

    const handleLogout = async () => { await storage.logout(); router.push('/'); };

    const sidebarUser = {
        name: influencer?.name || currentUser?.name || '…',
        subtitle: influencer?.city || '',
        initials: getInitials(influencer?.name || currentUser?.name || ''),
        profileHref: '/influencer/profile',
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={infNav} user={sidebarUser} onLogout={handleLogout} />

            <main style={{ marginLeft: 280, padding: 40 }}>
                {loading ? (
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <div style={{ height: 36, width: 300, background: C.border, borderRadius: 8, marginBottom: 12, animation: 'pulse 2s infinite' }} />
                        <div style={{ height: 20, width: 200, background: C.border, borderRadius: 6, marginBottom: 40, animation: 'pulse 2s infinite' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 40 }}>
                            {[...Array(3)].map((_, i) => <div key={i} style={{ height: 120, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />)}
                        </div>
                        <div style={{ height: 280, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />
                    </div>
                ) : (
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <div style={{ marginBottom: 40 }}>
                            <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Welcome back, {influencer?.name}! 👋</h1>
                            <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>Here&apos;s your creator overview</p>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 40 }}>
                            {[
                                { label: 'Total Collabs', value: stats.collaborations, icon: <Users size={20} color={C.primary} />, bg: 'rgba(57,119,84,0.1)' },
                                { label: 'Pending Offers', value: stats.pending, icon: <Zap size={20} color={C.secondary} />, bg: 'rgba(235,107,64,0.1)' },
                                { label: 'Est. Earnings', value: formatCurrency(stats.earnings), icon: <DollarSign size={20} color="#3B82F6" />, bg: 'rgba(59,130,246,0.1)' },
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
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>Matching Businesses</h2>
                                <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>Brands that fit your niche and location</p>
                            </div>
                            <Link href="/influencer/opportunities" style={{ fontSize: 14, color: C.primary, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All →</Link>
                        </div>

                        {recommendations.length === 0 ? (
                            <div style={{ ...cardStyle, textAlign: 'center', padding: 64 }}>
                                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <Briefcase size={32} color={C.primary} />
                                </div>
                                <h3 style={{ fontSize: 18, color: C.text, fontWeight: 800, margin: '0 0 8px' }}>No businesses available yet</h3>
                                <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>Check back soon as more brands join</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                                {recommendations.map(shop => <ShopCard key={shop.id} shop={shop} />)}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

function ShopCard({ shop }) {
    const initials = getInitials(shop.businessName || '');
    return (
        <div className="card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(57,119,84,0.1)', border: `1px solid rgba(57,119,84,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{initials}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.businessName}</p>
                    <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{shop.city}</p>
                </div>
            </div>

            <span style={{ display: 'inline-block', padding: '4px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 20 }}>{shop.category}</span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <div>
                    <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Budget</p>
                    <p style={{ fontSize: 15, fontWeight: 900, color: C.text, margin: 0 }}>{formatCurrency(shop.marketingBudget)}</p>
                </div>
                <Link href={`/influencer/messages?userId=${shop.userId}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                    <MessageCircle size={14} /> Contact
                </Link>
            </div>
        </div>
    );
}
