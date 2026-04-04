'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TrendingUp, Search, MessageCircle, User, Handshake, ChevronDown, ChevronUp, Check, X, RefreshCw } from 'lucide-react';
import { storage } from '../../../lib/storage';
import { formatCurrency, getInitials, formatTime } from '../../../lib/utils';
import Sidebar from '../../../components/Sidebar';
import SecureDealModal from '../../../components/SecureDealModal';

const C = {
    bg: '#F5F5DC',
    surface: '#FFFFFF',
    primary: '#397754',
    secondary: '#EB6B40',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
};

const shopNav = [
    { href: '/shop/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
    { href: '/shop/search', icon: <Search size={18} />, label: 'Find Influencers' },
    { href: '/shop/offers', icon: <Handshake size={18} />, label: 'Offers' },
    { href: '/shop/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
    { href: '/shop/profile', icon: <User size={18} />, label: 'Profile' },
];

const statusColors = {
    active: { text: '#B45309', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)' },
    accepted: { text: '#065F46', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    rejected: { text: '#991B1B', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
};

export default function ShopOffersPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [shop, setShop] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOffer, setExpandedOffer] = useState(null);
    const [counterState, setCounterState] = useState({}); // { [offerId]: { price, message, open, saving } }
    const [actionLoading, setActionLoading] = useState(null);
    const [modalOffer, setModalOffer] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const user = await storage.getCurrentUser();
                if (!user || user.role !== 'shop') { router.push('/login'); return; }
                setCurrentUser(user);
                const shopProfile = await storage.getShopByUserId(user.id);
                if (!shopProfile) { router.push('/shop/profile?setup=true'); return; }
                setShop(shopProfile);
                const data = await storage.getOffersForShop(shopProfile.id);
                setOffers(data);
            } catch (e) {
                console.error('ShopOffersPage init error:', e);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    const reload = async () => {
        try {
            const data = await storage.getOffersForShop(shop.id);
            setOffers(data);
        } catch (e) {
            console.error('ShopOffersPage reload error:', e);
        }
    };

    const handleStatusUpdate = async (offerId, status) => {
        setActionLoading(offerId + status);
        try {
            await storage.updateOfferStatus(offerId, status);
            await reload();
        } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    const handleCounter = async (offerId) => {
        const s = counterState[offerId];
        if (!s?.price || parseFloat(s.price) <= 0) { alert('Enter a valid price'); return; }
        setCounterState(prev => ({ ...prev, [offerId]: { ...prev[offerId], saving: true } }));
        try {
            await storage.addOfferMessage(offerId, 'shop', parseFloat(s.price), s.message || '');
            await reload();
            setCounterState(prev => ({ ...prev, [offerId]: { price: '', message: '', open: false, saving: false } }));
        } catch (e) {
            alert(e.message);
            setCounterState(prev => ({ ...prev, [offerId]: { ...prev[offerId], saving: false } }));
        }
    };

    const handleLogout = async () => { await storage.logout(); router.push('/'); };
    const shopName = shop?.businessName || currentUser?.name || 'My Shop';
    const sidebarUser = { name: shopName, subtitle: shop?.city || '', initials: getInitials(shopName), profileHref: '/shop/profile' };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={shopNav} user={sidebarUser} onLogout={handleLogout} />
            <main style={{ marginLeft: 280, padding: 40 }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {loading ? (
                        <>
                            <div style={{ height: 36, width: 200, background: C.border, borderRadius: 8, marginBottom: 12, animation: 'pulse 2s infinite' }} />
                            {[...Array(3)].map((_, i) => <div key={i} style={{ height: 120, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 16, animation: 'pulse 2s infinite' }} />)}
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                                <div>
                                    <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Offers</h1>
                                    <p style={{ fontSize: 15, color: C.textMuted, margin: 0 }}>{offers.length} negotiation{offers.length !== 1 ? 's' : ''}</p>
                                </div>
                                <button onClick={reload} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(57,119,84,0.08)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.primary }}>
                                    <RefreshCw size={14} /> Refresh
                                </button>
                            </div>

                            {offers.length === 0 ? (
                                <div className="card" style={{ padding: 64, textAlign: 'center' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <Handshake size={32} color={C.primary} />
                                    </div>
                                    <h3 style={{ fontSize: 18, color: C.text, fontWeight: 800, margin: '0 0 8px' }}>No offers yet</h3>
                                    <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>Offers from influencers or ones you send will appear here</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {offers.map(offer => {
                                        const sc = statusColors[offer.status];
                                        const isExpanded = expandedOffer === offer.id;
                                        const cs = counterState[offer.id] || {};
                                        const isActive = offer.status === 'active';
                                        // Show actions only when it's the shop's turn (influencer sent the last message)
                                        const isMyTurn = isActive && offer.latestSenderRole === 'influencer';
                                        const inf = { name: offer.influencerName, city: offer.influencerCity, category: offer.influencerCategory, image: offer.influencerImage };

                                        return (
                                            <div key={offer.id} className="card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                                                {/* Card header */}
                                                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    {/* Avatar */}
                                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(57,119,84,0.1)', border: '1px solid rgba(57,119,84,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                        {inf.image
                                                            ? <Image src={inf.image} alt={inf.name} width={48} height={48} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                                                            : <span style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>{getInitials(inf.name || '')}</span>}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.name || 'Influencer'}</p>
                                                        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{inf.city} · {inf.category}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Latest Price</p>
                                                            <p style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: 0 }}>{formatCurrency(offer.latestPrice)}</p>
                                                        </div>
                                                        <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, color: sc.text, background: sc.bg, border: `1px solid ${sc.border}`, textTransform: 'capitalize' }}>{offer.status}</span>
                                                        <button onClick={() => setExpandedOffer(isExpanded ? null : offer.id)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted }}>
                                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded thread */}
                                                {isExpanded && (
                                                    <div style={{ borderTop: `1px solid ${C.border}` }}>
                                                        {/* Chat history */}
                                                        <div style={{ padding: '20px 24px', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
                                                            {offer.messages.map((msg, i) => {
                                                                const isShop = msg.sender_role === 'shop';
                                                                return (
                                                                    <div key={i} style={{ display: 'flex', justifyContent: isShop ? 'flex-end' : 'flex-start' }}>
                                                                        <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: isShop ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isShop ? C.primary : C.surface, border: isShop ? 'none' : `1px solid ${C.border}`, boxShadow: isShop ? '0 4px 12px rgba(57,119,84,0.2)' : '0 2px 4px rgba(0,0,0,0.04)' }}>
                                                                            <p style={{ fontSize: 11, fontWeight: 700, color: isShop ? 'rgba(255,255,255,0.7)' : C.textMuted, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isShop ? 'You' : inf.name} · {formatTime(msg.created_at)}</p>
                                                                            <p style={{ fontSize: 18, fontWeight: 900, color: isShop ? '#fff' : C.primary, margin: '0 0 4px' }}>{formatCurrency(parseFloat(msg.price))}</p>
                                                                            {msg.message && <p style={{ fontSize: 13, color: isShop ? 'rgba(255,255,255,0.85)' : C.textMuted, margin: 0, lineHeight: 1.5 }}>{msg.message}</p>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Actions */}
                                                        {isMyTurn && (
                                                            <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, background: C.surface }}>
                                                                {!cs.open ? (
                                                                    <div style={{ display: 'flex', gap: 12 }}>
                                                                        <button onClick={() => setModalOffer(offer)} disabled={actionLoading === offer.id + 'accepted'} className="btn-primary" style={{ flex: 1, opacity: actionLoading ? 0.7 : 1 }}>
                                                                            <Check size={16} /> Accept
                                                                        </button>
                                                                        <button onClick={() => handleStatusUpdate(offer.id, 'rejected')} disabled={actionLoading === offer.id + 'rejected'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#DC2626' }}>
                                                                            <X size={16} /> Reject
                                                                        </button>
                                                                        <button onClick={() => setCounterState(prev => ({ ...prev, [offer.id]: { ...prev[offer.id], open: true } }))} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: 'rgba(235,107,64,0.08)', border: '1px solid rgba(235,107,64,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.secondary }}>
                                                                            <RefreshCw size={16} /> Counter
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                                            <div>
                                                                                <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>Your Counter Price (₹) *</label>
                                                                                <input type="number" value={cs.price || ''} onChange={e => setCounterState(prev => ({ ...prev, [offer.id]: { ...prev[offer.id], price: e.target.value } }))} placeholder="e.g. 4500" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                                                                            </div>
                                                                            <div>
                                                                                <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>Message (optional)</label>
                                                                                <input value={cs.message || ''} onChange={e => setCounterState(prev => ({ ...prev, [offer.id]: { ...prev[offer.id], message: e.target.value } }))} placeholder="Quick note..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: 10 }}>
                                                                            <button onClick={() => handleCounter(offer.id)} disabled={cs.saving} className="btn-primary" style={{ flex: 1 }}>
                                                                                {cs.saving ? 'Sending...' : 'Send Counter Offer'}
                                                                            </button>
                                                                            <button onClick={() => setCounterState(prev => ({ ...prev, [offer.id]: { open: false } }))} className="btn-outline" style={{ padding: '10px 20px' }}>Cancel</button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {isActive && !isMyTurn && (
                                                            <div style={{ padding: '14px 24px', background: 'rgba(57,119,84,0.05)', borderTop: `1px solid ${C.border}` }}>
                                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.textMuted, textAlign: 'center' }}>
                                                                    ⏳ Waiting for the influencer to respond...
                                                                </p>
                                                            </div>
                                                        )}
                                                        {!isActive && (
                                                            <div style={{ padding: '14px 24px', background: sc.bg, borderTop: `1px solid ${sc.border}` }}>
                                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: sc.text, textAlign: 'center' }}>
                                                                    {offer.status === 'accepted' ? '🎉 Deal accepted! Reach out via Messages to get started.' : '❌ This offer has been rejected.'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            
            <SecureDealModal 
                isOpen={!!modalOffer}
                onClose={() => setModalOffer(null)}
                onSuccess={(action) => {
                    if (modalOffer) {
                        handleStatusUpdate(modalOffer.id, 'accepted');
                        if (action === 'chat' && modalOffer.influencerUserId) {
                            router.push('/shop/messages?userId=' + modalOffer.influencerUserId);
                        }
                    }
                }}
                influencerName={modalOffer?.influencerName || 'Influencer'}
                influencerWallet="ALGORAND_WALLET_ADDRESS" 
                amount={modalOffer?.latestPrice || 0}
                contractAddress="123456" 
                contractABI={{ 
                  "name": "MilestoneEscrow", 
                  "methods": [ 
                    { "name": "initializeDeposit", "args": [ { "type": "pay", "name": "payTxn" } ], "returns": { "type": "void" } }
                  ] 
                }}
            />
        </div>
    );
}
