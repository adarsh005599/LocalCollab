'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Handshake, Mail, Lock, User, Building2, UserCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

const inputStyle = {
    width: '100%', padding: '12px 12px 12px 40px',
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
    color: C.text, fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

function focusIn(e) { e.target.style.borderColor = C.primary; }
function focusOut(e) { e.target.style.borderColor = C.border; }

function SignupPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
const allowedRoles = ["shop", "influencer", "admin"];
const roleFromUrl = allowedRoles.includes(searchParams.get("role"))
  ? searchParams.get("role")
  : null;
    const [step, setStep] = useState(roleFromUrl ? 2 : 1);
    const [formData, setFormData] = useState({ role: roleFromUrl || '', name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRoleSelect = (role) => { setFormData({ ...formData, role }); setStep(2); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        const { data, error: authError } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
        if (authError) { setError(authError.message); setLoading(false); return; }
        const { error: profileError } = await supabase.from('user_profiles').insert([{ id: data.user?.id, role: formData.role, name: formData.name }]);
        if (profileError) { setError('Account created but profile setup failed. Please try logging in.'); setLoading(false); return; }
        setLoading(false);
        router.push(formData.role === 'shop' ? '/shop/profile?setup=true' : '/influencer/profile?setup=true');
    };

    if (step === 1) return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: 560 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Handshake size={18} color="#fff" /></div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Local<span style={{ color: C.primary }}>Collab</span></span>
                </Link>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 40, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, textAlign: 'center', margin: '0 0 8px' }}>Join LocalCollab</h1>
                    <p style={{ fontSize: 15, color: C.textMuted, textAlign: 'center', margin: '0 0 32px' }}>Choose your account type to get started</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {[
                            { role: 'shop', Icon: Building2, label: 'Business / Shop', sub: 'Find local influencers to promote your business' },
                            { role: 'influencer', Icon: UserCircle, label: 'Influencer', sub: 'Get paid collaborations from local businesses' },
                        ].map(({ role, Icon, label, sub }) => (
                            <button key={role} onClick={() => handleRoleSelect(role)} style={{
                                padding: 24, background: C.bg, border: `2px solid transparent`, borderRadius: 16, cursor: 'pointer',
                                textAlign: 'left', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = 'rgba(57,119,84,0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = C.bg; }}>
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <Icon size={28} color={C.primary} />
                                </div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>{label}</p>
                                <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{sub}</p>
                            </button>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 14, color: C.textMuted, marginTop: 32 }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: C.primary, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
            <style>{`input::placeholder { color: #94A3B8; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const isShop = formData.role === 'shop';

    return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: 460 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Handshake size={16} color="#fff" /></div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Local<span style={{ color: C.primary }}>Collab</span></span>
                </Link>

                <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 24, transition: 'color 0.2s', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text} onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(57,119,84,0.1)', borderRadius: 20, fontSize: 13, fontWeight: 700, color: C.primary }}>
                        {isShop ? <Building2 size={14} /> : <UserCircle size={14} />}
                        {isShop ? 'Business Account' : 'Influencer Account'}
                    </div>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Create your account</h2>
                <p style={{ fontSize: 15, color: C.textMuted, margin: '0 0 32px' }}>Fill in your details to get started</p>

                {error && <div style={{ marginBottom: 24, padding: '14px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>{error}</div>}

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                            { label: 'Full Name', key: 'name', type: 'text', Icon: User, placeholder: isShop ? 'Business owner name' : 'Your creator name' },
                            { label: 'Email address', key: 'email', type: 'email', Icon: Mail, placeholder: 'you@example.com' },
                        ].map(({ label, key, type, Icon, placeholder }) => (
                            <div key={key}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>{label}</label>
                                <div style={{ position: 'relative' }}>
                                    <Icon size={18} color={C.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input type={type} required value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} style={inputStyle} placeholder={placeholder} onFocus={focusIn} onBlur={focusOut} />
                                </div>
                            </div>
                        ))}
                        <div>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color={C.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ ...inputStyle, paddingRight: 44 }} placeholder="Min. 6 characters" onFocus={focusIn} onBlur={focusOut} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{ padding: 16, background: C.primary, border: 'none', borderRadius: 10, color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8, transition: 'all 0.2s' }}>
                            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Creating account...</span> : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', fontSize: 14, color: C.textMuted, marginTop: 24 }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: C.primary, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
            <style>{`input::placeholder { color: #94A3B8; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F5F5DC' }} />}>
            <SignupPageInner />
        </Suspense>
    );
}