/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState,useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Handshake, Search, ArrowRight, Star, Store, MapPin,
    Instagram, Target, Menu, X, CheckCircle, MessageSquare,ChevronDown 
} from 'lucide-react';
import { FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import SearchBar from './search';// Add to your imports at top (already have Handshake, ArrowRight from lucide)
import ChatWidget from '../components/ChatWidget';
/* ─── Theme colours ─── */
const C = {
    bg: '#FFF7ED', // Soft Cream
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

const COLORS = {
  /* ===============================
     
     =============================== */
  ACCENT: 'sb-green',          // Primary action / highlights
  ACCENT_LIGHT: 'sb-sage',     // Soft accents / borders / hovers

  /* ===============================
     TEXT COLORS
     =============================== */
  DARK_TEXT: 'sb-forest',      // Main headings & body text
  SUBTLE_TEXT: 'sb-forest/70', // Paragraphs, descriptions, hints

  /* ===============================
     BACKGROUNDS
     =============================== */
  LIGHT_BG: 'sb-cream',        // Page background
  CARD_BG: 'white',            // Cards stay white (clean contrast)
  SUBTLE_BG: 'sb-sage/10',     // Soft section backgrounds

  /* ===============================
     BORDERS & DIVIDERS
     =============================== */
  BORDER: 'sb-sage/30',        // Subtle, premium borders
};


const PHRASES = [
  "the right talent",
  "local creators",
  "authentic voices",
  "micro-influencers",
  "verified brands",
];

function TypingText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIndex];
    let timeout;

    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIndex((phraseIndex + 1) % PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIndex]);

  return (
    <span style={{ color: '#16A34A' }}>
      {displayed}
      <span style={{
        display: 'inline-block', width: 3, height: '0.9em',
        background: '#EB6B40', marginLeft: 3, verticalAlign: 'middle',
        animation: 'blink 0.7s step-end infinite'
      }} />
    </span>
  );
}
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className={`border-b pl-4 pr-4 border-${COLORS.BORDER}`}>
            <button
                onClick={onClick}
                className={`w-full py-5 flex items-center justify-between text-left transition-colors ${isOpen ? `text-${COLORS.ACCENT}` : `text-${COLORS.DARK_TEXT} hover:text-${COLORS.ACCENT}`}`}
            >
                <span className={`text-base md:text-lg font-medium text-${COLORS.DARK_TEXT}`}>{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className={`w-5 h-5 text-${COLORS.ACCENT}`} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className={`pb-5 text-${COLORS.SUBTLE_TEXT} leading-relaxed text-sm md:text-base`}>{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
const faqData = [
    {
        question: "Who is LocalCollab for?",
        answer: "LocalCollab is designed for local businesses (shopkeepers, cafés, startups) looking for affordable marketing, and beginner or micro-influencers who want to collaborate and grow their audience through real brand partnerships."
    },
    {
        question: "How does the AI matchmaking work?",
        answer: "Our AI system analyzes location, content niche, audience type, budget range, and engagement metrics to recommend the most relevant influencers to businesses and suitable collaboration opportunities to influencers."
    },
    {
        question: "Do influencers lose commission on earnings?",
        answer: "No. Influencers have full control over their pricing and keep 100% of their earnings. LocalCollab does not take any commission from collaborations."
    },
    {
        question: "How do businesses find influencers within their budget?",
        answer: "Businesses can use smart filters to sort influencers based on pricing, niche, and engagement level. This allows even small businesses to find affordable marketing options that fit their budget."
    },
    {
        question: "Is there a subscription fee?",
        answer: "Yes. Businesses pay a yearly subscription to access the platform, browse influencers, and initiate collaborations. Influencers can join and showcase their profiles for free."
    },
  
];

export default function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [openFaq, setOpenFaq] = useState(null);
    const [menu, setMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCity, setSearchCity] = useState('');
const filteredFaqData = faqData.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ); 
    const [scrolled, setScrolled] = useState(false);
      useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const brandsBrands = [
        "Artisan Bakery, Pune",
        "FitZone Gym, Hyderabad",
        "Ethnic Studio, Jaipur",
        "Organic Skincare, Mumbai"
    ];
const handleFaqClick = (index) => {
    setOpenFaq(prev => (prev === index ? null : index));
};

return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: C.bg, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>

            {/* ── NAVBAR ── */}
             <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/40 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Handshake size={22} color="#fff" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">
                           <span className='text-emerald-500'>Local</span> <span className="text-emerald-600">Collab</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {['Solutions', 'Find Creators', 'Pricing', 'Case Studies'].map(item => (
                            <a key={item} href="#" className="text-sm font-bold text-green-700 hover:text-emerald-600 transition-colors">{item}</a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm  text-green-700 font-bold hover:text-emerald-600 transition-colors">Sign In</Link>
                        <Link href="/signup" className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105  shadow-emerald-200">
                            Get Started
                        </Link>
                    </div>

                    <button onClick={() => setMenu(!menu)} className="md:hidden p-2">
                        {menu ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section
                className="hero-mesh"
                style={{
                    '--hero-bg': "url('/hero-bg.jpg')",
                    paddingTop: 130,
                    paddingBottom: 80,
                    minHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
<h1 className="animate-fade-up" style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 24px', color: '#ffffff' }}>
  Grow your community when you have{' '}
  <TypingText />
</h1>

                    <p className="animate-fade-up-delay-1" style={{ fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6, color: '#e0e0e0', maxWidth: 700, margin: '0 auto 48px' }}>
                        Find verified creators, in-demand brand opportunities, and the solutions you need to build authentic community marketing.
                    </p>

<SearchBar
  C={C}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  searchCity={searchCity}
  setSearchCity={setSearchCity}
/>

                </div>
                
            </section>
             {/* ── STATS ── */}
            <section className="py-10 bg-emerald-900 text-white">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Verified Creators', value: '1K+' },
                        { label: 'Successful Collabs', value: '300+' },
                        { label: 'Avg. ROI Growth', value: '3.2x' },
                        { label: 'Active Cities', value: '10+' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <h3 className="text-3xl md:text-4xl font-black text-emerald-400 mb-1">{stat.value}</h3>
                            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-emerald-100/60">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* ── OUR SERVICES (Weboxi Style) ── */}
            <section style={{ padding: '100px 24px', background: C.surface }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.secondary, marginBottom: 12 }}>✦ Our Platform Solutions ✦</p>
                            <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 900, color: C.text, margin: 0 }}>Built the Future of Growth<br />Through Community.</h2>
                        </div>
                        <Link href="/signup" className="btn-outline">Explore Features <ArrowRight size={18} /></Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                        {/* Service Card 1 */}
                        <div className="card" style={{ padding: 40 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(57,119,84,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Store size={32} color={C.primary} />
                            </div>
                            <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>For Businesses</h3>
                            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.6, marginBottom: 24 }}>Find skilled creators, launch local campaigns, and reach your target audience without the agency fees or guesswork.</p>
                            <Link href="/signup?role=shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: C.primary, textDecoration: 'none' }}>Find your next creator <ArrowRight size={16} /></Link>
                        </div>

                        {/* Service Card 2 */}
                        <div className="card" style={{ padding: 40 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(235,107,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Instagram size={32} color={C.secondary} />
                            </div>
                            <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>For Content Creators</h3>
                            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.6, marginBottom: 24 }}>Connect with verified local businesses looking for your exact skills. Negotiate directly and monetize your audience.</p>
                            <Link href="/signup?role=influencer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: C.secondary, textDecoration: 'none' }}>Find your next collab <ArrowRight size={16} /></Link>
                        </div>

                        {/* Service Card 3 */}
                        <div className="card" style={{ padding: 40, background: C.primary, color: '#fff', borderColor: C.primary }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Target size={32} color="#fff" />
                            </div>
                            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Smart AI Matching</h3>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 24 }}>Our intelligent matching algorithm analyzes engagement rates, city constraints, and budgets to find the perfect 99% match instantly.</p>
                            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>See how it works <ArrowRight size={16} /></Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TWO SIDES (Split approach) ── */}
            <section style={{ padding: '0 0', display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 50%', background: C.bg, padding: '100px 5%' }}>
                    <div style={{ maxWidth: 500, margin: '0 0 0 auto' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(57,119,84,0.1)', color: C.primary, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                            <CheckCircle size={16} /> Verified Quality
                        </div>
                        <h2 style={{ fontSize: 'clamp(32px,4vw,44px)', fontWeight: 900, color: C.text, margin: '0 0 20px', lineHeight: 1.2 }}>Scale your brand<br />locally, faster.</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                            {['Create a free brand profile in minutes', 'Search 1,000+ verified Indian creators', 'Directly message and negotiate terms', 'Zero commission. Zero middleman fees.'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: 16, color: C.textMuted }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <CheckCircle size={12} color="#fff" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup?role=shop" className="btn-primary">Browse Creators</Link>
                    </div>
                </div>

                <div style={{ flex: '1 1 50%', background: C.surface, padding: '100px 5%', borderLeft: `1px solid ${C.border}` }}>
                    <div style={{ maxWidth: 500, margin: '0 auto 0 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(235,107,64,0.1)', color: C.secondary, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                            <MessageSquare size={16} /> Authentic Influence
                        </div>
                        <h2 style={{ fontSize: 'clamp(32px,4vw,44px)', fontWeight: 900, color: C.text, margin: '0 0 20px', lineHeight: 1.2 }}>Monetize your<br />audience safely.</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                            {['Set your own rates and schedule', 'Collaborate only with verified businesses', 'Automatic engagement calculation', 'Get matched with relevant brands'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: 16, color: C.textMuted }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <CheckCircle size={12} color="#fff" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup?role=influencer" className="btn-secondary">Find Opportunities</Link>
                    </div>
                </div>
            </section>

            <section id="faq" className={`py-20 bg-white`}>
                <div className="max-w-4xl mx-auto px-6">
                    
                    {/* Section Header */}
                    <h2 className={`text-3xl md:text-5xl font-extrabold mb-4 text-${COLORS.DARK_TEXT} text-center`}>
                        Frequently Asked Questions
                    </h2>
                    
                    <p className="text-lg text-gray-500 mb-10 text-center">
                        Can't find an answer? Search below or reach out to our team.
                    </p>

<div className="w-full flex items-center justify-center mb-12">
  <div className={`
      w-full max-w-3xl 
      relative 
      rounded-xl 
      p-[1.5px] 
      bg-sb-forest/80
      shadow-lime-900
      backdrop-blur-2xl
      borde-2r border-x-lime-800
  `}>
    <div className={`rounded-2xl bg-${COLORS.CARD_BG} p-0`}>
      <input
        type="text"
        placeholder="Search questions (e.g., 'fees' or 'matching')"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`
            w-full px-5 py-3 pl-12 
            rounded-2xl
            text-lg text-${COLORS.DARK_TEXT}
            bg-${COLORS.CARD_BG} placeholder-sb-forest 
            outline-none font-bitcount font-medium
            transition-all duration-300
            focus:ring-2 focus:ring-${COLORS.ACCENT}
            focus:shadow-[0_0_20px_var(--tw-ring-color)]
            border border-transparent hover:border-x-lime-950 shadow-2xl
          `}
      />

      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sb-forest" />
    </div>
  </div>
</div>

                    
                    {/* Accordion List */}
                    <div className={`rounded-xl  bg-sb-sage/55 text-black font-medium   shadow-xl divide-y divide-${COLORS.BORDER} border-2 border-${COLORS.BORDER}`}>
                        {filteredFaqData.length > 0 ? (
                            filteredFaqData.map((item, i) => (
                                <AccordionItem
                                    key={i}
                                    question={item.question}
                                    answer={item.answer}
                                    isOpen={openFaq === i}
                                    onClick={() => handleFaqClick(i)}
                                />
                            ))
                        ) : (
                            <div className={`text-center font-bitcount font-medium py-10 text-xl text-${COLORS.SUBTLE_TEXT}`}>
                                No results found for "{searchTerm}".
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center mt-12">
                        <a href="https://forms.gle/5Ny1eNPYpp2dYMMW6" className={`text-${COLORS.ACCENT} font-semibold hover:text-lime-800 transition duration-200`}>
Still confused? Ask your question & get a quick reply →                        </a>
                    </div>

                </div>
            </section>

           {/* ── FOOTER ── */}
<footer style={{ background:  "#1B2A22", color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative' }}>

    {/* Big brand statement strip - REPLACE the inner div */}
<div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '28px 24px' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        
        {/* Left text */}
        <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.primaryLight, margin: '0 0 6px' }}>
                ✦ Connecting India's Local Economy ✦
            </p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#fff', fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 1.1 }}>
                Grow <span style={{ color: C.primary }}>Local.</span>{' '}
                Go <span style={{ WebkitTextStroke: '1.5px ' + C.primary, color: 'transparent' }}>Viral.</span>
            </h2>
        </div>

        {/* Right CTA */}
        <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', background: C.primary, color: '#fff',
            borderRadius: 100, fontSize: 15, fontWeight: 700, textDecoration: 'none',
            whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0
        }}
            onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
            onMouseLeave={e => e.currentTarget.style.background = C.primary}
        >
            Get Started Free <ArrowRight size={16} />
        </Link>
    </div>
</div>

    {/* Main footer grid */}
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 48px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }} className="footer-grid">

        {/* Brand col */}
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Handshake size={22} color="#fff" />
                </div>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>Local<span style={{ color: C.primaryLight }}>Collab</span></span>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 280, marginBottom: 32 }}>
                The smartest way to connect Indian local businesses with authentic, vetted micro-influencers.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 12 }}>
                {[
                    { Icon: FaInstagram, color: '#E1306C', href: '#' },
                    { Icon: FaLinkedin, color: '#0077B5', href: '#' },
                    { Icon: FaWhatsapp, color: '#25D366', href: '#' },
                ].map(({ Icon, color, href }, i) => (
                    <a key={i} href={href} style={{
                        width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color, fontSize: 18, textDecoration: 'none', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <Icon />
                    </a>
                ))}
            </div>
        </div>

        {/* Platform */}
        <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Platform</h4>
            {['Find Influencers', 'Post an Opportunity', 'AI Matching Tool', 'Pricing & Plans', 'Success Stories'].map(l => (
                <a key={l} href="#" style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>{l}</a>
            ))}
        </div>

        {/* Company */}
        <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Company</h4>
            {['About Us', 'Meet the Team', 'Blog & Insights', 'Careers', 'Contact Us'].map(l => (
                <a key={l} href="#" style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>{l}</a>
            ))}
        </div>

        {/* Legal + Contact */}
        <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Legal</h4>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Support & Trust'].map(l => (
                <a key={l} href="#" style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>{l}</a>
            ))}
            <div style={{ marginTop: 28, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Contact Team</p>
                <a href="mailto:localcollab@gmail.com" style={{ display: 'block', fontSize: 13, color: C.primaryLight, textDecoration: 'none', marginBottom: 4 }}>localcollab@gmail.com</a>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Replies within 24 hours</p>
            </div>
        </div>
    </div>

    {/* Join role badges */}
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                    { label: 'Join as Business', href: '/signup?role=shop' },
                    { label: 'Join as Influencer', href: '/signup?role=influencer' },
                    { label: 'AI Matching', href: '/signup' },
                    { label: 'View Pricing', href: '#' },
                ].map(({ label, href }) => (
                    <Link key={label} href={href} style={{
                        padding: '7px 16px', background: 'rgba(57,119,84,0.15)', color: C.primaryLight,
                        border: `1px solid rgba(57,119,84,0.3)`, borderRadius: 8,
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(57,119,84,0.15)'; e.currentTarget.style.color = C.primaryLight; }}
                    >{label}</Link>
                ))}
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontStyle: 'italic', fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                    Accelerating India's<br />Local Creators.
                </p>
            </div>
        </div>
    </div>

    {/* Bottom bar */}
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>© 2025 LocalCollab. All rights reserved.</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0, fontStyle: 'italic' }}>Where local brands rise, no matter where you start</p>
    </div>
</footer>

<style>{`
    @media (max-width: 900px) {
        .footer-grid { grid-template-columns: 1fr 1fr !important; }
    }
    @media (max-width: 560px) {
        .footer-grid { grid-template-columns: 1fr !important; }
    }
`}</style>
            <style>{`
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: flex !important; }
                }
                @media (min-width: 769px) {
                    .show-mobile { display: none !important; }
                    .hidden-mobile { display: flex !important; }
                }
            `}</style>
            <ChatWidget />
        </div>
    );
}
