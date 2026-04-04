// Initialize data helper - client side only
'use client';

import { storage } from './storage';
import { mockInfluencers, mockShops, mockCollaborations, mockMessages } from './mockData';

export function initializeData() {
    if (typeof window === 'undefined') return;

    // Check if already initialized
    const initialized = localStorage.getItem('localcollab_initialized');

    if (!initialized) {
        // Add demo users for shops
        mockShops.forEach((shop) => {
            const existingUser = storage.getUserByEmail(shop.email);
            if (!existingUser) {
                storage.addUser({
                    id: shop.userId,
                    name: shop.businessName,
                    email: shop.email,
                    password: 'password', // Demo password
                    role: 'shop',
                });
            }
        });

        // Add demo users for influencers
        mockInfluencers.forEach((inf) => {
            const existingUser = storage.getUserByEmail(inf.email);
            if (!existingUser) {
                storage.addUser({
                    id: inf.userId,
                    name: inf.name,
                    email: inf.email,
                    password: 'password', // Demo password
                    role: 'influencer',
                });
            }
        });

        // Set mock data
        storage.setInfluencers(mockInfluencers);
        storage.setShops(mockShops);
        storage.setCollaborations(mockCollaborations);
        storage.setMessages(mockMessages);

        localStorage.setItem('localcollab_initialized', 'true');
    }
}
