'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Briefcase, MessageCircle, User, Send, Handshake } from 'lucide-react';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { formatTime, getInitials } from '@/lib/utils';
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

export default function InfluencerMessagesPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [influencer, setInfluencer] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const infNav = [
        { href: '/influencer/dashboard', icon: <TrendingUp size={18} />, label: 'Dashboard' },
        { href: '/influencer/opportunities', icon: <Briefcase size={18} />, label: 'Opportunities' },
        { href: '/influencer/offers', icon: <Handshake size={18} />, label: 'Offers' },
        { href: '/influencer/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
        { href: '/influencer/profile', icon: <User size={18} />, label: 'Profile' },
    ];

    useEffect(() => {
        const init = async () => {
            const user = await storage.getCurrentUser();
            if (!user || user.role !== 'influencer') { router.push('/login'); return; }
            setCurrentUser(user);
            const infProfile = await storage.getInfluencerByUserId(user.id);
            if (!infProfile) { router.push('/influencer/profile?setup=true'); return; }
            setInfluencer(infProfile);

            // Check for new conversation request in URL
            const urlParams = new URLSearchParams(window.location.search);
            const startChatWithUserId = urlParams.get('userId');

            await loadConversations(user.id, startChatWithUserId);

            // Clean URL gracefully without refreshing
            if (startChatWithUserId) {
                router.replace('/influencer/messages', { scroll: false });
            }

            setLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const loadConversations = async (userId, startChatWithUserId = null) => {
        const [allMessages, allShops] = await Promise.all([storage.getMessages(), storage.getShops()]);
        const conversationMap = new Map();

        allMessages.forEach(msg => {
            if (msg.senderId === userId || msg.receiverId === userId) {
                const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
                if (!conversationMap.has(partnerId) || new Date(msg.timestamp) > new Date(conversationMap.get(partnerId).lastMessageTime)) {
                    conversationMap.set(partnerId, { userId: partnerId, lastMessage: msg.text, lastMessageTime: msg.timestamp });
                }
            }
        });

        // Add dummy conversation if starting a brand new one
        if (startChatWithUserId && !conversationMap.has(startChatWithUserId)) {
            conversationMap.set(startChatWithUserId, {
                userId: startChatWithUserId,
                lastMessage: 'New conversation...',
                lastMessageTime: new Date().toISOString()
            });
        }

        const convos = Array.from(conversationMap.values()).map(convo => {
            const shop = allShops.find(s => s.userId === convo.userId);
            return { ...convo, partnerName: shop?.businessName || 'Unknown', shop };
        }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        setConversations(convos);

        // Auto-select the newly requested conversation if provided
        if (startChatWithUserId) {
            const newConvo = convos.find(c => c.userId === startChatWithUserId);
            if (newConvo) await selectConversation(newConvo, userId);
        } else if (convos.length > 0 && !selectedConversation) {
            await selectConversation(convos[0], userId);
        }
    };

    const selectConversation = async (convo, userId) => {
        setSelectedConversation(convo);
        const msgs = await storage.getConversation(userId || currentUser.id, convo.userId);
        setMessages(msgs);
    };

    // Listen for incoming messages dynamically using Supabase Realtime
    useEffect(() => {
        if (!selectedConversation || !currentUser) return;
        
        const channel = supabase
            .channel('realtime_messages_inf')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                const newMsg = payload.new;
                // If the new message involves us and our currently selected partner (and isn't from us since we optimistic UI it)
                if (newMsg.sender_id === selectedConversation.userId && newMsg.receiver_id === currentUser.id) {
                    const incomingMsg = {
                        id: newMsg.id,
                        senderId: newMsg.sender_id,
                        receiverId: newMsg.receiver_id,
                        text: newMsg.text,
                        timestamp: newMsg.created_at,
                    };
                    setMessages(prev => [...prev, incomingMsg]);
                    
                    // Also update the sidebar preview
                    setConversations(prev => prev.map(c =>
                        c.userId === selectedConversation.userId
                            ? { ...c, lastMessage: incomingMsg.text, lastMessageTime: incomingMsg.timestamp }
                            : c
                    ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));
                } else if (newMsg.receiver_id === currentUser.id) {
                    // Update sidebar if someone else messages us while we have another chat open
                    setConversations(prev => prev.map(c =>
                        c.userId === newMsg.sender_id
                            ? { ...c, lastMessage: newMsg.text, lastMessageTime: newMsg.created_at }
                            : c
                    ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation, currentUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        // Ensure we send to the actual auth User ID 
        const targetUserId = selectedConversation.userId;

        const message = {
            senderId: currentUser.id, // Current authenticated user
            receiverId: targetUserId, // Target authenticated user
            text: newMessage.trim()
        };

        try {
            await storage.addMessage(message);
            // instantly reflect in UI
            setMessages(prev => [...prev, { ...message, timestamp: new Date().toISOString() }]);
            setNewMessage('');

            // update conversation sidebar preview
            setConversations(prev => prev.map(c =>
                c.userId === targetUserId
                    ? { ...c, lastMessage: message.text, lastMessageTime: message.timestamp }
                    : c
            ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));

        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Could not send message. Please try again.");
        }
    };

    const handleLogout = async () => { await storage.logout(); router.push('/'); };

    const sidebarUser = { name: influencer?.name || '…', subtitle: influencer?.city || '', initials: getInitials(influencer?.name || ''), profileHref: '/influencer/profile' };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
            <Sidebar navItems={infNav} user={sidebarUser} onLogout={handleLogout} />

            <main style={{ marginLeft: 280, height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, padding: '24px 24px 24px 0' }}>
                {loading ? (
                    <div style={{ flex: 1, padding: 24 }}>
                        <div style={{ height: 32, width: 240, background: C.border, borderRadius: 8, marginBottom: 24, animation: 'pulse 2s infinite' }} />
                        <div style={{ height: 'calc(100vh - 104px)', background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, animation: 'pulse 2s infinite' }} />
                    </div>
                ) : (
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
                            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Messages</h1>
                            <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                        </div>

                        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                            {/* Conversations list */}
                            <div style={{ width: 320, borderRight: `1px solid ${C.border}`, background: '#FAFAFA', overflowY: 'auto', flexShrink: 0 }}>
                                {conversations.length === 0 ? (
                                    <div style={{ padding: 32, textAlign: 'center' }}>
                                        <MessageCircle size={32} color={C.textMuted} style={{ marginBottom: 16, opacity: 0.5 }} />
                                        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>No conversations yet</p>
                                        <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>Businesses will contact you here</p>
                                    </div>
                                ) : conversations.map(convo => {
                                    const isSelected = selectedConversation?.userId === convo.userId;
                                    return (
                                        <button key={convo.userId} onClick={() => selectConversation(convo)} style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                                            textAlign: 'left', border: 'none', borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
                                            background: isSelected ? 'rgba(57,119,84,0.08)' : 'transparent', transition: 'background 0.15s',
                                        }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: isSelected ? C.primary : C.surface, border: `1px solid ${isSelected ? 'transparent' : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ fontSize: 15, fontWeight: 800, color: isSelected ? '#fff' : C.textMuted }}>{getInitials(convo.partnerName)}</span>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 15, fontWeight: 700, color: isSelected ? C.primary : C.text, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{convo.partnerName}</p>
                                                <p style={{ fontSize: 13, color: isSelected ? C.text : C.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{convo.lastMessage}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Chat */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.surface }}>
                                {selectedConversation ? (
                                    <>
                                        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(57,119,84,0.1)', border: `1px solid rgba(57,119,84,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: 15, fontWeight: 800, color: C.primary }}>{getInitials(selectedConversation.partnerName)}</span>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 2px' }}>{selectedConversation.partnerName}</p>
                                                <p style={{ fontSize: 13, color: '#10B981', margin: 0, fontWeight: 600 }}>● Online</p>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, background: '#FAFAFA' }}>
                                            {messages.map((msg, idx) => {
                                                const isMe = msg.senderId === currentUser.id;
                                                return (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                        <div style={{ maxWidth: '65%', padding: '12px 18px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: isMe ? C.primary : C.surface, border: isMe ? 'none' : `1px solid ${C.border}`, boxShadow: isMe ? '0 4px 12px rgba(57,119,84,0.2)' : '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                            <p style={{ fontSize: 15, color: isMe ? '#fff' : C.text, margin: '0 0 6px', lineHeight: 1.5 }}>{msg.text}</p>
                                                            <p style={{ fontSize: 11, fontWeight: 600, color: isMe ? 'rgba(255,255,255,0.7)' : C.textMuted, margin: 0, textAlign: isMe ? 'right' : 'left' }}>{formatTime(msg.timestamp)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                        <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Write a message..." style={{ flex: 1, padding: '14px 20px', background: '#FAFAFA', border: `1px solid ${C.border}`, borderRadius: 24, color: C.text, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border} />
                                            <button type="submit" disabled={!newMessage.trim()} style={{ width: 48, height: 48, borderRadius: '50%', background: newMessage.trim() ? C.primary : '#FAFAFA', border: `1px solid ${newMessage.trim() ? 'transparent' : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, boxShadow: newMessage.trim() ? '0 4px 12px rgba(57,119,84,0.25)' : 'none', transition: 'all 0.2s' }}>
                                                <Send size={18} color={newMessage.trim() ? '#fff' : C.textMuted} style={{ transform: 'translateX(-1px)' }} />
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 64, background: '#FAFAFA' }}>
                                        <div>
                                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                                <MessageCircle size={32} color={C.textMuted} />
                                            </div>
                                            <p style={{ color: C.text, fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Select a conversation</p>
                                            <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>Choose from the left to start chatting</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <style>{`input::placeholder { color: #94A3B8; }`}</style>
        </div>
    );
}
