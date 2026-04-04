'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Handshake, Mail, Lock, Eye, EyeOff, Users, Target, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

const inputStyle = {
    width: '100%', padding: '12px 12px 12px 40px',
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.text, fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
};

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
        if (authError) { setError('Invalid email or password. Please try again.'); setLoading(false); return; }
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).single();
        setLoading(false);
        if (profile?.role === 'shop') router.push('/shop/dashboard');
        else if (profile?.role === 'influencer') router.push('/influencer/dashboard');
        else setError('Account role not found. Please sign up again.');
    };

    const focusInput = e => e.target.style.borderColor = C.primary;
    const blurInput = e => e.target.style.borderColor = C.border;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif', background: C.bg }}>
            {/* Left branding */}
            <div style={{ display: 'none', flex: 1, background: C.surface, borderRight: `1px solid ${C.border}`, padding: '60px 80px', flexDirection: 'column', justifyContent: 'center' }} className="lg-show">
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, textDecoration: 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Handshake size={20} color="#fff" /></div>
                    <span style={{ fontSize: 24, fontWeight: 800, color: C.text }}>Local<span style={{ color: C.primary }}>Collab</span></span>
                </Link>
                <h1 style={{ fontSize: 48, fontWeight: 900, color: C.text, lineHeight: 1.1, marginBottom: 16 }}>Welcome<br /><span style={{ color: C.primary }}>Back!</span></h1>
                <p style={{ fontSize: 18, color: C.textMuted, lineHeight: 1.6, marginBottom: 48, maxWidth: 380 }}>Your influencer marketing platform for local businesses and authentic creators.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {[{ icon: <Users size={20} color={C.primary} />, t: 'Verified Creators', s: 'Connect with authentic influencers' }, { icon: <Target size={20} color={C.primary} />, t: 'AI Matching', s: '85%+ accuracy recommendations' }, { icon: <Zap size={20} color={C.primary} />, t: 'Fast Collaboration', s: 'Real-time messaging system' }].map(item => (
                        <div key={item.t} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                            <div><p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{item.t}</p><p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>{item.s}</p></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <div style={{ width: '100%', maxWidth: 420 }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 36 }} className="lg-hide">
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Handshake size={16} color="#fff" /></div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Local<span style={{ color: C.primary }}>Collab</span></span>
                    </Link>

                    <h2 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Sign in</h2>
                    <p style={{ fontSize: 15, color: C.textMuted, margin: '0 0 32px' }}>Enter your credentials to access your account</p>

                    {error && (
                        <div style={{ marginBottom: 24, padding: '14px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>{error}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Email address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color={C.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} placeholder="you@example.com" onFocus={focusInput} onBlur={blurInput} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color={C.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ ...inputStyle, paddingRight: 44 }} placeholder="••••••••" onFocus={focusInput} onBlur={blurInput} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{ padding: '14px', background: C.primary, border: 'none', borderRadius: 10, color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', marginTop: 8 }}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 14, color: C.textMuted, marginTop: 24 }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" style={{ color: C.primary, fontWeight: 700, textDecoration: 'none' }}>Sign up for free</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) { .lg-show { display: flex !important; } .lg-hide { display: none !important; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: #94A3B8; }
            `}</style>
        </div>
    );
}
