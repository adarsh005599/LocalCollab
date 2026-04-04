'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Briefcase, MessageCircle, User, Edit2, Check, X, MapPin, Tag, DollarSign, Mail, Users, FileText, BarChart2, Instagram, Youtube, Camera, Handshake } from 'lucide-react';
import { storage } from '../../../lib/storage';
import { formatCurrency, formatNumber, categories, cities, getInitials } from '../../../lib/utils';
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

const inputCls = { width: '100%', padding: '12px 14px 12px 40px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const inputClsPlain = { width: '100%', padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const focusIn = e => e.target.style.borderColor = C.primary;
const focusOut = e => e.target.style.borderColor = C.border;

const infNav = [
    { href: '/influencer/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
    { href: '/influencer/opportunities', icon: <Briefcase size={18} />, label: 'Opportunities' },
    { href: '/influencer/offers', icon: <Handshake size={18} />, label: 'Offers' },
    { href: '/influencer/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
    { href: '/influencer/profile', icon: <User size={18} />, label: 'Profile' },
];

function InfluencerProfilePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSetup = searchParams.get('setup') === 'true';
    const fileInputRef = useRef(null);

    const [currentUser, setCurrentUser] = useState(null);
    const [influencer, setInfluencer] = useState(null);
    const [isEditing, setIsEditing] = useState(isSetup);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '', city: '', area: '', category: '',
        followers: 5000, avgLikes: 300, pricePerPost: 3000,
        bio: '', profileImage: null, instagram: '', youtube: '',
    });

    useEffect(() => {
        const init = async () => {
            const user = await storage.getCurrentUser();
            if (!user || user.role !== 'influencer') { router.push('/login'); return; }
            setCurrentUser(user);
            const infProfile = await storage.getInfluencerByUserId(user.id);
            if (infProfile) { setInfluencer(infProfile); setFormData(infProfile); setIsEditing(false); }
            else if (!isSetup) setIsEditing(true);
            setLoading(false);
        };
        init();
    }, [router, isSetup]);

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const url = await storage.uploadProfileImage(file, currentUser.id);
            setFormData(prev => ({ ...prev, profileImage: url }));
        } catch (err) {
            alert('Image upload failed: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const engagementRate = ((formData.avgLikes / formData.followers) * 100).toFixed(1);
            if (influencer) {
                const updates = { ...formData, engagementRate: parseFloat(engagementRate) };
                await storage.updateInfluencer(influencer.id, updates);
                setInfluencer({ ...influencer, ...updates });
            } else {
                const newInfluencer = await storage.addInfluencer({
                    userId: currentUser.id,
                    email: currentUser.email,
                    verified: false,
                    engagementRate: parseFloat(engagementRate),
                    ...formData,
                });
                setInfluencer(newInfluencer);
            }
            setIsEditing(false);
            if (isSetup) router.push('/influencer/dashboard');
        } catch (err) {
            alert('Failed to save profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => { await storage.logout(); router.push('/'); };

    const infName = influencer?.name || currentUser?.name || 'Creator';
    const initials = getInitials(infName);
    const avatarImage = isEditing ? formData.profileImage : (influencer?.profileImage || formData.profileImage);
    const sidebarUser = { name: infName, subtitle: influencer?.city || '', initials, profileImage: influencer?.profileImage || null, profileHref: '/influencer/profile' };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={infNav} user={sidebarUser} onLogout={handleLogout} />

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
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(57,119,84,0.1)', borderRadius: 20, fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 16 }}>✨ Creator setup</div>
                                <h1 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Set up your creator profile</h1>
                                <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>Help businesses discover you</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>Creator Profile</h1>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: C.primary, background: 'rgba(57,119,84,0.1)', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="card" style={{ padding: 32 }}>
                            {/* Avatar / Profile Image */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    {avatarImage ? (
                                        <Image
                                            src={avatarImage}
                                            alt="Profile"
                                            width={80}
                                            height={80}
                                            style={{ borderRadius: 16, objectFit: 'cover', border: `2px solid ${C.border}` }}
                                        />
                                    ) : (
                                        <div style={{ width: 80, height: 80, borderRadius: 16, background: 'rgba(57,119,84,0.1)', border: `1px solid rgba(57,119,84,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 28, fontWeight: 900, color: C.primary }}>{initials}</span>
                                        </div>
                                    )}
                                    {isEditing && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            style={{ position: 'absolute', bottom: -8, right: -8, width: 28, height: 28, borderRadius: '50%', background: C.primary, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            {uploadingImage
                                                ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                : <Camera size={13} color="#fff" />
                                            }
                                        </button>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <p style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>{infName}</p>
                                        {influencer?.verified && <span style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#10B981' }}>Verified ✓</span>}
                                    </div>
                                    {!isEditing && <p style={{ fontSize: 15, color: C.textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {currentUser?.email}</p>}
                                    {isEditing && <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Click the camera icon to upload photo</p>}
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {/* Name */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Creator Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputCls} placeholder="Your creator name" onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>

                                    {/* City + Area */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>City</label>
                                            <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ ...inputClsPlain, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                                                <option value="">Select city</option>
                                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Area</label>
                                            <input value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} style={inputClsPlain} placeholder="Your area" onFocus={focusIn} onBlur={focusOut} />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Category</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ ...inputClsPlain, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                                            <option value="">Select category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                        {[
                                            { label: 'Followers', key: 'followers' },
                                            { label: 'Avg Likes', key: 'avgLikes' },
                                            { label: 'Price/Post (₹)', key: 'pricePerPost' },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.label}</label>
                                                <input type="number" value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: parseInt(e.target.value) || 0 })} style={inputClsPlain} onFocus={focusIn} onBlur={focusOut} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Engagement preview */}
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Est. Engagement Rate</p>
                                        <div style={{ padding: '12px 16px', background: 'rgba(57,119,84,0.1)', borderRadius: 10, fontSize: 16, fontWeight: 800, color: C.primary, display: 'inline-block' }}>
                                            {formData.followers > 0 ? ((formData.avgLikes / formData.followers) * 100).toFixed(1) : 0}%
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Instagram Handle</label>
                                            <div style={{ position: 'relative' }}>
                                                <Instagram size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                                <input value={formData.instagram || ''} onChange={e => setFormData({ ...formData, instagram: e.target.value })} style={inputCls} placeholder="@yourhandle" onFocus={focusIn} onBlur={focusOut} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>YouTube Channel</label>
                                            <div style={{ position: 'relative' }}>
                                                <Youtube size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                                <input value={formData.youtube || ''} onChange={e => setFormData({ ...formData, youtube: e.target.value })} style={inputCls} placeholder="Channel name or URL" onFocus={focusIn} onBlur={focusOut} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Bio</label>
                                        <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={4} style={{ ...inputClsPlain, resize: 'vertical' }} placeholder="Tell brands about yourself..." onFocus={focusIn} onBlur={focusOut} />
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 16, paddingTop: 12 }}>
                                        <button onClick={handleSave} className="btn-primary" disabled={saving || !formData.name || !formData.city || !formData.category} style={{ opacity: saving || !formData.name || !formData.city || !formData.category ? 0.6 : 1, width: '100%' }}>
                                            {saving ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Check size={18} />}
                                            {saving ? 'Saving...' : 'Save Profile'}
                                        </button>
                                        {!isSetup && <button onClick={() => { setFormData(influencer); setIsEditing(false); }} className="btn-outline" style={{ width: '100%' }}><X size={18} /> Cancel</button>}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {[
                                        { label: 'Location', icon: <MapPin size={18} />, value: `${influencer?.city}${influencer?.area ? `, ${influencer.area}` : ''}` },
                                        { label: 'Category', icon: <Tag size={18} />, value: influencer?.category, badge: true },
                                        { label: 'Followers', icon: <Users size={18} />, value: formatNumber(influencer?.followers || 0) },
                                        { label: 'Engagement', icon: <BarChart2 size={18} />, value: `${influencer?.engagementRate || 0}%` },
                                        { label: 'Price / Post', icon: <DollarSign size={18} />, value: formatCurrency(influencer?.pricePerPost || 0) },
                                        { label: 'Email', icon: <Mail size={18} />, value: currentUser?.email },
                                    ].map(({ label, icon, value, badge }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: `1px solid ${C.border}` }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>{icon}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>{label}</span>
                                                {badge
                                                    ? <span style={{ padding: '4px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 13, fontWeight: 700, color: C.text, display: 'inline-block', width: 'fit-content' }}>{value}</span>
                                                    : <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{value}</span>}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Social links */}
                                    {(influencer?.instagram || influencer?.youtube) && (
                                        <div style={{ padding: '20px 0', borderBottom: `1px solid ${C.border}` }}>
                                            <p style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, marginBottom: 12 }}>Social Links</p>
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                {influencer.instagram && (
                                                    <a href={`https://instagram.com/${influencer.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                                                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.2)', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#E1306C', textDecoration: 'none' }}>
                                                        <Instagram size={14} /> {influencer.instagram}
                                                    </a>
                                                )}
                                                {influencer.youtube && (
                                                    <a href={`https://youtube.com/${influencer.youtube}`} target="_blank" rel="noreferrer"
                                                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#FF0000', textDecoration: 'none' }}>
                                                        <Youtube size={14} /> {influencer.youtube}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {influencer?.bio && (
                                        <div style={{ paddingTop: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                <FileText size={18} color={C.primary} />
                                                <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Bio</p>
                                            </div>
                                            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.8, margin: 0, padding: 20, background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>{influencer.bio}</p>
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

export default function InfluencerProfilePage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F5F5DC' }} />}>
            <InfluencerProfilePageInner />
        </Suspense>
    );
}