'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Search, MessageCircle, User, Edit2, Check, X, MapPin, Tag, DollarSign, Mail, FileText, Handshake } from 'lucide-react';
import { storage } from '@/lib/storage';
import { formatCurrency, categories, cities, getInitials } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

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

const inputCls = { width: '100%', padding: '14px 16px', background: '#FFFFFF', border: `1px solid #E2E8F0`, borderRadius: 10, color: '#1E293B', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const focusIn = e => e.target.style.borderColor = '#397754';
const focusOut = e => e.target.style.borderColor = '#E2E8F0';

const shopNav = [
    { href: '/shop/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
    { href: '/shop/search', icon: <Search size={18} />, label: 'Find Influencers' },
    { href: '/shop/offers', icon: <Handshake size={18} />, label: 'Offers' },
    { href: '/shop/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
    { href: '/shop/profile', icon: <User size={18} />, label: 'Profile' },
];

function ShopProfilePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSetup = searchParams.get('setup') === 'true';

    const [currentUser, setCurrentUser] = useState(null);
    const [shop, setShop] = useState(null);
    const [isEditing, setIsEditing] = useState(isSetup);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ businessName: '', city: '', area: '', category: '', marketingBudget: 10000, description: '' });

    useEffect(() => {
        const init = async () => {
            const user = await storage.getCurrentUser();
            if (!user || user.role !== 'shop') { router.push('/login'); return; }
            setCurrentUser(user);
            const shopProfile = await storage.getShopByUserId(user.id);
            if (shopProfile) { setShop(shopProfile); setFormData(shopProfile); setIsEditing(false); }
            else if (!isSetup) { setIsEditing(true); }
            setLoading(false);
        };
        init();
    }, [router, isSetup]);

    const handleSave = async () => {
        setSaving(true);
        if (shop) { await storage.updateShop(shop.id, formData); setShop({ ...shop, ...formData }); }
        else { const newShop = await storage.addShop({ userId: currentUser.id, email: currentUser.email, subscriptionStatus: false, ...formData }); setShop(newShop); }
        setSaving(false); setIsEditing(false);
        if (isSetup) router.push('/shop/dashboard');
    };

    const handleLogout = async () => { await storage.logout(); router.push('/'); };

    const shopName = shop?.businessName || currentUser?.name || 'My Shop';
    const initials = getInitials(shopName);
    const sidebarUser = { name: shopName, subtitle: shop?.city || '', initials, profileHref: '/shop/profile' };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={shopNav} user={sidebarUser} onLogout={handleLogout} />

            <main style={{ marginLeft: 280, padding: 40 }}>
                {loading ? (
                    <div style={{ maxWidth: 640, margin: '0 auto' }}>
                        <div style={{ height: 36, width: 280, background: C.border, borderRadius: 8, marginBottom: 32, animation: 'pulse 2s infinite' }} />
                        <div style={{ height: 600, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />
                    </div>
                ) : (
                    <div style={{ maxWidth: 640, margin: '0 auto' }}>
                        {isSetup ? (
                            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(57,119,84,0.1)', borderRadius: 20, fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 16 }}>👋 Almost there!</div>
                                <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Set up your business profile</h1>
                                <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>Help influencers understand your brand</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>Business Profile</h1>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: C.primary, background: 'rgba(57,119,84,0.1)', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
                                <div style={{ width: 72, height: 72, borderRadius: 16, background: 'rgba(57,119,84,0.1)', border: `1px solid rgba(57,119,84,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: 26, fontWeight: 900, color: C.primary }}>{initials}</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>{shopName}</p>
                                    {!isEditing && <p style={{ fontSize: 15, color: C.textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {currentUser?.email}</p>}
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Business Name</label>
                                        <input value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} style={inputCls} placeholder="Your business name" onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>City</label>
                                            <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ ...inputCls, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                                                <option value="">Select city</option>
                                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Area / Locality</label>
                                            <input value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} style={inputCls} placeholder="Your area" onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Category</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ ...inputCls, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                                                <option value="">Select category</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Monthly Budget (₹)</label>
                                            <input type="number" value={formData.marketingBudget} onChange={e => setFormData({ ...formData, marketingBudget: parseInt(e.target.value) || 0 })} style={inputCls} onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Business Description</label>
                                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={5} style={{ ...inputCls, resize: 'vertical', minHeight: 140 }} placeholder="Tell influencers about your business..." onFocus={focusIn} onBlur={focusOut} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, paddingTop: 12 }}>
                                        <button onClick={handleSave} className="btn-primary" disabled={saving || !formData.businessName || !formData.city || !formData.category} style={{ opacity: saving || !formData.businessName || !formData.city || !formData.category ? 0.6 : 1, width: '100%' }}>
                                            {saving ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Check size={18} />}
                                            {saving ? 'Saving...' : 'Save Profile'}
                                        </button>
                                        {!isSetup && <button onClick={() => { setFormData(shop); setIsEditing(false); }} className="btn-outline" style={{ width: '100%' }}><X size={18} /> Cancel</button>}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {[
                                        { label: 'Location', icon: <MapPin size={18} />, value: `${shop?.city}${shop?.area ? `, ${shop.area}` : ''}` },
                                        { label: 'Category', icon: <Tag size={18} />, value: shop?.category, badge: true },
                                        { label: 'Budget', icon: <DollarSign size={18} />, value: formatCurrency(shop?.marketingBudget || 0) },
                                        { label: 'Email', icon: <Mail size={18} />, value: currentUser?.email },
                                    ].map(({ label, icon, value, badge }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: `1px solid ${C.border}` }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>
                                                {icon}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>{label}</span>
                                                {badge
                                                    ? <span style={{ padding: '4px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 13, fontWeight: 700, color: C.text, display: 'inline-block', width: 'fit-content' }}>{value}</span>
                                                    : <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{value}</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {shop?.description && (
                                        <div style={{ paddingTop: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                <FileText size={18} color={C.primary} />
                                                <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>About</p>
                                            </div>
                                            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.8, margin: 0, padding: 20, background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>{shop.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
            <style>{`input::placeholder, textarea::placeholder { color: #94A3B8; } select option { background: #fff; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function ShopProfilePage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F5F5DC' }} />}>
            <ShopProfilePageInner />
        </Suspense>
    );
}